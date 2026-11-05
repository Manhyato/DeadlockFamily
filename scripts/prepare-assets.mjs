import sharp from 'sharp'
import {mkdir,writeFile} from 'node:fs/promises'
await mkdir('public/assets',{recursive:true})
await Promise.all([
  sharp('public/assets/archive.png').resize({width:1920,withoutEnlargement:true}).webp({quality:88}).toFile('public/assets/archive.webp'),
  sharp('public/assets/archive.png').resize({width:850}).webp({quality:80}).toFile('public/assets/archive-mobile.webp'),
  sharp('public/assets/archivist.png').resize({width:900}).webp({quality:85}).toFile('public/assets/archivist.webp')
])
// Exact product-photo regions supplied in the user's concept; no UI is included.
const regions={hoodie:[89,608,307,153],tee:[419,608,298,153],keychain:[739,608,296,153],poster:[1057,608,301,153],compass:[952,881,176,168],notebook:[523,881,180,168],'collection-essentials':[89,879,195,172],'collection-archive':[522,879,190,172],'collection-collectors':[952,879,190,172]}
for(const [name,[left,top,width,height]] of Object.entries(regions))await sharp('public/assets/concept.png').extract({left,top,width,height}).resize({width:name.startsWith('collection')?820:640}).webp({quality:90}).toFile(`public/assets/${name}.webp`)
await writeFile('docs/assets.md',`# Изображения\n\narchive.png — предоставленный фон. concept.png — предоставленный концепт. Карточки товаров и коллекций используют отдельные фотообласти концепта без интерфейса. prepare-assets.mjs создаёт WebP и облегчённый фон для телефона.\n\narchivist.png — оригинальная демонстрационная фигурка, сгенерирована встроенным image_gen. Итоговый файл: public/assets/archivist.webp.\n\nПромпт: Premium realistic product photo of a bronze and dark green collectible cloaked city archivist, wide brim hat, lantern, circular brass base, antique wooden library desk, amber light, dark books, muted green glow, landscape 3:2, no text or UI.\n`)
console.log('Prepared 12 optimized WebP assets.')
