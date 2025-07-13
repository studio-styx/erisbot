import { execSync } from "child_process";

try {
  console.log("📦 Gerando prisma client...");
  execSync("npx prisma generate", { stdio: "inherit" });

  console.log("🚀 Iniciando o bot...");
  execSync("npm run start", { stdio: "inherit" });

} catch (error) {
  console.error("❌ Erro ao executar os comandos:", error);
  process.exit(1);
}
