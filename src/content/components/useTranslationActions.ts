import { useState } from "react";
import {
  detectAndTranslate,
  TranslationError,
  DownloadProgress,
} from "../utils/aiTranslation";

type SelectionInfo = {
  text: string;
  target: HTMLInputElement | HTMLTextAreaElement;
  rect: DOMRect;
};

export const useTranslationActions = () => {
  const [error, setError] = useState<TranslationError | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [downloadProgress, setDownloadProgress] =
    useState<DownloadProgress | null>(null);
  const [translationResult, setTranslationResult] = useState<string | null>(
    null
  );
  const [currentSelection, setCurrentSelection] = useState<SelectionInfo | null>(null);

  const clearSelection = () => {
    setCurrentSelection(null);
    setTranslationResult(null);
    setError(null);
  };

  const previewTranslation = async (selection: SelectionInfo) => {
    setCurrentSelection(selection);
    setIsLoading(true);
    setError(null);
    setDownloadProgress(null);
    setTranslationResult(null);

    const { text } = selection;
    const result = await detectAndTranslate(text, (progress) => {
      setDownloadProgress(progress);
    });

    if (result.error) {
      setError(result.error);
      setIsLoading(false);
      return;
    }

    if (result.result) {
      setTranslationResult(result.result);
    }

    setIsLoading(false);
    setDownloadProgress(null);
  };

  const handleTranslateReplace = () => {
    if (!currentSelection || !translationResult) {
      return;
    }

    const { target } = currentSelection;
    const start = target.selectionStart ?? 0;
    const end = target.selectionEnd ?? 0;

    target.value =
      target.value.substring(0, start) +
      translationResult +
      target.value.substring(end);

    const inputEvent = new Event("input", { bubbles: true });
    target.dispatchEvent(inputEvent);

    clearSelection();

    target.focus();
    target.setSelectionRange(
      start + translationResult.length,
      start + translationResult.length
    );
  };

  const handleTranslateCopy = async () => {
    if (!translationResult) {
      return;
    }

    await navigator.clipboard.writeText(translationResult);
    if (currentSelection) {
      currentSelection.target.focus();
    }
    clearSelection();
  };

  const handleTranslateReplaceWithSelection = async (selection: SelectionInfo) => {
    setCurrentSelection(selection);
    setIsLoading(true);
    setError(null);
    
    const { text } = selection;
    const result = await detectAndTranslate(text);
    
    if (result.error) {
      setError(result.error);
      setIsLoading(false);
      return;
    }
    
    if (result.result) {
      const { target } = selection;
      const start = target.selectionStart ?? 0;
      const end = target.selectionEnd ?? 0;

      target.value =
        target.value.substring(0, start) +
        result.result +
        target.value.substring(end);

      const inputEvent = new Event("input", { bubbles: true });
      target.dispatchEvent(inputEvent);

      clearSelection();

      target.focus();
      target.setSelectionRange(
        start + result.result.length,
        start + result.result.length
      );
    }
    
    setIsLoading(false);
  };

  const handleTranslateCopyWithSelection = async (selection: SelectionInfo) => {
    setCurrentSelection(selection);
    setIsLoading(true);
    setError(null);
    
    const { text } = selection;
    const result = await detectAndTranslate(text);
    
    if (result.error) {
      setError(result.error);
      setIsLoading(false);
      return;
    }
    
    if (result.result) {
      await navigator.clipboard.writeText(result.result);
      if (selection) {
        selection.target.focus();
      }
      clearSelection();
    }
    
    setIsLoading(false);
  };

  return {
    previewTranslation,
    handleTranslateReplace,
    handleTranslateCopy,
    handleTranslateReplaceWithSelection,
    handleTranslateCopyWithSelection,
    error,
    isLoading,
    downloadProgress,
    translationResult,
    clearSelection,
    currentSelection,
  };
};
