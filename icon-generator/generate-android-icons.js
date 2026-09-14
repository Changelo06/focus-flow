const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const logoPath = path.join(__dirname, '..', 'elements', 'LOGO-APP.svg');
const androidResPath = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'res');

const androidSizes = [
  { folder: 'mipmap-mdpi', size: 48 },
  { folder: 'mipmap-hdpi', size: 72 },
  { folder: 'mipmap-xhdpi', size: 96 },
  { folder: 'mipmap-xxhdpi', size: 144 },
  { folder: 'mipmap-xxxhdpi', size: 192 },
];

const iconNames = ['ic_launcher.png', 'ic_launcher_round.png', 'ic_launcher_foreground.png'];

async function generateAndroidIcons() {
  console.log('🤖 Generating Android launcher icons from LOGO-APP.svg...\n');

  if (!fs.existsSync(logoPath)) {
    console.error('❌ Error: LOGO-APP.svg not found in elements folder');
    process.exit(1);
  }

  for (const { folder, size } of androidSizes) {
    const folderPath = path.join(androidResPath, folder);
    
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    for (const iconName of iconNames) {
      try {
        const outputPath = path.join(folderPath, iconName);
        
        await sharp(logoPath)
          .resize(size, size, {
            fit: 'contain',
            background: { r: 0, g: 0, b: 0, alpha: 0 }
          })
          .png()
          .toFile(outputPath);
        
        console.log(`✅ Generated: ${folder}/${iconName} (${size}x${size})`);
      } catch (error) {
        console.error(`❌ Error generating ${folder}/${iconName}:`, error.message);
      }
    }
  }

  console.log('\n🎉 Android icon generation complete!');
}

generateAndroidIcons();
