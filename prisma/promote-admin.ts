import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
async function main() {
  const email = process.argv.slice(2).find((argument) => argument !== "--")?.trim().toLowerCase();
  if (!email) {
    console.error("사용법: pnpm db:promote -- user@example.com");
    process.exitCode = 1;
    return;
  }
  try {
    const user = await prisma.user.update({ where: { email }, data: { role: "ADMIN" } });
    console.log(`${user.email} is now ADMIN`);
  } catch {
    console.error(`사용자를 찾을 수 없습니다: ${email}`);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

void main();
