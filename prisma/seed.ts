import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../lib/auth/password";

const prisma = new PrismaClient();

// BOILERPLATE-PLACEHOLDER: 과제 데이터·역할에 맞게 시드를 교체한다(관리자 계정은 유지 가능). 교체 후 이 주석을 지운다.
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
