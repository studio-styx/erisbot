import i18next from "i18next";
import fs from "fs/promises";
import path from "path";

const localesPath = path.resolve("src/locales");

export async function loadTranslations() {
  // Inicialize o i18next primeiro
  if (!i18next.isInitialized) {
    await i18next.init({
      fallbackLng: "en",
      ns: [],
      defaultNS: undefined,
      interpolation: { escapeValue: false },
    });
  }

  // Carregue os arquivos de tradução
  const languages = await fs.readdir(localesPath);

  for (const lang of languages) {
    const sections = await fs.readdir(path.join(localesPath, lang));

    for (const section of sections) {
      const files = await fs.readdir(path.join(localesPath, lang, section));

      for (const file of files) {
        const filePath = path.join(localesPath, lang, section, file);
        const content = JSON.parse(await fs.readFile(filePath, "utf-8"));
        const namespace = `${section}/${file.replace(".json", "")}`;

        i18next.addResourceBundle(lang, namespace, content, true, true);
      }
    }
  }
}