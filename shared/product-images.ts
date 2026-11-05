import type {ProductImage} from './types'
const names=new Set(['hoodie','tee','keychain','poster','compass','notebook','archivist'])
// Custom uploads retain their own URL. Only known built-in images have a pair.
export function detailImageUrl(image?:ProductImage){
  if(!image)return undefined
  const name=image.url.match(/^\/assets\/([a-z-]+)\.webp$/)?.[1]
  return name&&names.has(name)?`/assets/${name}-detail-v2.webp`:image.url
}
export function productImageSources(image?:ProductImage){
  const detail=detailImageUrl(image)
  return image&&detail!==image.url?`${image.url} 640w, ${detail} 1536w`:undefined
}
