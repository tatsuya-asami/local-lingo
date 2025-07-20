import { useState, useEffect } from "react";
import { TextSelectionHandler } from "../components/TextSelectionHandler";
import { ContextMenuHandler } from "../components/ContextMenuHandler";
import "./App.css";

function App() {
  const [isEnabled, setIsEnabled] = useState(true);
  const [isUrlEnabled, setIsUrlEnabled] = useState(true);

  useEffect(() => {
    const hostname = window.location.hostname;
    
    chrome.storage.sync.get(["translationEnabled", "disabledUrls"], (result) => {
      setIsEnabled(result.translationEnabled !== false);
      const disabledUrls = result.disabledUrls || [];
      setIsUrlEnabled(!disabledUrls.includes(hostname));
    });

    const listener = (changes: {
      [key: string]: chrome.storage.StorageChange;
    }) => {
      if (changes.translationEnabled) {
        setIsEnabled(changes.translationEnabled.newValue !== false);
      }
      if (changes.disabledUrls) {
        const newDisabledUrls = changes.disabledUrls.newValue || [];
        setIsUrlEnabled(!newDisabledUrls.includes(hostname));
      }
    };

    chrome.storage.onChanged.addListener(listener);

    return () => {
      chrome.storage.onChanged.removeListener(listener);
    };
  }, []);

  if (!isEnabled || !isUrlEnabled) {
    return null;
  }

  return (
    <>
      <TextSelectionHandler />
      <ContextMenuHandler />
    </>
  );
}

export default App;
