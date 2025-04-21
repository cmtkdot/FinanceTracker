import { hashSync } from 'bcrypt';
import { db } from './server/db';
import { users } from './shared/schema';
import { eq } from 'drizzle-orm';

async function createAdminUser() {
  try {
    // Check if the user already exists
    const existingUsers = await db.select().from(users).where(eq(users.email, 'lamjonathon0@gmail.com'));
    
    if (existingUsers.length > 0) {
      console.log('User already exists');
      process.exit(0);
    }

    // Hash the password
    const hashedPassword = hashSync('Lolhaha!123', 10);

    // Insert the user
    const [newUser] = await db.insert(users)
      .values({
        email: 'lamjonathon0@gmail.com',
        password: hashedPassword,
        fullName: 'Admin User',
        role: 'admin'
      })
      .returning();

    console.log('Admin user created successfully:', newUser.id);
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    process.exit(0);
  }
}

createAdminUser();
