import sharp from 'sharp'
import {mkdir,writeFile} from 'node:fs/promises'
await mkdir('public/assets',{recursive:true})
await Promise.all([
  sharp('public/assets/archive.png').resize({width:1920,withoutEnlargement:true}).webp({quality:88}).toFile('public/assets/archive.webp'),
  sharp('public/assets/archive.png').resize({width:850}).webp({quality:80}).toFile('public/assets/archive-mobile.webp'),
  sharp('public/assets/archivist.png').resize({width:900}).webp({quality:85}).toFile('public/assets/archivist.webp')
])
// Dedicated full-size sources replace the old ~300px crops from the concept.
for(const name of ['hoodie','tee','keychain','poster','compass','notebook','archivist']){
  const source=name==='archivist'?'public/assets/archivist.png':`assets/sources/${name}-v2.png`
  const metadata=await sharp(source).metadata()
  if(!metadata.width||metadata.width<1536)throw new Error(`Source for ${name} is too small for product detail`)
  await Promise.all([
    sharp(source).resize({width:640,withoutEnlargement:true}).webp({quality:86}).toFile(`public/assets/${name}.webp`),
    sharp(source).resize({width:1536,withoutEnlargement:true}).webp({quality:94}).toFile(`public/assets/${name}-detail-v2.webp`)
  ])
}
// Collection-only decorative crops remain separate from product photography.
const regions={'collection-essentials':[89,879,195,172],'collection-archive':[522,879,190,172],'collection-collectors':[952,879,190,172]}
for(const [name,[left,top,width,height]] of Object.entries(regions))await sharp('public/assets/concept.png').extract({left,top,width,height}).resize({width:820}).webp({quality:90}).toFile(`public/assets/${name}.webp`)
await writeFile('docs/assets.md',`# Изображения\n\narchive.png — предоставленный фон. concept.png — предоставленный концепт. Декоративные обложки коллекций используют отдельные области концепта. Фотографии товаров больше не вырезаются из макета.\n\nНовые отдельные фотографии худи, футболки, двух брелков, постера и блокнота созданы встроенным image_gen. Исходники: assets/sources/*-v2.png. Полный набор точных промптов: docs/product-photo-prompts.json.\n\nФигурка: public/assets/archivist.png, также image_gen; промпт в docs/figurine-prompt.txt.\n\nprepare-assets.mjs делает миниатюры public/assets/{name}.webp шириной 640 px и отдельные большие public/assets/{name}-detail-v2.webp шириной 1536 px без увеличения исходников. Галерея использует srcset и показывает товар целиком.\n`)
console.log('Prepared responsive product photos (640px + 1536px), background and collection covers.')
