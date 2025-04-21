import { compare } from 'bcrypt';
import { storage } from './storage';
import { User } from '@shared/schema';
import { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { IncomingMessage } from 'http';

// Add declaration for express-session to include portalAccount property
declare module 'express-session' {
  interface SessionData {
    portalAccount?: any;
  }
}

/**
 * Configure passport to use local strategy
 */
export function configurePassport() {
  // Main admin authentication strategy
  passport.use(
    'admin-local',
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password',
      },
      async (email, password, done) => {
        try {
          const user = await storage.getUserByEmail(email);
          
          if (!user) {
            console.log(`Login failed: No user found with email ${email}`);
            return done(null, false, { message: 'Invalid email or password' });
          }
          
          // Only allow users with admin role to log in via this strategy
          if (user.role !== 'admin' && user.role !== 'user') {
            console.log(`Login failed: User ${email} is not an admin or user`);
            return done(null, false, { message: 'Invalid email or password' });
          }
          
          const passwordMatch = await compare(password, user.password);
          
          if (!passwordMatch) {
            console.log(`Login failed: Password does not match for ${email}`);
            return done(null, false, { message: 'Invalid email or password' });
          }
          
          console.log(`Login successful for admin user: ${email} (ID: ${user.id})`);
          return done(null, user);
        } catch (error) {
          console.error(`Login error for ${email}:`, error);
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user: User, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
}

/**
 * Configure express session
 */
export function configureSession(app: any) {
  // Use the session store from our storage implementation
  // that was configured in DatabaseStorage
  
  // Set the secure cookie flag based on environment and add sameSite option
  const sessionOptions = {
    secret: process.env.SESSION_SECRET || 'keyboard_cat_finventory_secret_123',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Don't require HTTPS for Replit environment
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      sameSite: 'lax' as const // Allows the cookie to be sent with same-site navigation and top-level requests
    },
    store: storage.sessionStore // Use the session store from our DatabaseStorage
  };
  
  console.log("Session configuration:", {
    ...sessionOptions,
    secret: "[REDACTED]",
    store: "DatabaseStorage.sessionStore"
  });
  
  app.use(session(sessionOptions));
  app.use(passport.initialize());
  app.use(passport.session());
  
  // Debug middleware to validate session is working
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.path && req.path.includes('/api/auth')) {
      console.log('Auth Request:', { 
        path: req.path, 
        authenticated: req.isAuthenticated(),
        method: req.method,
        hasSession: !!req.session,
        sessionID: req.sessionID
      });
    }
    next();
  });
}

/**
 * Middleware to ensure user is authenticated as admin
 */
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    // Additional check to make sure user has proper role if needed
    return next();
  }
  res.status(401).json({ message: 'Unauthorized' });
}

/**
 * Middleware to ensure client portal user is authenticated
 */
export function isPortalAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.session && req.session.portalAccount) {
    console.log("Portal session authenticated:", req.session.portalAccount.id);
    return next();
  }
  console.log("Portal session not authenticated");
  res.status(401).json({ message: 'Portal access unauthorized' });
}

/**
 * Custom middleware to check the session status
 */
export function checkSession(req: Request, res: Response, next: NextFunction) {
  // Log the session status for debugging
  console.log('Session check:', {
    authenticated: req.isAuthenticated(),
    sessionID: req.sessionID,
    hasSession: !!req.session,
    user: req.user ? { id: req.user.id } : null
  });
  next();
}
