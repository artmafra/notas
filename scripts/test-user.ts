import { CreateUserSchema } from "@/db/schemas";
import { service } from "@/services";

async function testCreateUser() {
  try {
    console.log("Testing invoice creation...");

    const testUserData: CreateUserSchema = {
      email: "artmafra@teste.com",
      password: "test123456",
    };

    console.log("Test data:", testUserData);

    await service.user.createUser(testUserData);

    console.log("User created");
  } catch (error) {
    console.error("Error testing user creation:", error);
    process.exit(1);
  }
}

// Run the test
testCreateUser()
  .then(() => {
    console.log("Test completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Test failed:", error);
    process.exit(1);
  });
