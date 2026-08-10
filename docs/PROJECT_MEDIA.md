# Project media guide

Project media is configured in `lib/case-studies.ts` and rendered by `components/project-media.tsx`. Keep assets truthful: use captured product screens, real workflow diagrams, or recorded demonstrations only. Do not substitute mock customer data or generated screenshots for evidence.

## Folders and filenames

Store each project under `public/media/projects/<project-slug>/`:

```text
public/media/projects/work-control/
  overview-desktop.webp
  overview-mobile.webp        # optional
  demo-poster.webp            # required when adding video
  demo.mp4
  demo-captions.vtt           # required when speech or meaningful audio exists
```

Use lowercase kebab-case names. Keep the filename stable when replacing an asset so the case-study data does not need to change. Placeholder UI is rendered locally when final media is unavailable or a configured file fails to load.

## Screenshots

- Desktop: 1600×1000 or 1920×1200, preferably WebP or AVIF, target 250–450 KB.
- Mobile: 750×1334 or 828×1792, preferably WebP or AVIF, target 120–250 KB.
- Capture at 1× or 2× with browser chrome removed unless the browser context matters.
- Redact credentials, private repositories, customer information, email addresses, and notification contents before export.
- Preserve the source aspect ratio in the `width` and `height` fields. The renderer uses these values to prevent layout shift and serves responsive sizes through Next.js image optimization.

Add a screenshot media item:

```ts
{
  id: "overview",
  type: "screenshot",
  label: "Dashboard overview",
  description: "The primary command-center view showing projects and current operating signals.",
  alt: "WORK//CTRL dashboard with project status, focus tasks, and deployment signals.",
  caption: "The owner view combines active work and service health without claiming automated decision-making.",
  desktop: { src: "/media/projects/work-control/overview-desktop.webp", width: 1600, height: 1000 },
  mobile: { src: "/media/projects/work-control/overview-mobile.webp", width: 750, height: 1334 },
  expandable: true,
}
```

The mobile source is optional. When omitted, the desktop image is resized responsively. Enable `expandable` only when the full-size screen contains details that are genuinely useful to inspect.

## Demonstration videos

- Resolution: 1280×720 preferred; 1920×1080 only when interface text requires it.
- Duration: approximately 15–45 seconds.
- MP4: H.264 video with AAC audio for broad compatibility.
- WebM: VP9 or AV1 is also supported when supplied as the configured source.
- Target size: under 6 MB; hard maximum 10 MB for a short homepage or case-study demo.
- Poster: 1280×720 WebP or AVIF, preferably under 200 KB.
- Record at a deliberate pace with the pointer visible only when it adds meaning.

Videos use native browser controls, `muted`, `playsInline`, and `preload="none"`. They do not autoplay, which avoids unexpected bandwidth and motion. If speech or meaningful sound is retained, add a WebVTT captions file and configure `captionsSrc`.

```ts
{
  id: "focus-demo",
  type: "video",
  label: "Focus planning demonstration",
  description: "A short walkthrough of selecting and reviewing the current focus queue.",
  caption: "The demonstration shows the current live workflow using non-sensitive project data.",
  src: "/media/projects/work-control/demo.mp4",
  mimeType: "video/mp4",
  poster: { src: "/media/projects/work-control/demo-poster.webp", width: 1280, height: 720 },
  captionsSrc: "/media/projects/work-control/demo-captions.vtt",
}
```

## Replacing placeholders

1. Add the verified files under the project folder.
2. Replace the corresponding `type: "placeholder"` item in `lib/case-studies.ts` with a `screenshot` or `video` item.
3. Keep the existing media `id` when possible so `previewMediaId` continues to work.
4. Use `previewMediaId` only for a concise, legible asset that works inside a homepage card.
5. Run tests, lint, type checking, and a production build, then inspect both mobile and desktop layouts.

## Alt text, descriptions, and captions

- `alt` describes what is visibly important in a screenshot, including the screen and the operational information being shown. Do not repeat the project name without explaining the image.
- `description` explains the purpose of the media for assistive labels and expanded views.
- `caption` supplies context that is not obvious from the pixels: what workflow is shown, whether data is illustrative, and what should not be inferred.
- Avoid promotional claims, “image of” phrasing, filenames, and details already stated immediately beside the media.
- Use empty alt text only for truly decorative images. Product screenshots are normally informative and require meaningful alt text.
