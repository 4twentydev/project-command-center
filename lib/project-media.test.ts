import { describe, expect, test } from "bun:test";
import { getProjectMedia, type ProjectMedia } from "@/lib/project-media";

describe("project media", () => {
  const media: ProjectMedia[] = [{ id: "overview", type: "placeholder", label: "Overview", caption: "Verified media has not been supplied yet.", description: "A verified product overview belongs in this location.", requestedAsset: "Supply a desktop screenshot." }];

  test("finds configured preview media without duplicating data", () => {
    expect(getProjectMedia(media, "overview")).toBe(media[0]);
    expect(getProjectMedia(media, "missing")).toBeUndefined();
    expect(getProjectMedia(media)).toBeUndefined();
  });
});
