import { describe, expect, test } from "bun:test";
import { dialogIsolationTargets, isolateDialogBackground } from "@/components/ui/dialog-boundary";

type FakeElement = {
  name: string;
  parentElement: FakeElement | null;
  children: FakeElement[];
  inert: boolean;
  attributes: Map<string, string>;
  getAttribute(name: string): string | null;
  setAttribute(name: string, value: string): void;
  removeAttribute(name: string): void;
};

function element(name: string, children: FakeElement[] = []): FakeElement {
  const attributes = new Map<string, string>();
  const parent: FakeElement = {
    name,
    parentElement: null,
    children,
    inert: false,
    attributes,
    getAttribute: (attribute) => attributes.get(attribute) ?? null,
    setAttribute: (attribute, value) => { attributes.set(attribute, value); },
    removeAttribute: (attribute) => { attributes.delete(attribute); },
  };
  for (const child of children) child.parentElement = parent;
  return parent;
}

function targetNames(active: FakeElement) {
  let root = active;
  while (root.parentElement) root = root.parentElement;
  return dialogIsolationTargets(active as unknown as HTMLElement, root as unknown as HTMLElement).map((target) => (target as unknown as FakeElement).name);
}

describe("dialog background isolation", () => {
  test("isolates page and body siblings around one active dialog", () => {
    const background = element("background");
    const dialog = element("dialog");
    const app = element("app", [background, dialog]);
    const routeAnnouncer = element("route-announcer");
    element("body", [app, routeAnnouncer]);

    expect(targetNames(dialog)).toEqual(["background", "route-announcer"]);
  });

  test("isolates an underlying sibling dialog while preserving the active branch", () => {
    const background = element("background");
    const underlyingDialog = element("project-dialog");
    const activeDialog = element("task-dialog");
    const app = element("app", [background, underlyingDialog, activeDialog]);
    const bodyUtility = element("body-utility");
    element("body", [app, bodyUtility]);

    expect(targetNames(activeDialog)).toEqual(["background", "project-dialog", "body-utility"]);
  });

  test("handles dialogs that are actually nested in the DOM", () => {
    const underlyingContent = element("underlying-content");
    const activeDialog = element("nested-dialog");
    const outerDialog = element("outer-dialog", [underlyingContent, activeDialog]);
    const background = element("background");
    const app = element("app", [background, outerDialog]);
    element("body", [app]);

    expect(targetNames(activeDialog)).toEqual(["underlying-content", "background"]);
  });

  test("applies inert accessibility isolation and restores prior state exactly", () => {
    const background = element("background");
    const preHiddenUtility = element("pre-hidden");
    preHiddenUtility.inert = true;
    preHiddenUtility.setAttribute("aria-hidden", "menu");
    const dialog = element("dialog");
    const app = element("app", [background, dialog]);
    const body = element("body", [app, preHiddenUtility]);

    const restore = isolateDialogBackground(dialog as unknown as HTMLElement, body as unknown as HTMLElement);
    expect({ backgroundInert: background.inert, backgroundHidden: background.getAttribute("aria-hidden") }).toEqual({ backgroundInert: true, backgroundHidden: "true" });
    expect({ utilityInert: preHiddenUtility.inert, utilityHidden: preHiddenUtility.getAttribute("aria-hidden") }).toEqual({ utilityInert: true, utilityHidden: "true" });

    restore();
    expect({ backgroundInert: background.inert, backgroundHidden: background.getAttribute("aria-hidden") }).toEqual({ backgroundInert: false, backgroundHidden: null });
    expect({ utilityInert: preHiddenUtility.inert, utilityHidden: preHiddenUtility.getAttribute("aria-hidden") }).toEqual({ utilityInert: true, utilityHidden: "menu" });
  });
});
