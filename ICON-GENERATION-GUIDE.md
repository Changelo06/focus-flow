# PWA Icon Generation Guide

Your PWA needs the following icon sizes in the `public/` folder:

## Required Icons:
- `pwa-64x64.png` (64x64px)
- `pwa-192x192.png` (192x192px)
- `pwa-512x512.png` (512x512px)
- `maskable-icon-512x512.png` (512x512px with padding)
- `apple-touch-icon.png` (180x180px)
- `favicon.ico` (already exists)

## Option 1: Use pwa-asset-generator (Recommended)

Install and run:
```bash
npm install -g pwa-asset-generator
pwa-asset-generator public/pwa-icon-template.svg public/ --icon-only --favicon --type png
```

## Option 2: Use Online Tools

1. **PWA Builder Image Generator**: https://www.pwabuilder.com/imageGenerator
   - Upload `public/pwa-icon-template.svg`
   - Download all generated icons
   - Place them in the `public/` folder

2. **Favicon Generator**: https://realfavicongenerator.net/
   - Upload your logo
   - Generate all platform icons
   - Download and extract to `public/`

## Option 3: Manual Creation with Image Editor

If you have your own logo/design:
1. Create a square image (512x512px minimum)
2. Use an image editor (Photoshop, GIMP, Figma, etc.)
3. Export the following sizes:
   - 64x64px → `pwa-64x64.png`
   - 192x192px → `pwa-192x192.png`
   - 512x512px → `pwa-512x512.png`
   - 180x180px → `apple-touch-icon.png`

For `maskable-icon-512x512.png`:
- Add 20% padding around your icon
- The safe zone should be in the center 80% of the image
- Learn more: https://maskable.app/editor

## Tips:
- Use simple, bold designs that work at small sizes
- Ensure good contrast for visibility
- Test on different devices
- The template SVG provided is ready to use but can be customized
