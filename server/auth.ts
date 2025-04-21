import { compare, hash } from 'bcrypt';
import { storage } from './storage';
import { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { User, Account } from '@shared/schema';

// Add declaration for express-session to include portalAccount property
declare module 'express-session' {
  interface SessionData {
    portalAccount?: Account;
  }
}

// Add declaration for Express.User
declare global {
  namespace Express {
    // Define User interface that matches the User type from schema.ts
    interface User {
      id: string;
      email: string;
      password: string;
      fullName: string;
      role: string;
      createdAt: Date;
      updatedAt: Date;
    }
  }
}

/**
 * Configure passport for authentication
 */
export function setupAuth(app: any) {
  console.log("Setting up authentication...");
  
  // Configure session
  const sessionConfig = {
    secret: process.env.SESSION_SECRET || 'finventory_default_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true in production with HTTPS
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    },
    store: storage.sessionStore
  };
  
  app.use(session(sessionConfig));
  app.use(passport.initialize());
  app.use(passport.session());
  
  // Admin authentication strategy
  passport.use(new LocalStrategy(
    { usernameField: 'email', passwordField: 'password' },
    async (email, password, done) => {
      try {
        console.log(`Login attempt with: ${email}`);
        
        // Find user by email
        const user = await storage.getUserByEmail(email);
        if (!user) {
          console.log(`No user found with email: ${email}`);
          return done(null, false, { message: 'Invalid email or password' });
        }
        
        // Compare password
        const isMatch = await compare(password, user.password);
        if (!isMatch) {
          console.log(`Invalid password for user: ${email}`);
          return done(null, false, { message: 'Invalid email or password' });
        }
        
        console.log(`User authenticated successfully: ${email}`);
        return done(null, user);
      } catch (error) {
        console.error('Authentication error:', error);
        return done(error);
      }
    }
  ));
  
  // User serialization and deserialization
  passport.serializeUser((user: Express.User, done) => {
    console.log(`Serializing user: ${user.id}`);
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id: string, done) => {
    try {
      console.log(`Deserializing user: ${id}`);
      const user = await storage.getUser(id);
      if (!user) {
        console.log(`User not found for ID: ${id}`);
        return done(null, false);
      }
      done(null, user);
    } catch (error) {
      console.error('Deserialization error:', error);
      done(error);
    }
  });
  
  // Debug middleware to log requests
  app.use((req: Request, _res: Response, next: NextFunction) => {
    if (req.path.includes('/api/')) {
      console.log(`${req.method} ${req.path} - Auth: ${req.isAuthenticated()} - Session: ${req.sessionID}`);
    }
    next();
  });
}

/**
 * Middleware to protect routes that require authentication
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Not authenticated' });
}

/**
 * Middleware to check portal authentication
 */
export function requirePortalAuth(req: Request, res: Response, next: NextFunction) {
  if (req.session.portalAccount) {
    return next();
  }
  res.status(401).json({ message: 'Portal access denied' });
}

/**
 * Helper function to hash a password
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return await hash(password, saltRounds);
}

/**
 * Create a test admin user if one doesn't exist
 */
export async function createTestAdminUser() {
  try {
    // Check if admin@example.com already exists
    const existingAdmin = await storage.getUserByEmail('admin@example.com');
    if (existingAdmin) {
      console.log('Test admin user already exists');
      return;
    }

    // Create admin user
    const hashedPassword = await hashPassword('admin123');
    const adminUser = await storage.createUser({
      email: 'admin@example.com',
      password: hashedPassword,
      fullName: 'Admin User',
      role: 'admin'
    });

    console.log('Test admin user created:', adminUser.id);
    
    // Check if Jonathon Lam already exists
    const existingJonathon = await storage.getUserByEmail('lamjonathon0@gmail.com');
    if (existingJonathon) {
      console.log('Jonathon Lam user already exists');
      return;
    }

    // Create Jonathon Lam user
    const jonathonPassword = await hashPassword('Lolhaha!123');
    const jonathonUser = await storage.createUser({
      email: 'lamjonathon0@gmail.com',
      password: jonathonPassword,
      fullName: 'Jonathon Lam',
      role: 'admin'
    });

    console.log('Jonathon Lam user created:', jonathonUser.id);
  } catch (error) {
    console.error('Error creating test users:', error);
  }
}