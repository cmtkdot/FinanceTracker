import { compare } from 'bcrypt';
import { storage } from './storage';
import { User } from '@shared/schema';
import { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import memorystore from 'memorystore';

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
  // Configure session with PostgreSQL store in production
  // For this example, we're using memory store which is not suitable for production
  const MemoryStore = memorystore(session);
  
  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'keyboard cat',
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      },
      store: new MemoryStore({
        checkPeriod: 86400000, // prune expired entries every 24h
      }),
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());
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
