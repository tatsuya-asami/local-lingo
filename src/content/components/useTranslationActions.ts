type UseTranslationActionsProps = {
  clearSelection: () => void;
};

export const useTranslationActions = ({ clearSelection }: UseTranslationActionsProps) => {
  const handleTranslateReplace = () => {
    // TODO: 翻訳して書き換え処理
    clearSelection();
  };

  const handleTranslateCopy = () => {
    // TODO: 翻訳してコピー処理
    clearSelection();
  };

  return {
    handleTranslateReplace,
    handleTranslateCopy
  };
};