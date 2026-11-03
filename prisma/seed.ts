import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../lib/auth/password";

const prisma = new PrismaClient();

async function main() {
  const password = process.env.SEED_ADMIN_PASSWORD ?? "admin12345";
  await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: { passwordHash: await hashPassword(password), role: "ADMIN" },
    create: {
      email: "admin@example.com",
      name: "Admin",
      passwordHash: await hashPassword(password),
      role: "ADMIN"
    }
  });
  console.log("Seed complete: admin@example.com");
}

main().finally(() => prisma.$disconnect());
