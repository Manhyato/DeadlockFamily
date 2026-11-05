import { defineStore } from 'pinia'
import type { CartItem,Product,ProductVariant } from '~/shared/types'
export const useCartStore=defineStore('cart',()=>{
  const items=ref<CartItem[]>([]),hydrated=ref(false)
  const count=computed(()=>items.value.reduce((n,l)=>n+l.quantity,0))
  function hydrate(){if(hydrated.value||!import.meta.client)return;try{const data=JSON.parse(localStorage.getItem('df-cart-v1')||'[]');if(Array.isArray(data))items.value=data.filter(l=>l&&typeof l.productId==='string'&&typeof l.variantId==='string'&&Number.isInteger(l.quantity)&&l.quantity>0&&l.quantity<=99&&Number.isInteger(l.expectedPrice)).slice(0,100)}catch{}hydrated.value=true}
  function persist(){if(import.meta.client)try{localStorage.setItem('df-cart-v1',JSON.stringify(items.value))}catch{}}
  function add(product:Product,variant:ProductVariant,quantity=1){if(!variant.available||variant.stock<quantity)return false;const line=items.value.find(l=>l.productId===product.id&&l.variantId===variant.id);if((line?.quantity||0)+quantity>Math.min(variant.stock,99))return false;if(line)line.quantity+=quantity;else items.value.push({productId:product.id,variantId:variant.id,quantity,expectedPrice:variant.price??product.price});persist();return true}
  function quantity(productId:string,variantId:string,n:number){const line=items.value.find(l=>l.productId===productId&&l.variantId===variantId);if(line)line.quantity=Math.min(99,Math.max(1,Math.floor(n)));persist()}
  function remove(productId:string,variantId:string){items.value=items.value.filter(l=>!(l.productId===productId&&l.variantId===variantId));persist()}
  function clear(){items.value=[];persist()}
  function acceptPrices(prices:{productId:string;variantId:string;price:number}[]){for(const l of items.value){const p=prices.find(p=>p.productId===l.productId&&p.variantId===l.variantId);if(p)l.expectedPrice=p.price}persist()}
  return {items,count,hydrated,hydrate,add,quantity,remove,clear,acceptPrices}
})
