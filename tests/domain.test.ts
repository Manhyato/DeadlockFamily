import {test} from 'node:test'
import assert from 'node:assert/strict'
import {createSeed,categories} from '../server/utils/seed'
import {ApiError,listProducts,quoteCart,validateProduct,createOrder,saveCollection} from '../server/utils/domain'
const contact={name:'Тестовый гость',email:'guest@example.com',address:'Тестовый город, Архивная 1'}
test('catalog has exactly four categories, stable sort, search and pagination',()=>{
 const state=createSeed();assert.equal(categories.length,4)
 assert.equal(listProducts(state,{q:'Худи'}).total,2)
 assert.equal(listProducts(state,{category:'figurines'}).total,2)
 const sorted=listProducts(state,{sort:'price-asc',pageSize:50}).items;assert.ok(sorted.every((p,i)=>!i||p.price>=sorted[i-1]!.price))
 assert.equal(listProducts(state,{page:2,pageSize:8}).items.length,4)
 assert.throws(()=>listProducts(state,{category:'not-found'}),(e:unknown)=>e instanceof ApiError&&e.status===404)
})
test('cart combines matching variants, keeps sizes separate and rejects excessive total',()=>{
 const s=createSeed(),p=s.products[0]!,a={productId:p.id,variantId:p.variants[0]!.id,quantity:1,expectedPrice:p.price}
 const quote=quoteCart(s,[a,a,{...a,variantId:p.variants[1]!.id}]);assert.equal(quote.items.length,2);assert.equal(quote.items[0]!.quantity,2);assert.equal(quote.subtotal,p.price*3)
 assert.equal(quoteCart(s,[{...a,quantity:99}]).valid,false)
 assert.throws(()=>quoteCart(s,[{...a,quantity:-1}]),ApiError)
 assert.throws(()=>quoteCart(s,[{...a,quantity:60},{...a,quantity:60}]),ApiError)
})
test('orders use server prices, reject price/stock changes, retain no contacts',()=>{
 const s=createSeed(),p=s.products[0]!,item={productId:p.id,variantId:p.variants[0]!.id,quantity:2,expectedPrice:1}
 assert.throws(()=>createOrder(s,{items:[item],contact,delivery:'pickup',demoConsent:true}),(e:unknown)=>e instanceof ApiError&&e.code==='PRICE_CHANGED')
 item.expectedPrice=p.price;const order=createOrder(s,{items:[item],contact,delivery:'courier',demoConsent:true})
 assert.equal(order.total,p.price*2+35000);assert.equal(order.status,'demo_created');assert.equal(p.variants[0]!.stock,6);assert.equal(s.orders.length,1);assert.ok(!JSON.stringify(order).includes(contact.email))
 p.status='draft';assert.equal(quoteCart(s,[item]).valid,false)
 assert.throws(()=>createOrder(s,{items:[],contact,delivery:'pickup',demoConsent:true}),ApiError)
})
test('product drafts publish, hide, validate SKU, image, price and immutable id',()=>{
 const s=createSeed(),base=structuredClone(s.products[0]!);base.slug='new-test';base.status='draft';base.images=[];base.variants=base.variants.map(v=>({...v,sku:`NEW-${v.sku}`}))
 const draft=validateProduct(s,base);s.products.push(draft);assert.equal(listProducts(s).total,12)
 assert.throws(()=>validateProduct(s,{...draft,status:'published'},draft.id),(e:unknown)=>e instanceof ApiError&&e.code==='IMAGE_REQUIRED')
 const pub=validateProduct(s,{...draft,status:'published',images:[{url:'/assets/hoodie.webp',alt:'Demo'}]},draft.id);s.products[s.products.length-1]=pub;assert.equal(listProducts(s).total,13);assert.equal(pub.id,draft.id)
 assert.throws(()=>validateProduct(s,{...pub,price:-1},pub.id),ApiError)
 assert.throws(()=>validateProduct(s,{...pub,variants:[s.products[0]!.variants[0]!]},pub.id),ApiError)
 s.products[s.products.length-1]=validateProduct(s,{...pub,status:'draft'},pub.id);assert.equal(listProducts(s).total,12)
})
test('collections assign membership and remain distinct from categories',()=>{
 const s=createSeed();const c=saveCollection(s,{id:'',slug:'new-collection',name:'Новая история',description:'Тест',cover:'/assets/collection-archive.webp',isFeatured:true,productIds:['p1']})
 assert.equal(listProducts(s,{collection:c.slug}).total,1);assert.equal(categories.length,4)
 saveCollection(s,{...c,productIds:['p2']},c.id);assert.ok(!s.products[0]!.collectionIds.includes(c.id));assert.ok(s.products[1]!.collectionIds.includes(c.id))
})
