# Founder photo replacement

The approved Brandon York photograph is stored locally and used on the homepage and About page. The original supplied photograph is preserved without generative editing or retouching.

## Required asset

- Location: `public/media/founder/brandon-york.jpg`
- Filename: `brandon-york.jpg`
- Current source resolution: `853 × 1280` pixels
- Display crop: vertical `4:5`
- Format: JPEG, sRGB
- Current file size: approximately 74 KB

The component uses a centered crop biased slightly upward to keep Brandon’s head and shoulders framed at narrow widths. Next.js handles responsive resizing and modern delivery formats without changing the source asset.

To replace the photograph later, overwrite the file at the exact path and rebuild; no component edit or environment variable is required if the filename and dimensions remain suitable. For a future higher-resolution replacement, use at least `1200 × 1500` pixels at a `4:5` crop, preferably WebP or high-quality JPEG under 500 KB. If the photograph needs a different accessible description, update `founder.portrait.alt` in `lib/founder.ts`.
