import { useState, useEffect } from "react";
import { TextSelectionHandler } from "../components/TextSelectionHandler";
import "./App.css";

function App() {
  const [isEnabled, setIsEnabled] = useState(true);

  useEffect(() => {
    chrome.storage.sync.get(["translationEnabled"], (result) => {
      setIsEnabled(result.translationEnabled !== false);
    });

    const listener = (changes: {
      [key: string]: chrome.storage.StorageChange;
    }) => {
      if (changes.translationEnabled) {
        setIsEnabled(changes.translationEnabled.newValue !== false);
      }
    };

    chrome.storage.onChanged.addListener(listener);

    return () => {
      chrome.storage.onChanged.removeListener(listener);
    };
  }, []);

  if (!isEnabled) {
    return null;
  }

  return <TextSelectionHandler />;
}

export default App;
