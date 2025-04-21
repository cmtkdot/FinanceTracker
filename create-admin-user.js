const { hashSync } = require('bcrypt');
const { db } = require('./server/db');
const { users } = require('./shared/schema');

async function createAdminUser() {
  try {
    // Check if the user already exists
    const existingUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, 'lamjonathon0@gmail.com')
    });

    if (existingUser) {
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
