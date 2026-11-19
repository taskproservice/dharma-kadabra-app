import pkg from "@prisma/client";
const { PrismaClient } = pkg;
import bcrypt from "bcryptjs";
import readline from "readline";

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function main() {
  console.log("--- Creando usuario administrador ---");
  const name = await question("Nombre completo: ");
  const email = await question("Correo electrónico: ");
  const password = await question("Contraseña: ");

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email: email },
    update: { password: hashedPassword, role: "ADMIN" },
    create: {
      name: name,
      email: email,
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log(`✅ Usuario ADMIN creado/actualizado: ${user.email}`);
  rl.close();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });