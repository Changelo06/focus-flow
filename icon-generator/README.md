# Quick Icon Generation

Run these commands to automatically generate all required PWA icons:

```bash
cd icon-generator
npm install sharp
node generate-icons.js
```

This will create all required icon sizes in the `public/` folder from your SVG template.

**Tip**: Customize `public/pwa-icon-template.svg` before running this script to use your own design!
