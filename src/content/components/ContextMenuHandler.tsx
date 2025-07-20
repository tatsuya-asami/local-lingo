import { useEffect } from "react";
import { detectAndTranslate } from "../utils/aiTranslation";

export const ContextMenuHandler = () => {
  useEffect(() => {
    const handleMessage = async (
      message: any,
      _sender: chrome.runtime.MessageSender,
      _sendResponse: (response?: any) => void
    ) => {
      if (message.action === "contextMenuAction") {
        const selectedText = message.selectedText;
        
        if (!selectedText) return;

        switch (message.type) {
          case "translate-replace": {
            const activeElement = document.activeElement;
            if (
              activeElement instanceof HTMLInputElement ||
              activeElement instanceof HTMLTextAreaElement
            ) {
              const start = activeElement.selectionStart ?? 0;
              const end = activeElement.selectionEnd ?? 0;
              
              const result = await detectAndTranslate(selectedText);
              
              if (result.result) {
                activeElement.value =
                  activeElement.value.substring(0, start) +
                  result.result +
                  activeElement.value.substring(end);

                const inputEvent = new Event("input", { bubbles: true });
                activeElement.dispatchEvent(inputEvent);

                activeElement.focus();
                activeElement.setSelectionRange(
                  start + result.result.length,
                  start + result.result.length
                );
              }
            }
            break;
          }

          case "translate-copy": {
            const result = await detectAndTranslate(selectedText);
            
            if (result.result) {
              await navigator.clipboard.writeText(result.result);
            }
            break;
          }
        }
      }
    };

    chrome.runtime.onMessage.addListener(handleMessage);

    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, []);

  return null;
};