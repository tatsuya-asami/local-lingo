import { defineManifest } from "@crxjs/vite-plugin";
import pkg from "./package.json";

export default defineManifest({
  manifest_version: 3,
  name: "Local Lingo Japan",
  version: pkg.version,
  description:
    "A completely offline private translation tool using Chrome's built-in Translator and Language Detector APIs",
  icons: {
    16: "public/icon16.png",
    32: "public/icon32.png",
    48: "public/icon48.png",
    128: "public/icon128.png",
  },
  minimum_chrome_version: "120",
  action: {
    default_icon: {
      16: "public/icon16.png",
      32: "public/icon32.png",
      48: "public/icon48.png",
      128: "public/icon128.png",
    },
    default_popup: "src/popup/index.html",
  },
  content_scripts: [
    {
      js: ["src/content/main.tsx"],
      matches: ["https://*/*", "http://*/*"],
    },
  ],
  background: {
    service_worker: "src/background/background.ts",
  },
  permissions: ["activeTab", "clipboardWrite", "storage", "contextMenus"],
});
