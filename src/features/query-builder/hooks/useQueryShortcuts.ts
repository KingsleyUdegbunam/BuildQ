import { useEffect } from "react";

export function useQueryShortcuts({
  onRedo,
  onRun,
  onUndo,
}: {
  onRedo: () => void;
  onRun: () => void;
  onUndo: () => void;
}) {
  useEffect(() => {
    function handleKeys(event: KeyboardEvent) {
      if (!(event.ctrlKey || event.metaKey)) return;
      if (event.key === "Enter") {
        event.preventDefault();
        onRun();
      }
      if (event.key.toLowerCase() === "z" && event.shiftKey) {
        event.preventDefault();
        onRedo();
      } else if (event.key.toLowerCase() === "z") {
        event.preventDefault();
        onUndo();
      }
    }

    window.addEventListener("keydown", handleKeys);
    return () => window.removeEventListener("keydown", handleKeys);
  });
}
