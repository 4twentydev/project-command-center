export type ProjectImageSource = {
  src: string;
  width: number;
  height: number;
};

type ProjectMediaBase = {
  id: string;
  label: string;
  caption: string;
  description: string;
};

export type ProjectScreenshotMedia = ProjectMediaBase & {
  type: "screenshot";
  alt: string;
  desktop: ProjectImageSource;
  mobile?: ProjectImageSource;
  expandable?: boolean;
  featured?: boolean;
  layout?: "screen" | "phone";
};

export type ProjectVideoMedia = ProjectMediaBase & {
  type: "video";
  src: string;
  mimeType: "video/mp4" | "video/webm";
  poster?: ProjectImageSource;
  captionsSrc?: string;
};

export type ProjectMediaPlaceholder = ProjectMediaBase & {
  type: "placeholder";
  requestedAsset: string;
};

export type ProjectMedia = ProjectScreenshotMedia | ProjectVideoMedia | ProjectMediaPlaceholder;

export function getProjectMedia(media: ProjectMedia[], id?: string) {
  if (!id) return undefined;
  return media.find((item) => item.id === id);
}
