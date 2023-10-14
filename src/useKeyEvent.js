import { useEffect } from "react";

export function useKeyEvent(key, action) {
  useEffect(() => {
    function Escape(e) {
      if (e.code === key) action();

      if (e.code === "Enter") action();
    }

    document.addEventListener("keydown", Escape);

    return () => {
      document.removeEventListener("keydown", Escape);
    };
  }, [action, key]);
}
