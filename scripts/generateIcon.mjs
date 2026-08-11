import * as PImage from 'pureimage'
import { createWriteStream, mkdirSync, unlinkSync, readFileSync } from 'fs'
import { writeFile } from 'fs/promises'
import { fileURLToPath } from 'url'
import path from 'path'
import pngToIco from 'png-to-ico'
import png2icons from 'png2icons'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const buildDir = path.join(__dirname, '..', 'build')
mkdirSync(buildDir, { recursive: true })

const ICO_SIZES = [16, 32, 48, 256]
const ICNS_SOURCE_SIZE = 1024

function drawIcon(size) {
  const img = PImage.make(size, size)
  const ctx = img.getContext('2d')

  // Café brown background
  ctx.fillStyle = '#3c2415'
  ctx.fillRect(0, 0, size, size)

  const cx = size / 2
  const cy = size / 2 + size * 0.03
  const cupR = size * 0.32

  // Cup body (cream)
  ctx.fillStyle = '#f7f1e6'
  ctx.beginPath()
  ctx.arc(cx, cy, cupR, 0, Math.PI * 2, false)
  ctx.closePath()
  ctx.fill()

  // Coffee (gold) inner circle
  ctx.fillStyle = '#b98a3d'
  ctx.beginPath()
  ctx.arc(cx, cy, cupR * 0.6, 0, Math.PI * 2, false)
  ctx.closePath()
  ctx.fill()

  // Handle
  ctx.strokeStyle = '#f7f1e6'
  ctx.lineWidth = Math.max(1, size * 0.07)
  ctx.beginPath()
  ctx.arc(cx + cupR * 1.15, cy, cupR * 0.42, -Math.PI * 0.5, Math.PI * 0.5, false)
  ctx.stroke()

  return img
}

async function writePng(size, outPath) {
  const img = drawIcon(size)
  await new Promise((resolve, reject) => {
    const stream = createWriteStream(outPath)
    PImage.encodePNGToStream(img, stream).then(resolve).catch(reject)
  })
}

async function main() {
  // --- Windows .ico ---
  const icoPngPaths = []
  for (const size of ICO_SIZES) {
    const outPath = path.join(buildDir, `icon-${size}.png`)
    await writePng(size, outPath)
    icoPngPaths.push(outPath)
  }
  const icoBuffer = await pngToIco(icoPngPaths)
  await writeFile(path.join(buildDir, 'icon.ico'), icoBuffer)
  for (const p of icoPngPaths) unlinkSync(p)
  console.log(`Wrote build/icon.ico from sizes: ${ICO_SIZES.join(', ')}`)

  // --- macOS .icns ---
  const icnsSourcePath = path.join(buildDir, `icon-${ICNS_SOURCE_SIZE}.png`)
  await writePng(ICNS_SOURCE_SIZE, icnsSourcePath)
  const sourceBuffer = readFileSync(icnsSourcePath)
  const icnsBuffer = png2icons.createICNS(sourceBuffer, png2icons.BICUBIC2, 0)
  if (!icnsBuffer) {
    throw new Error('png2icons failed to create icon.icns')
  }
  await writeFile(path.join(buildDir, 'icon.icns'), icnsBuffer)
  unlinkSync(icnsSourcePath)
  console.log(`Wrote build/icon.icns from a ${ICNS_SOURCE_SIZE}x${ICNS_SOURCE_SIZE} source`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
