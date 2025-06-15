import React from "react";
import { useTextSelection } from "./useTextSelection";
import { useTranslationActions } from "./useTranslationActions";
import "./TextSelectionHandler.css";

export const TextSelectionHandler: React.FC = () => {
  const { selection, popupRef, clearSelection } = useTextSelection();
  const { handleTranslateReplace, handleTranslateCopy } = useTranslationActions({ clearSelection });

  if (!selection) {
    return null;
  }

  const { rect } = selection;
  const buttonStyle = {
    position: "fixed" as const,
    left: `${rect.left}px`,
    top: `${rect.top - 45}px`,
    zIndex: 999999,
  };

  return (
    <div
      ref={popupRef}
      className="translation-buttons-container"
      style={buttonStyle}
    >
      <button
        className="translation-button translate-replace"
        onClick={handleTranslateReplace}
      >
        翻訳して書き換え
      </button>
      <button
        className="translation-button translate-copy"
        onClick={handleTranslateCopy}
      >
        翻訳してコピー
      </button>
    </div>
  );
};
