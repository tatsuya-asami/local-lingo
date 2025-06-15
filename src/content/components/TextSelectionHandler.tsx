import React, { useRef } from "react";
import { useTextSelection } from "./useTextSelection";
import { useTranslationActions } from "./useTranslationActions";
import "./TextSelectionHandler.css";

export const TextSelectionHandler: React.FC = () => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  
  const { previewTranslation, handleTranslateReplace, handleTranslateCopy, error, isLoading, downloadProgress, translationResult, clearSelection, currentSelection } = useTranslationActions();
  
  const { popupRef } = useTextSelection({
    onSelectionChange: (newSelection) => {
      if (newSelection && newSelection.text.trim()) {
        previewTranslation(newSelection);
      } else {
        clearSelection();
      }
    }
  });

  React.useEffect(() => {
    if (error && dialogRef.current) {
      dialogRef.current.showModal();
    } else if (!error && dialogRef.current) {
      dialogRef.current.close();
    }
  }, [error]);

  if (!currentSelection) {
    return null;
  }

  const { rect } = currentSelection;
  
  const popupHeight = 45;
  const margin = 20;
  const viewportWidth = window.innerWidth;
  
  let top = rect.top - popupHeight - margin;
  let left = rect.left;
  
  if (top < margin) {
    top = rect.bottom + margin;
  }
  
  if (left + 300 > viewportWidth) {
    left = viewportWidth - 300 - margin;
  }
  
  if (left < margin) {
    left = margin;
  }

  const buttonStyle = {
    position: "fixed" as const,
    left: `${left}px`,
    top: `${top}px`,
    zIndex: 999999,
  };

  return (
    <>
      <dialog ref={dialogRef} className="translation-error-dialog">
        <div className="translation-error-container">
          <div className="translation-error-content">
            <div className="translation-error-title">{error?.title}</div>
            <div className="translation-error-message">{error?.message}</div>
            <ul className="translation-error-instructions">
              {error?.instructions.map((instruction, index) => (
                <li key={index}>{instruction}</li>
              ))}
            </ul>
          </div>
          <div className="translation-error-footer">
            <button
              className="translation-error-close"
              onClick={() => dialogRef.current?.close()}
            >
              閉じる
            </button>
          </div>
        </div>
      </dialog>
      <div
        ref={popupRef}
        className="translation-buttons-container"
        style={buttonStyle}
      >
        {isLoading ? (
          <div className="translation-loading">
            {downloadProgress 
              ? `ダウンロード中... ${Math.round(downloadProgress.loaded * 100)}%`
              : '翻訳中...'
            }
          </div>
        ) : translationResult ? (
          <>
            <div className="translation-result">
              {translationResult}
            </div>
            <div className="translation-buttons">
              <button
                className="translation-button translate-replace"
                onClick={handleTranslateReplace}
              >
                書き換え
              </button>
              <button
                className="translation-button translate-copy"
                onClick={handleTranslateCopy}
              >
                コピー
              </button>
            </div>
          </>
        ) : (
          <div className="translation-loading">
            翻訳を準備中...
          </div>
        )}
      </div>
    </>
  );
};
