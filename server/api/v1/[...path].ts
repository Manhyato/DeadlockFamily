import { ApiError,fail,listProducts,quoteCart,validateProduct,createOrder,saveCollection } from '../../utils/domain'
import {defineEventHandler,setHeader,setResponseStatus,getQuery,getRouterParam,readBody} from 'h3'
import { categories } from '../../utils/seed'
import { resetSession } from '../../utils/session'
import type { DemoState,Product,Collection,OrderInput,OrderStatus,ProductQuery } from '../../../shared/types'
export default defineEventHandler(async event=>{
  setHeader(event,'Cache-Control','no-store')
  try{
    const {state,id:sessionId}=event.context.demoSession as {state:DemoState;id:string}
    const query=getQuery(event) as unknown as ProductQuery
    if(query.scenario==='400')fail(400,'DEMO_BAD_REQUEST','Тестовая ошибка: неверный запрос')
    if(query.scenario==='404')fail(404,'DEMO_NOT_FOUND','Тестовая ошибка: запись не найдена')
    if(query.scenario==='500')fail(500,'DEMO_SERVER_ERROR','Архив временно недоступен. Попробуйте ещё раз.')
    const path=(getRouterParam(event,'path')||'').split('/').filter(Boolean),method=event.method
    if(method==='GET'&&path.join('/')==='categories')return categories
    if(path.join('/')==='demo/reset'&&method==='POST'){resetSession(sessionId);return {ok:true}}
    if(path.join('/')==='cart/quote'&&method==='POST'){const body=await readBody(event);return quoteCart(state,body?.items)}
    if(path[0]==='products'&&method==='GET'){
      if(path.length===1)return query.scenario==='empty'?{items:[],total:0,page:1,pageSize:8}:listProducts(state,query)
      if(path.length===2){const p=state.products.find(p=>p.slug===path[1]&&p.status==='published');if(!p)fail(404,'PRODUCT_NOT_FOUND','Товар не найден');return p}
    }
    if(path[0]==='collections'&&method==='GET'){
      if(path.length===1)return state.collections
      if(path.length===2){const c=state.collections.find(c=>c.slug===path[1]);if(!c)fail(404,'COLLECTION_NOT_FOUND','Коллекция не найдена');return {...c,products:listProducts(state,{...query,collection:c.id})}}
    }
    if(path[0]==='orders'){
      if(path.length===1&&method==='POST'){const order=createOrder(state,await readBody<OrderInput>(event));setResponseStatus(event,201);return order}
      if(path.length===2&&method==='GET'){const order=state.orders.find(o=>o.id===path[1]);if(!order)fail(404,'ORDER_NOT_FOUND','Тестовый заказ не найден в этой сессии');return order}
    }
    if(path[0]==='admin'){
      if(path[1]==='products'){
        if(path.length===2&&method==='GET')return listProducts(state,query,true)
        if(path.length===2&&method==='POST'){const p=validateProduct(state,await readBody<Product>(event));state.products.unshift(p);setResponseStatus(event,201);return p}
        const i=state.products.findIndex(p=>p.id===path[2]);if(i<0)fail(404,'PRODUCT_NOT_FOUND','Товар не найден')
        if(method==='GET')return state.products[i]
        if(method==='PATCH'){const body=await readBody<Partial<Product>>(event);const p=validateProduct(state,{...state.products[i],...body},path[2]);state.products[i]=p;return p}
        if(method==='DELETE'){state.products.splice(i,1);return {ok:true}}
      }
      if(path[1]==='collections'){
        if(path.length===2&&method==='GET')return state.collections
        if(path.length===2&&method==='POST'){const c=saveCollection(state,await readBody<Collection>(event));setResponseStatus(event,201);return c}
        if(path.length===3&&method==='PATCH'){const previous=state.collections.find(c=>c.id===path[2]);if(!previous)fail(404,'COLLECTION_NOT_FOUND','Коллекция не найдена');return saveCollection(state,{...previous,...await readBody(event)},path[2])}
      }
      if(path[1]==='orders'){
        if(path.length===2&&method==='GET')return state.orders
        if(path.length===3&&method==='PATCH'){const order=state.orders.find(o=>o.id===path[2]);if(!order)fail(404,'ORDER_NOT_FOUND','Заказ не найден');const body=await readBody<{status:OrderStatus}>(event);if(!['demo_created','demo_processing','demo_completed','demo_cancelled'].includes(body?.status))fail(400,'INVALID_STATUS','Недопустимый статус');order.status=body.status;return order}
      }
    }
    fail(404,'NOT_FOUND','Маршрут не найден')
  }catch(error){
    const e=error instanceof ApiError?error:(error as {statusCode?:number})?.statusCode===400?new ApiError(400,'INVALID_JSON','Некорректный JSON в запросе'):new ApiError(500,'INTERNAL_ERROR','Не удалось выполнить запрос. Попробуйте ещё раз.')
    setResponseStatus(event,e.status);return {error:{code:e.code,message:e.message}}
  }
})
