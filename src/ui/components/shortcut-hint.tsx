const IS_MAC =
  typeof navigator !== "undefined" &&
  /Mac|iPhone|iPad/.test(navigator.userAgent);

/** Subtle keyboard shortcut pill shown inside primary action buttons. */
export function ShortcutHint() {
  return (
    <kbd className="ml-2 inline-flex items-center gap-0.5 rounded border border-white/20 bg-white/10 px-1.5 py-0.5 text-[10px] leading-none text-white/50 font-normal hidden sm:inline-flex">
      <span>{IS_MAC ? "\u2318" : "Ctrl"}</span>
      <span>{"\u23CE"}</span>
    </kbd>
  );
}
