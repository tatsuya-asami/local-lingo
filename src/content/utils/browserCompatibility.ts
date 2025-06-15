export const checkBrowserCompatibility = () => {
  const userAgent = navigator.userAgent;
  const chromeMatch = userAgent.match(/Chrome\/(\d+)/);
  const chromeVersion = chromeMatch ? parseInt(chromeMatch[1]) : 0;

  return {
    chromeVersion,
  };
};

export const checkAIAPIAvailability = async () => {
  let languageDetectorStatus = "not-available";
  let translatorStatus = "not-available";
  let hasAI = false;

  try {
    if (window.LanguageDetector) {
      languageDetectorStatus = await window.LanguageDetector.availability();
      hasAI = true;
    } else if (window.ai?.languageDetector) {
      const capabilities = await window.ai.languageDetector.capabilities();
      languageDetectorStatus = capabilities.available;
      hasAI = true;
    }
  } catch (error) {
    console.error("Language detector capabilities check failed:", error);
  }

  try {
    if (window.Translator) {
      translatorStatus = await window.Translator.availability({
        sourceLanguage: "en",
        targetLanguage: "ja",
      });
      hasAI = true;
    } else if (window.ai?.translator) {
      const capabilities = await window.ai.translator.capabilities();
      translatorStatus = capabilities.available;
      hasAI = true;
    }
  } catch (error) {
    console.error("Translator capabilities check failed:", error);
  }

  return {
    hasAI,
    hasLanguageDetector: languageDetectorStatus === "available",
    hasTranslator: translatorStatus === "available",
    languageDetectorStatus,
    translatorStatus,
  };
};

export const getCompatibilityInstructions = async () => {
  const compatibility = checkBrowserCompatibility();
  const apiAvailability = await checkAIAPIAvailability();

  if (!apiAvailability.hasAI) {
    if (compatibility.chromeVersion < 120) {
      return {
        title: "Chrome のアップデートが必要です",
        message: `Chrome ${compatibility.chromeVersion}はAI APIに対応していません。`,
        instructions: [
          "Chromeメニュー（右上の3点）→「ヘルプ」→「Google Chromeについて」",
          "Chrome 120以降にアップデートしてください",
          "アップデート完了後、ブラウザを再起動してください",
        ],
      };
    }

    return {
      title: "Chrome AI APIが利用できません",
      message: "AI APIが有効になっていない可能性があります。",
      instructions: [
        "【方法1: 実験的機能を有効化】",
        "chrome://flags を開く",
        "「Prompt API for Gemini Nano」を検索して「Enabled」に設定",
        "「Translation API」を検索して「Enabled」に設定",
        "「Language Detection Web Platform API」を検索して「Enabled」に設定",
        "ブラウザを再起動",
        "",
        "【方法2: Chrome 138以降にアップデート】",
        "Chromeメニュー（右上の3点）→「ヘルプ」→「Google Chromeについて」",
        "アップデートを実行してブラウザを再起動",
      ],
    };
  }

  const missingAPIs = [];
  const statusMessages = [];

  if (!apiAvailability.hasLanguageDetector) {
    missingAPIs.push("Language Detection API");
    statusMessages.push(
      `Language Detection: ${apiAvailability.languageDetectorStatus}`
    );
  }
  if (!apiAvailability.hasTranslator) {
    missingAPIs.push("Translation API");
    statusMessages.push(`Translation: ${apiAvailability.translatorStatus}`);
  }

  if (missingAPIs.length > 0) {
    const hasDownloading =
      apiAvailability.languageDetectorStatus === "downloading" ||
      apiAvailability.translatorStatus === "downloading";

    const hasDownloadable =
      apiAvailability.languageDetectorStatus === "downloadable" ||
      apiAvailability.translatorStatus === "downloadable";

    const hasUnavailable =
      apiAvailability.languageDetectorStatus === "unavailable" ||
      apiAvailability.translatorStatus === "unavailable";

    if (hasDownloading) {
      return {
        title: "AI モデルをダウンロード中です",
        message: "AI機能が利用可能になるまでしばらくお待ちください。",
        instructions: [
          "モデルのダウンロードが完了するまでお待ちください",
          "完了後、ページを再読み込みしてください",
          "",
          "状態: " + statusMessages.join("、"),
        ],
      };
    }

    if (hasDownloadable) {
      return {
        title: "AI モデルのダウンロードが必要です",
        message: "翻訳機能を使用するにはモデルのダウンロードが必要です。",
        instructions: [
          "翻訳ボタンをクリックするとダウンロードが開始されます",
          "ダウンロード完了まで数分かかる場合があります",
          "",
          "状態: " + statusMessages.join("、"),
        ],
      };
    }

    if (hasUnavailable) {
      return {
        title: "AI APIが利用できません",
        message: "お使いのブラウザではAI機能がサポートされていません。",
        instructions: [
          "chrome://flags を開く",
          "「Prompt API for Gemini Nano」を検索して「Enabled」に設定",
          "「Translation API」を検索して「Enabled」に設定",
          "「Language Detection Web Platform API」を検索して「Enabled」に設定",
          "ブラウザを再起動",
          "",
          "それでも解決しない場合はChrome 138以降にアップデートしてください",
          "現在の状態: " + statusMessages.join("、"),
        ],
      };
    }

    return {
      title: "一部のAI APIが利用できません",
      message: `${missingAPIs.join("、")}が有効になっていません。`,
      instructions: [
        "chrome://flags を開く",
        "「Prompt API for Gemini Nano」を検索して「Enabled」に設定",
        "「Translation API」を検索して「Enabled」に設定",
        "「Language Detection Web Platform API」を検索して「Enabled」に設定",
        "ブラウザを再起動",
        "",
        "現在の状態: " + statusMessages.join("、"),
      ],
    };
  }

  return {
    title: "AI APIが利用できません",
    message: "予期しないエラーが発生しました。",
    instructions: [
      "ブラウザを再起動してください",
      "それでも解決しない場合は、Chrome 138以降にアップデートしてください",
    ],
  };
};
