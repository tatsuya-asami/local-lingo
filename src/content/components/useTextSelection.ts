import { useState, useEffect, useRef } from "react";

type SelectionInfo = {
  text: string;
  rect: DOMRect;
  target: HTMLInputElement | HTMLTextAreaElement;
};

export const useTextSelection = () => {
  const [selection, setSelection] = useState<SelectionInfo | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleSelect = (e: Event) => {
      const target = e.target as HTMLInputElement | HTMLTextAreaElement;
      const start = target.selectionStart ?? 0;
      const end = target.selectionEnd ?? 0;
      const selectedText = target.value.substring(start, end);
      const rect = target.getBoundingClientRect();
      
      setSelection({
        text: selectedText,
        rect: rect,
        target: target
      });
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setSelection(null);
      }
    };

    document.addEventListener('select', handleSelect, true);
    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('select', handleSelect, true);
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const clearSelection = () => {
    setSelection(null);
  };

  return {
    selection,
    popupRef,
    clearSelection
  };
};