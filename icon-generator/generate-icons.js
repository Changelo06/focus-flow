/**
 * PWA Icon Generator Script
 * 
 * This script converts the SVG template to required PNG sizes
 * Requires: sharp library
 * 
 * Usage:
 * 1. npm install sharp
 * 2. node generate-icons.js
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const logoPath = path.join(__dirname, '..', 'elements', 'LOGO.png');
const publicPath = path.join(__dirname, '..', 'public');

const sizes = [
  { name: 'pwa-64x64.png', size: 64 },
  { name: 'pwa-192x192.png', size: 192 },
  { name: 'pwa-512x512.png', size: 512 },
  { name: 'maskable-icon-512x512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
];

async function generateIcons() {
  console.log('🎨 Generating PWA icons from LOGO.png...\n');

  if (!fs.existsSync(logoPath)) {
    console.error('❌ Error: LOGO.png not found in elements folder');
    process.exit(1);
  }

  for (const { name, size } of sizes) {
    try {
      const outputPath = path.join(publicPath, name);
      
      await sharp(logoPath)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png()
        .toFile(outputPath);
      
      console.log(`✅ Generated: ${name} (${size}x${size})`);
    } catch (error) {
      console.error(`❌ Error generating ${name}:`, error.message);
    }
  }

  console.log('\n🎉 Icon generation complete!');
  console.log('📁 Check the public/ folder for your icons');
}

generateIcons().catch(console.error);
