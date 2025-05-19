import i18next, { TFunction } from "i18next";
import fs from "fs/promises";
import path from "path";

const localesPath = path.resolve("src/locales");

export async function loadTranslations(): Promise<TFunction<"translation", undefined>> {
  if (!i18next.isInitialized) {
    await i18next.init({
      fallbackLng: {
        "es-419": ["es-ES", "en-US"],
        default: ["en-US"],
      },
      ns: [],
      defaultNS: undefined,
      interpolation: { escapeValue: false },
    });
  }

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

  return i18next.t;
}