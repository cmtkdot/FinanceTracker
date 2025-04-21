import { compare } from 'bcrypt';
import { storage } from './storage';
import { User } from '@shared/schema';
import { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import connectPgSimple from 'connect-pg-simple';
import { IncomingMessage } from 'http';
import { pool } from './db';

// Type declaration for bcrypt
declare module 'bcrypt';

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
  passport.use(
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password',
      },
      async (email, password, done) => {
        try {
          const user = await storage.getUserByEmail(email);
          
          if (!user) {
            return done(null, false, { message: 'Invalid email or password' });
          }
          
          const passwordMatch = await compare(password, user.password);
          
          if (!passwordMatch) {
            return done(null, false, { message: 'Invalid email or password' });
          }
          
          return done(null, user);
        } catch (error) {
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
  // Configure session with PostgreSQL store for better persistence
  const PostgreSqlStore = connectPgSimple(session);
  
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
    store: new PostgreSqlStore({
      pool,
      tableName: 'session', // Use the default table name
      createTableIfMissing: true // Create the session table if it doesn't exist
    })
  };
  
  console.log("Session configuration:", {
    ...sessionOptions,
    secret: "[REDACTED]",
    store: "PostgreSqlStore"
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
 * Middleware to ensure user is authenticated
 */
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Unauthorized' });
}
