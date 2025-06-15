import { getCompatibilityInstructions } from "./browserCompatibility";

declare global {
  interface Window {
    ai?: {
      languageDetector?: {
        capabilities(): Promise<{ available: string }>;
        create(): Promise<LanguageDetector>;
      };
      translator?: {
        capabilities(): Promise<{ available: string }>;
        create(options: TranslatorOptions): Promise<Translator>;
      };
    };
    Translator?: {
      availability(options: {
        sourceLanguage: string;
        targetLanguage: string;
      }): Promise<string>;
      create(options: {
        sourceLanguage: string;
        targetLanguage: string;
        monitor?: (m: any) => void;
      }): Promise<Translator>;
    };
    LanguageDetector?: {
      availability(): Promise<string>;
      create(options?: {
        monitor?: (m: any) => void;
      }): Promise<LanguageDetector>;
    };
  }
}

type LanguageDetector = {
  detect(
    text: string
  ): Promise<Array<{ detectedLanguage: string; confidence: number }>>;
  ready: Promise<void>;
  destroy(): void;
};

type Translator = {
  translate(text: string): Promise<string>;
  ready: Promise<void>;
  destroy(): void;
};

type TranslatorOptions = {
  sourceLanguage: string;
  targetLanguage: string;
};

export type TranslationError = {
  title: string;
  message: string;
  instructions: string[];
};

export type DownloadProgress = {
  loaded: number;
  total?: number;
};

const AVAILABLE_LANGUAGES = ["en", "ja", "zh", "zh-CN", "zh-TW", "es", "ru"];

export const detectLanguage = async (
  text: string,
  onProgress?: (progress: DownloadProgress) => void
): Promise<{ result: string | null; error?: TranslationError }> => {
  if (window.LanguageDetector) {
    try {
      const availability = await window.LanguageDetector.availability();

      if (availability === "unavailable") {
        const error = await getCompatibilityInstructions();
        return { result: null, error };
      }

      let detector;
      if (availability === "available") {
        detector = await window.LanguageDetector.create();
      } else if (
        availability === "downloadable" ||
        availability === "downloading"
      ) {
        detector = await window.LanguageDetector.create({
          monitor(m) {
            m.addEventListener("downloadprogress", (e: any) => {
              console.log(`Downloaded ${e.loaded * 100}%`);
              if (onProgress) {
                onProgress({
                  loaded: e.loaded,
                  total: e.total,
                });
              }
            });
          },
        });
        await detector.ready;
      } else {
        const error = await getCompatibilityInstructions();
        return { result: null, error };
      }

      const results = await detector.detect(text);

      if (results.length > 0) {
        const detectedLanguage = results[0].detectedLanguage;
        if (AVAILABLE_LANGUAGES.includes(detectedLanguage)) {
          return { result: results[0].detectedLanguage };
        }
        return { result: "en" };
      }
      return { result: null };
    } catch (error) {
      console.error("Language detection failed:", error);
      return { result: null };
    }
  }

  if (!window.ai?.languageDetector) {
    const error = await getCompatibilityInstructions();
    console.error(`${error.title}: ${error.message}`);
    console.error("解決方法:");
    error.instructions.forEach((instruction, index) => {
      console.error(`${index + 1}. ${instruction}`);
    });
    return { result: null, error };
  }

  try {
    const capabilities = await window.ai.languageDetector.capabilities();
    if (capabilities.available !== "readily") {
      console.error("Language Detector is not ready");
      return { result: null };
    }

    const detector = await window.ai.languageDetector.create();
    await detector.ready;

    const results = await detector.detect(text);
    detector.destroy();

    if (results.length > 0) {
      return { result: results[0].detectedLanguage };
    }
    return { result: null };
  } catch (error) {
    console.error("Language detection failed:", error);
    return { result: null };
  }
};

export const translateText = async (
  text: string,
  sourceLanguage: string,
  targetLanguage: string = "ja",
  onProgress?: (progress: DownloadProgress) => void
): Promise<{ result: string | null; error?: TranslationError }> => {
  if (window.Translator) {
    try {
      const availability = await window.Translator.availability({
        sourceLanguage,
        targetLanguage,
      });

      if (availability === "unavailable") {
        const error = await getCompatibilityInstructions();
        return { result: null, error };
      }

      let translator;
      if (availability === "available") {
        translator = await window.Translator.create({
          sourceLanguage,
          targetLanguage,
        });
      } else if (
        availability === "downloadable" ||
        availability === "downloading"
      ) {
        translator = await window.Translator.create({
          sourceLanguage,
          targetLanguage,
          monitor(m) {
            m.addEventListener("downloadprogress", (e: any) => {
              console.log(`Downloaded ${e.loaded * 100}%`);
              if (onProgress) {
                onProgress({
                  loaded: e.loaded,
                  total: e.total,
                });
              }
            });
          },
        });
        await translator.ready;
      } else {
        const error = await getCompatibilityInstructions();
        return { result: null, error };
      }

      const translatedText = await translator.translate(text);

      return { result: translatedText };
    } catch (error) {
      console.error("Translation failed:", error);
      return { result: null };
    }
  }

  if (!window.ai?.translator) {
    const error = await getCompatibilityInstructions();
    console.error(`${error.title}: ${error.message}`);
    console.error("解決方法:");
    error.instructions.forEach((instruction, index) => {
      console.error(`${index + 1}. ${instruction}`);
    });
    return { result: null, error };
  }

  try {
    const capabilities = await window.ai.translator.capabilities();
    if (capabilities.available !== "readily") {
      console.error("Translator is not ready");
      return { result: null };
    }

    const translator = await window.ai.translator.create({
      sourceLanguage,
      targetLanguage,
    });
    await translator.ready;

    const translatedText = await translator.translate(text);
    translator.destroy();

    return { result: translatedText };
  } catch (error) {
    console.error("Translation failed:", error);
    return { result: null };
  }
};

export const detectAndTranslate = async (
  text: string,
  onProgress?: (progress: DownloadProgress) => void
): Promise<{ result: string | null; error?: TranslationError }> => {
  const detectionResult = await detectLanguage(text, onProgress);
  if (!detectionResult.result) {
    return detectionResult;
  }

  const detectedLanguage = detectionResult.result;
  const targetLanguage = detectedLanguage === "ja" ? "en" : "ja";

  if (detectedLanguage === targetLanguage) {
    return { result: text };
  }

  return await translateText(
    text,
    detectedLanguage,
    targetLanguage,
    onProgress
  );
};
