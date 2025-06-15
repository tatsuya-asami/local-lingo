import { defineManifest } from "@crxjs/vite-plugin";
import pkg from "./package.json";

export default defineManifest({
  manifest_version: 3,
  name: pkg.name,
  version: pkg.version,
  description: "オフラインで動作する翻訳拡張機能",
  icons: {
    48: "public/logo.png",
  },
  minimum_chrome_version: "120",
  action: {
    default_icon: {
      48: "public/logo.png",
    },
    default_popup: "src/popup/index.html",
  },
  content_scripts: [
    {
      js: ["src/content/main.tsx"],
      matches: ["https://*/*"],
    },
  ],
  permissions: ["activeTab", "clipboardWrite", "storage"],
});
