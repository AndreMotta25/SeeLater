const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

// Tamanhos dos ícones
const sizes = [192, 512]

// Cor do ícone (azul como theme_color)
const backgroundColor = '#2563eb'
const textColor = '#ffffff'

async function generateIcon(size) {
  // Cria um SVG base para o ícone
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="${backgroundColor}" rx="${size * 0.2}"/>
      <text x="50%" y="55%" font-family="Arial, sans-serif" font-size="${size * 0.5}" font-weight="bold" fill="${textColor}" text-anchor="middle" dominant-baseline="middle">📌</text>
    </svg>
  `

  const outputPath = path.join(__dirname, '..', 'public', `icon-${size}.png`)

  await sharp(Buffer.from(svg))
    .resize(size, size)
    .png()
    .toFile(outputPath)

  console.log(`✓ Generated icon-${size}.png`)
}

async function generateFavicon() {
  const svg = `
    <svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" fill="${backgroundColor}" rx="6"/>
      <text x="50%" y="55%" font-family="Arial, sans-serif" font-size="18" fill="${textColor}" text-anchor="middle" dominant-baseline="middle">📌</text>
    </svg>
  `

  const outputPath = path.join(__dirname, '..', 'public', 'favicon.png')

  await sharp(Buffer.from(svg))
    .resize(32, 32)
    .png()
    .toFile(outputPath)

  console.log(`✓ Generated favicon.png`)
}

async function generateAppleTouchIcon() {
  const svg = `
    <svg width="180" height="180" xmlns="http://www.w3.org/2000/svg">
      <rect width="180" height="180" fill="${backgroundColor}" rx="40"/>
      <text x="50%" y="55%" font-family="Arial, sans-serif" font-size="90" fill="${textColor}" text-anchor="middle" dominant-baseline="middle">📌</text>
    </svg>
  `

  const outputPath = path.join(__dirname, '..', 'public', 'apple-touch-icon.png')

  await sharp(Buffer.from(svg))
    .resize(180, 180)
    .png()
    .toFile(outputPath)

  console.log(`✓ Generated apple-touch-icon.png`)
}

async function main() {
  console.log('Generating PWA icons...')

  for (const size of sizes) {
    await generateIcon(size)
  }

  await generateFavicon()
  await generateAppleTouchIcon()

  console.log('\n✅ All icons generated successfully!')
}

main().catch(console.error)
