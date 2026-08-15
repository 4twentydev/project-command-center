"use client";

import { useEffect, useRef, type ReactNode } from "react";

type DialogEntry = { id: symbol; element: HTMLElement };
type IsolationState = { ariaHidden: string | null; inert: boolean };

const dialogStack: DialogEntry[] = [];
let isolationObserver: MutationObserver | null = null;
let bodyOverflowBeforeDialog: string | null = null;
let restoreCurrentIsolation: (() => void) | null = null;

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

export function dialogIsolationTargets(activeDialog: HTMLElement, isolationRoot: HTMLElement = document.body) {
  const targets: HTMLElement[] = [];
  let activeBranch: HTMLElement | null = activeDialog;

  while (activeBranch?.parentElement) {
    const parent: HTMLElement = activeBranch.parentElement;
    for (const sibling of Array.from(parent.children)) {
      if (sibling !== activeBranch) targets.push(sibling as HTMLElement);
    }
    if (parent === isolationRoot) break;
    activeBranch = parent;
  }

  return targets;
}

export function isolateDialogBackground(activeDialog: HTMLElement, isolationRoot: HTMLElement = document.body) {
  const isolatedElements = new Map<HTMLElement, IsolationState>();
  for (const element of dialogIsolationTargets(activeDialog, isolationRoot)) {
    isolatedElements.set(element, { ariaHidden: element.getAttribute("aria-hidden"), inert: element.inert });
    element.setAttribute("aria-hidden", "true");
    element.inert = true;
  }

  return () => {
    for (const [element, previous] of isolatedElements) {
      if (previous.ariaHidden === null) element.removeAttribute("aria-hidden");
      else element.setAttribute("aria-hidden", previous.ariaHidden);
      element.inert = previous.inert;
    }
  };
}

function synchronizeDialogIsolation() {
  restoreCurrentIsolation?.();
  restoreCurrentIsolation = null;
  const activeDialog = dialogStack.findLast(({ element }) => element.isConnected)?.element;
  if (!activeDialog) return;
  restoreCurrentIsolation = isolateDialogBackground(activeDialog, document.body);
}

function startDialogIsolation() {
  if (dialogStack.length === 1) {
    bodyOverflowBeforeDialog = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    isolationObserver = new MutationObserver(synchronizeDialogIsolation);
    isolationObserver.observe(document.body, { childList: true, subtree: true });
  }
  synchronizeDialogIsolation();
}

function stopDialogIsolation() {
  synchronizeDialogIsolation();
  if (dialogStack.length) return;
  isolationObserver?.disconnect();
  isolationObserver = null;
  restoreCurrentIsolation?.();
  restoreCurrentIsolation = null;
  document.body.style.overflow = bodyOverflowBeforeDialog ?? "";
  bodyOverflowBeforeDialog = null;
}

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
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialog = dialogRef.current;
    if (!dialog) return;
    const focusable = () => Array.from(dialog.querySelectorAll<HTMLElement>(focusableSelector)).filter((element) => !element.hidden && !element.closest("[inert]"));
    dialogStack.push({ id: dialogId, element: dialog });
    if (!dialog.contains(document.activeElement)) (focusable()[0] ?? dialog).focus({ preventScroll: true });
    startDialogIsolation();
    const frame = window.requestAnimationFrame(() => {
      if (dialogStack.at(-1)?.id === dialogId && !dialog.contains(document.activeElement)) (focusable()[0] ?? dialog).focus({ preventScroll: true });
    });

    function handleKeyDown(event: KeyboardEvent) {
      if (dialogStack.at(-1)?.id !== dialogId) return;

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
      const stackIndex = dialogStack.findIndex(({ id }) => id === dialogId);
      if (stackIndex !== -1) dialogStack.splice(stackIndex, 1);
      stopDialogIsolation();
      previouslyFocused?.focus({ preventScroll: true });
    };
  }, [label]);

  return (
    <div ref={dialogRef} role="dialog" aria-modal="true" aria-label={label} tabIndex={-1}>
      {children}
    </div>
  );
}
