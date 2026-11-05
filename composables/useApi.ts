import type { Product,ProductQuery,PageResult,Category,Collection,CartItem,CartQuote,Order,OrderInput,OrderStatus } from '~/shared/types'
export const errorMessage=(error:unknown)=>{const e=error as {data?:{error?:{message?:string}};message?:string};return e?.data?.error?.message||'Не удалось связаться с архивом. Попробуйте ещё раз.'}
export function useApi(){
  const config=useRuntimeConfig(),request=useRequestFetch(),event=useRequestEvent()
  const call=<T>(path:string,options:Record<string,unknown>={})=>request<T>(`${config.public.apiBase}${path}`,{...options,headers:import.meta.server&&event?.context.demoSession?{cookie:`df_demo=${event.context.demoSession.id}`}:{}})
  async function createDemoOrder(body:OrderInput){
    const order=await call<Order>('/orders',{method:'POST',body})
    // Purchases also invalidate previously visited and prefetched stock data.
    clearNuxtData(key=>key.startsWith('product-')||key.startsWith('catalog-')||key.startsWith('home-')||key.startsWith('admin-')||key.startsWith('edit-')||key==='collection-products')
    return order
  }
  return {
    categories:()=>call<Category[]>('/categories'),products:(query:ProductQuery={})=>call<PageResult<Product>>('/products',{query}),product:(slug:string)=>call<Product>(`/products/${encodeURIComponent(slug)}`),
    collections:()=>call<Collection[]>('/collections'),collection:(slug:string,query:ProductQuery={})=>call<Collection&{products:PageResult<Product>}>(`/collections/${encodeURIComponent(slug)}`,{query}),
    quote:(items:CartItem[])=>call<CartQuote>('/cart/quote',{method:'POST',body:{items}}),createOrder:createDemoOrder,order:(id:string)=>call<Order>(`/orders/${id}`),
    adminProducts:(query:ProductQuery={})=>call<PageResult<Product>>('/admin/products',{query}),adminProduct:(id:string)=>call<Product>(`/admin/products/${id}`),
    saveProduct:(body:Product,id?:string)=>call<Product>(`/admin/products${id?`/${id}`:''}`,{method:id?'PATCH':'POST',body}),deleteProduct:(id:string)=>call<{ok:true}>(`/admin/products/${id}`,{method:'DELETE'}),
    saveCollection:(body:Collection&{productIds:string[]},id?:string)=>call<Collection>(`/admin/collections${id?`/${id}`:''}`,{method:id?'PATCH':'POST',body}),
    orders:()=>call<Order[]>('/admin/orders'),updateOrder:(id:string,status:OrderStatus)=>call<Order>(`/admin/orders/${id}`,{method:'PATCH',body:{status}}),reset:()=>call<{ok:true}>('/demo/reset',{method:'POST'})
  }
}
