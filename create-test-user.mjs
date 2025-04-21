import { hashSync } from 'bcrypt';
import { db } from './server/db';
import { users } from './shared/schema';
import { eq } from 'drizzle-orm';

async function createTestUser() {
  try {
    // Check if the user already exists
    const existingUsers = await db.select().from(users).where(eq(users.email, 'admin@example.com'));
    
    if (existingUsers.length > 0) {
      console.log('Test user already exists');
      process.exit(0);
    }

    // Hash the password
    const hashedPassword = hashSync('admin123', 10);

    // Insert the user
    const [newUser] = await db.insert(users)
      .values({
        email: 'admin@example.com',
        password: hashedPassword,
        fullName: 'Test Admin',
        role: 'admin'
      })
      .returning();

    console.log('Test admin user created successfully:', newUser.id);
  } catch (error) {
    console.error('Error creating test admin user:', error);
  } finally {
    process.exit(0);
  }
}

createTestUser();
