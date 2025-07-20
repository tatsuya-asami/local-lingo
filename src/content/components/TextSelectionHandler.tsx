import React, { useRef } from "react";
import { useTextSelection } from "./useTextSelection";
import { useTranslationActions } from "./useTranslationActions";
import "./TextSelectionHandler.css";

export const TextSelectionHandler: React.FC = () => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [popupMode, setPopupMode] = React.useState<"full" | "compact">("full");
  const [showPreview, setShowPreview] = React.useState(false);

  const {
    previewTranslation,
    handleTranslateReplace,
    handleTranslateCopy,
    error,
    isLoading,
    downloadProgress,
    translationResult,
    clearSelection,
    setSelection,
    currentSelection,
    handleTranslateReplaceWithSelection,
    handleTranslateCopyWithSelection,
  } = useTranslationActions();

  const { popupRef } = useTextSelection({
    onSelectionChange: (newSelection) => {
      if (newSelection && newSelection.text.trim()) {
        setShowPreview(false);
        if (popupMode === "full") {
          previewTranslation(newSelection);
        } else {
          setSelection(newSelection);
        }
      } else {
        clearSelection();
        setShowPreview(false);
      }
    },
  });

  React.useEffect(() => {
    chrome.storage.sync.get(["popupMode"], (result) => {
      setPopupMode(result.popupMode || "full");
    });

    const listener = (changes: {
      [key: string]: chrome.storage.StorageChange;
    }) => {
      if (changes.popupMode) {
        setPopupMode(changes.popupMode.newValue || "full");
      }
    };

    chrome.storage.onChanged.addListener(listener);

    return () => {
      chrome.storage.onChanged.removeListener(listener);
    };
  }, []);

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
        {popupMode === "compact" && !showPreview ? (
          <div className="translation-buttons-compact">
            {isLoading ? (
              <div className="translation-loading">翻訳中...</div>
            ) : (
              <button
                className="translation-button translate-preview"
                onClick={async () => {
                  if (currentSelection) {
                    await previewTranslation(currentSelection);
                    setShowPreview(true);
                  }
                }}
                disabled={isLoading || !currentSelection}
              >
                結果を表示
              </button>
            )}
            <button
              className="translation-button translate-replace"
              onClick={() =>
                handleTranslateReplaceWithSelection(currentSelection)
              }
              disabled={isLoading}
            >
              書き換え
            </button>
            <button
              className="translation-button translate-copy"
              onClick={() => handleTranslateCopyWithSelection(currentSelection)}
              disabled={isLoading}
            >
              コピー
            </button>
            <button
              className="translation-disable-button"
              onClick={() => {
                const hostname = window.location.hostname;
                chrome.storage.sync.get(["disabledUrls"], (result) => {
                  const disabledUrls = result.disabledUrls || [];
                  if (!disabledUrls.includes(hostname)) {
                    disabledUrls.push(hostname);
                    chrome.storage.sync.set({ disabledUrls }, () => {
                      clearSelection();
                    });
                  }
                });
              }}
            >
              このサイトで無効化
            </button>
          </div>
        ) : popupMode === "compact" && showPreview && translationResult ? (
          <div className="translation-content">
            <div className="translation-result">{translationResult}</div>
            <div className="translation-buttons">
              <button
                className="translation-button translate-replace"
                onClick={() => {
                  handleTranslateReplace();
                  setShowPreview(false);
                }}
              >
                書き換え
              </button>
              <button
                className="translation-button translate-copy"
                onClick={() => {
                  handleTranslateCopy();
                  setShowPreview(false);
                }}
              >
                コピー
              </button>
              <button
                className="translation-disable-button"
                onClick={() => {
                  const hostname = window.location.hostname;
                  chrome.storage.sync.get(["disabledUrls"], (result) => {
                    const disabledUrls = result.disabledUrls || [];
                    if (!disabledUrls.includes(hostname)) {
                      disabledUrls.push(hostname);
                      chrome.storage.sync.set({ disabledUrls }, () => {
                        clearSelection();
                        setShowPreview(false);
                      });
                    }
                  });
                }}
              >
                このサイトで無効化
              </button>
            </div>
          </div>
        ) : isLoading ? (
          <div className="translation-loading">
            {downloadProgress
              ? `ダウンロード中... ${Math.round(
                  downloadProgress.loaded * 100
                )}%`
              : "翻訳中..."}
          </div>
        ) : translationResult ? (
          <div className="translation-content">
            <div className="translation-result">{translationResult}</div>
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
              <button
                className="translation-disable-button"
                onClick={() => {
                  const hostname = window.location.hostname;
                  chrome.storage.sync.get(["disabledUrls"], (result) => {
                    const disabledUrls = result.disabledUrls || [];
                    if (!disabledUrls.includes(hostname)) {
                      disabledUrls.push(hostname);
                      chrome.storage.sync.set({ disabledUrls }, () => {
                        clearSelection();
                      });
                    }
                  });
                }}
              >
                このサイトで無効化
              </button>
            </div>
          </div>
        ) : (
          <div className="translation-loading">翻訳を準備中...</div>
        )}
      </div>
    </>
  );
};
