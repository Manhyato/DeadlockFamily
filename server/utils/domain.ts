import type { CartItem, CartQuote, DemoState, Product, ProductQuery, OrderInput, Order, Collection } from '../../shared/types'
import { variantLabel } from '../../shared/types'
import { categories } from './seed'
export class ApiError extends Error { constructor(public status:number, public code:string, message:string) {super(message)} }
export function fail(status:number,code:string,message:string):never {throw new ApiError(status,code,message)}
export function listProducts(state:DemoState,query:ProductQuery={},admin=false) {
  let items=state.products.filter(p=>admin||p.status==='published')
  if(query.category){if(!categories.some(c=>c.slug===query.category))fail(404,'CATEGORY_NOT_FOUND','Категория не найдена');items=items.filter(p=>p.category===query.category)}
  if(query.collection){const c=state.collections.find(c=>c.slug===query.collection||c.id===query.collection);if(!c)fail(404,'COLLECTION_NOT_FOUND','Коллекция не найдена');items=items.filter(p=>p.collectionIds.includes(c.id))}
  if(query.q){const q=query.q.toLocaleLowerCase('ru');items=items.filter(p=>`${p.name} ${p.description} ${p.tags.join(' ')}`.toLocaleLowerCase('ru').includes(q))}
  if(query.available==='true')items=items.filter(p=>p.variants.some(v=>v.available&&v.stock>0))
  if(query.featured==='true')items=items.filter(p=>p.isFeatured)
  if(query.new==='true')items=items.filter(p=>p.publishedAt&&Date.now()-Date.parse(p.publishedAt)<30*86400000)
  if(admin&&query.status)items=items.filter(p=>p.status===query.status)
  items.sort(query.sort==='price-asc'?(a,b)=>a.price-b.price:query.sort==='price-desc'?(a,b)=>b.price-a.price:(a,b)=>(b.publishedAt||b.createdAt).localeCompare(a.publishedAt||a.createdAt)||a.id.localeCompare(b.id))
  const page=Math.max(1,Math.floor(Number(query.page)||1)),pageSize=Math.max(1,Math.min(50,Math.floor(Number(query.pageSize)||8)))
  return {items:items.slice((page-1)*pageSize,page*pageSize),total:items.length,page,pageSize}
}
export function quoteCart(state:DemoState,input:CartItem[]):CartQuote {
  if(!Array.isArray(input)||input.length>100)fail(400,'INVALID_CART','Некорректная корзина')
  const grouped=new Map<string,CartItem>()
  for(const line of input){
    if(!line||!Number.isInteger(line.quantity)||line.quantity<1||line.quantity>99||!Number.isInteger(line.expectedPrice))fail(400,'INVALID_QUANTITY','Количество должно быть от 1 до 99')
    const key=`${line.productId}:${line.variantId}`,existing=grouped.get(key)
    if(existing){existing.quantity+=line.quantity;if(existing.quantity>99)fail(400,'INVALID_QUANTITY','Слишком большое количество')}else grouped.set(key,{...line})
  }
  const items=[...grouped.values()].map(line=>{
    const p=state.products.find(p=>p.id===line.productId),v=p?.variants.find(v=>v.id===line.variantId),price=v?.price??p?.price??0
    return {...line,name:p?.name||'Товар удалён',variantLabel:v?variantLabel(v):'Вариант удалён',image:p?.images[0]?.url||'',price,stock:v?.stock||0,available:Boolean(p?.status==='published'&&v?.available&&v.stock>=line.quantity),changed:price!==line.expectedPrice}
  })
  return {items,subtotal:items.reduce((s,l)=>s+l.price*l.quantity,0),valid:items.length>0&&items.every(l=>l.available),changed:items.some(l=>l.changed)}
}
const text=(v:unknown,max=500)=>typeof v==='string'&&v.length<=max
export function validateProduct(state:DemoState,raw:Product,id?:string):Product {
  if(!raw||!text(raw.name,120)||!raw.name.trim()||!text(raw.slug,120)||!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(raw.slug))fail(400,'INVALID_PRODUCT','Укажите название и slug латиницей через дефис')
  if(state.products.some(p=>p.id!==id&&p.slug===raw.slug))fail(400,'DUPLICATE_SLUG','Такой адрес товара уже существует')
  if(!categories.some(c=>c.slug===raw.category))fail(400,'INVALID_CATEGORY','Выберите одну из четырёх категорий')
  if(!Number.isSafeInteger(raw.price)||raw.price<0||raw.price>100000000)fail(400,'INVALID_PRICE','Цена должна быть от 0 до 1 000 000 ₽')
  if(!['draft','published','archived'].includes(raw.status))fail(400,'INVALID_STATUS','Недопустимый статус')
  if(!Array.isArray(raw.images)||raw.images.length>8||raw.images.some(i=>!i||!text(i.url,1400000)||!(/^\/assets\/[a-z0-9-]+\.webp$/.test(i.url)||/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(i.url))||!text(i.alt,200)))fail(400,'INVALID_IMAGE','Выберите демо-изображение или PNG, JPEG, WebP до 1 МБ')
  if(raw.status==='published'&&!raw.images.length)fail(400,'IMAGE_REQUIRED','Для публикации нужен основной кадр')
  if(!Array.isArray(raw.variants)||!raw.variants.length||raw.variants.length>40)fail(400,'VARIANTS_REQUIRED','Добавьте хотя бы один вариант')
  const skus=new Set(state.products.filter(p=>p.id!==id).flatMap(p=>p.variants.map(v=>v.sku))),ids=new Set<string>()
  for(const v of raw.variants){
    if(!v||!text(v.sku,80)||!v.sku.trim()||skus.has(v.sku)||!text(v.id,80)||!v.id||ids.has(v.id))fail(400,'DUPLICATE_SKU','SKU и идентификаторы вариантов должны быть уникальными')
    if(!Number.isInteger(v.stock)||v.stock<0||v.stock>9999||typeof v.available!=='boolean'||(v.price!==undefined&&(!Number.isSafeInteger(v.price)||v.price<0||v.price>100000000)))fail(400,'INVALID_VARIANT','Проверьте остаток, доступность и цену варианта')
    if((v.size!==undefined&&!text(v.size,40))||(v.color!==undefined&&!text(v.color,60)))fail(400,'INVALID_VARIANT','Слишком длинный размер или цвет')
    skus.add(v.sku);ids.add(v.id)
  }
  if(!Array.isArray(raw.collectionIds)||raw.collectionIds.some(id=>!state.collections.some(c=>c.id===id))||!Array.isArray(raw.tags)||raw.tags.some(t=>!text(t,80))||!text(raw.description,10000)||!text(raw.shortDescription,500)||typeof raw.isFeatured!=='boolean')fail(400,'INVALID_PRODUCT','Проверьте описание, теги и коллекции')
  const previous=state.products.find(p=>p.id===id),now=new Date().toISOString()
  return {id:id||crypto.randomUUID(),slug:raw.slug,name:raw.name.trim(),category:raw.category,price:raw.price,currency:'RUB',images:raw.images,variants:raw.variants,collectionIds:raw.collectionIds,tags:raw.tags,description:raw.description,shortDescription:raw.shortDescription,isFeatured:raw.isFeatured,status:raw.status,publishedAt:raw.status==='published'?previous?.publishedAt||now:previous?.publishedAt||null,createdAt:previous?.createdAt||now,updatedAt:now}
}
export function createOrder(state:DemoState,input:OrderInput):Order {
  if(!input?.demoConsent||!input.contact||!text(input.contact.name,80)||!input.contact.name.trim()||!text(input.contact.email,120)||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.contact.email)||!text(input.contact.address,250)||input.contact.address.trim().length<5)fail(400,'INVALID_CONTACT','Заполните демонстрационные имя, email и адрес')
  if(!['pickup','courier'].includes(input.delivery))fail(400,'INVALID_DELIVERY','Выберите тестовый способ доставки')
  const quote=quoteCart(state,input.items)
  if(!quote.valid)fail(409,'STOCK_CHANGED','Некоторые товары недоступны. Обновите корзину.')
  if(quote.changed)fail(409,'PRICE_CHANGED','Цены изменились. Проверьте и подтвердите обновлённую корзину.')
  const shipping=input.delivery==='courier'?35000:0
  const order:Order={id:crypto.randomUUID(),number:`DF-${String(state.orders.length+1).padStart(4,'0')}`,items:quote.items.map(({stock,available,changed,...line})=>line),subtotal:quote.subtotal,shipping,total:quote.subtotal+shipping,status:'demo_created',createdAt:new Date().toISOString(),delivery:input.delivery}
  for(const l of quote.items){
    const product=state.products.find(p=>p.id===l.productId)!
    product.variants.find(v=>v.id===l.variantId)!.stock-=l.quantity
    product.updatedAt=order.createdAt
  }
  state.orders.unshift(order)
  return order // Contact data is validated and discarded, never retained.
}
export function saveCollection(state:DemoState,raw:Collection&{productIds?:string[]},id?:string){
  if(!raw||!text(raw.name,120)||!raw.name.trim()||!text(raw.slug,120)||!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(raw.slug)||!text(raw.description,2000)||!/^\/assets\/[a-z0-9-]+\.webp$/.test(raw.cover)||typeof raw.isFeatured!=='boolean')fail(400,'INVALID_COLLECTION','Проверьте название, slug, описание и обложку')
  if(state.collections.some(c=>c.id!==id&&c.slug===raw.slug))fail(400,'DUPLICATE_SLUG','Такой адрес коллекции уже существует')
  if(raw.productIds&&(!Array.isArray(raw.productIds)||raw.productIds.some(pid=>!state.products.some(p=>p.id===pid))))fail(400,'INVALID_PRODUCTS','Неизвестные товары в коллекции')
  const c={id:id||crypto.randomUUID(),slug:raw.slug,name:raw.name.trim(),description:raw.description,cover:raw.cover,isFeatured:raw.isFeatured}
  const i=state.collections.findIndex(c=>c.id===id);if(i>=0)state.collections[i]=c;else state.collections.push(c)
  if(raw.productIds)for(const p of state.products){p.collectionIds=p.collectionIds.filter(cid=>cid!==c.id);if(raw.productIds.includes(p.id))p.collectionIds.push(c.id)}
  return c
}
