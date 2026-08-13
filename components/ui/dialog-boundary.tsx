"use client";

import { useEffect, useRef, type ReactNode } from "react";

const dialogStack: symbol[] = [];

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

export function DialogBoundary({
  label,
  onClose,
  children,
}: {
  label: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const dialogId = Symbol(label);
    dialogStack.push(dialogId);
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialog = dialogRef.current;
    const focusable = () => Array.from(dialog?.querySelectorAll<HTMLElement>(focusableSelector) ?? []).filter((element) => !element.hidden);
    const frame = window.requestAnimationFrame(() => focusable()[0]?.focus());

    function handleKeyDown(event: KeyboardEvent) {
      if (dialogStack.at(-1) !== dialogId) return;

      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }

      if (event.key !== "Tab") return;
      const elements = focusable();
      if (!elements.length) {
        event.preventDefault();
        dialog?.focus();
        return;
      }

      const first = elements[0];
      const last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("keydown", handleKeyDown);
      const stackIndex = dialogStack.indexOf(dialogId);
      if (stackIndex !== -1) dialogStack.splice(stackIndex, 1);
      previouslyFocused?.focus();
    };
  }, [label]);

  return (
    <div ref={dialogRef} role="dialog" aria-modal="true" aria-label={label} tabIndex={-1}>
      {children}
    </div>
  );
}
