import { hash } from 'bcrypt';
import { db } from './server/db.js';
import { sql } from 'drizzle-orm';
import { users } from './shared/schema.js';

async function createTestUser() {
  const passwordHash = await hash('testpass123', 10);
  
  try {
    // Check if user exists
    const existingUser = await db.select().from(users).where(sql`${users.email} = ${'test@example.com'}`);
    
    if (existingUser.length === 0) {
      // Create a test user if none exists
      const [newUser] = await db.insert(users).values({
        email: 'test@example.com',
        password: passwordHash,
        fullName: 'Test User',
        role: 'admin',
      }).returning();
      
      console.log('Test user created:', newUser);
    } else {
      console.log('Test user already exists:', existingUser[0]);
    }
  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    process.exit(0);
  }
}

createTestUser();