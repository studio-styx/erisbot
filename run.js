import { execSync } from "child_process";

try {
  console.log("📦 Gerando prisma client...");
  execSync("npx prisma generate", { stdio: "inherit" });
  
  console.log("📦 Gerando prisma client da erisHelper...")
  execSync("npx prisma generate --schema prisma/erisHelper.prisma", { stdio: "inherit" })

  console.log("📦 Gerando prisma client do astronaut botlist...")
  execSync("npx prisma generate --schema prisma/devzone.prisma", { stdio: "inherit" })

  console.log("🚀 Iniciando o bot...");
  execSync("npm run start", { stdio: "inherit" });

} catch (error) {
  console.error("❌ Erro ao executar os comandos:", error);
  process.exit(1);
}
