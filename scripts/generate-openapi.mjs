import {writeFile} from 'node:fs/promises'
const ref=name=>({$ref:`#/components/schemas/${name}`}),str={type:'string'},integer={type:'integer',minimum:0},array=items=>({type:'array',items})
const object=(properties,required=Object.keys(properties))=>({type:'object',properties,required})
const schemas={
 Category:object({id:str,slug:{type:'string',enum:['clothing','keychains','figurines','souvenirs']},name:str,icon:str,description:str}),
 ProductImage:object({url:str,alt:str}),
 ProductVariant:object({id:str,sku:str,size:str,color:str,stock:{...integer,maximum:9999},available:{type:'boolean'},price:integer},['id','sku','stock','available']),
 Product:object({id:str,slug:str,name:str,shortDescription:str,description:str,category:{type:'string',enum:['clothing','keychains','figurines','souvenirs']},collectionIds:array(str),tags:array(str),images:array(ref('ProductImage')),price:integer,currency:{type:'string',enum:['RUB']},variants:array(ref('ProductVariant')),status:{type:'string',enum:['draft','published','archived']},isFeatured:{type:'boolean'},publishedAt:{type:'string',format:'date-time',nullable:true},createdAt:{type:'string',format:'date-time'},updatedAt:{type:'string',format:'date-time'}}),
 Collection:object({id:str,slug:str,name:str,description:str,cover:str,isFeatured:{type:'boolean'}}),
 CollectionInput:object({slug:str,name:str,description:str,cover:str,isFeatured:{type:'boolean'},productIds:array(str)}),
 CartItem:object({productId:str,variantId:str,quantity:{type:'integer',minimum:1,maximum:99},expectedPrice:integer}),
 OrderItem:object({productId:str,variantId:str,quantity:{type:'integer',minimum:1},expectedPrice:integer,name:str,variantLabel:str,price:integer,image:str}),
 Order:object({id:str,number:str,items:array(ref('OrderItem')),subtotal:integer,shipping:integer,total:integer,status:{type:'string',enum:['demo_created','demo_processing','demo_completed','demo_cancelled']},createdAt:{type:'string',format:'date-time'},delivery:{type:'string',enum:['pickup','courier']}}),
 OrderInput:object({items:array(ref('CartItem')),contact:object({name:{type:'string',maxLength:80,minLength:1},email:{type:'string',format:'email',maxLength:120},address:{type:'string',minLength:5,maxLength:250}}),delivery:{type:'string',enum:['pickup','courier']},demoConsent:{type:'boolean',enum:[true]}}),
 CartQuote:object({items:array({allOf:[ref('OrderItem'),object({stock:integer,available:{type:'boolean'},changed:{type:'boolean'}})]}),subtotal:integer,valid:{type:'boolean'},changed:{type:'boolean'}}),
 Error:object({error:object({code:str,message:str})}),
 ProductPage:object({items:array(ref('Product')),total:integer,page:{type:'integer',minimum:1},pageSize:{type:'integer',minimum:1,maximum:50}}),
 CollectionPage:{allOf:[ref('Collection'),object({products:ref('ProductPage')})]},Ok:object({ok:{type:'boolean'}})
}
const productExample={id:'p1',slug:'archive-hoodie',name:'Худи «Архив»',shortDescription:'Хлопковое худи с вышивкой DF',description:'Демонстрационный товар',category:'clothing',collectionIds:['essentials'],tags:['архив'],images:[{url:'/assets/hoodie.webp',alt:'Худи «Архив»'}],price:590000,currency:'RUB',variants:[{id:'v1-0',sku:'DF-1-S',size:'S',color:'Угольный',stock:8,available:true}],status:'published',isFeatured:true,publishedAt:'2026-11-05T00:00:00.000Z',createdAt:'2026-11-05T00:00:00.000Z',updatedAt:'2026-11-05T00:00:00.000Z'}
const writable=Object.fromEntries(Object.entries(schemas.Product.properties).filter(([key])=>!['id','currency','publishedAt','createdAt','updatedAt'].includes(key)))
schemas.ProductInput=object(writable)
schemas.ProductPatch=object(writable,[])
const collectionExample={id:'essentials',slug:'essentials',name:'Символы семьи',description:'Вещи, которые объединяют.',cover:'/assets/collection-essentials.webp',isFeatured:true}
const orderItem={productId:'p1',variantId:'v1-0',quantity:1,expectedPrice:590000,name:'Худи «Архив»',variantLabel:'S / Угольный',price:590000,image:'/assets/hoodie.webp'}
const orderExample={id:'00000000-0000-4000-8000-000000000001',number:'DF-0001',items:[orderItem],subtotal:590000,shipping:0,total:590000,status:'demo_created',createdAt:'2026-11-05T00:00:00.000Z',delivery:'pickup'}
const examples={Product:productExample,Collection:collectionExample,CollectionInput:{...collectionExample,productIds:['p1']},Order:orderExample,ProductPage:{items:[productExample],total:1,page:1,pageSize:8},CollectionPage:{...collectionExample,products:{items:[productExample],total:1,page:1,pageSize:8}},CartQuote:{items:[{...orderItem,stock:8,available:true,changed:false}],subtotal:590000,valid:true,changed:false},Ok:{ok:true},Category:{id:'clothing',slug:'clothing',name:'Одежда',icon:'shirt',description:'Любимые вещи на каждый день'}}
const content=(schema,example)=>({'application/json':{schema,...(example?{example}:{})}})
const paths={}
function op(path,method,summary,result,{body,created=false,list=false,params=[],description=''}={}){
 const errors={400:['INVALID_REQUEST','Проверьте входные данные'],404:['NOT_FOUND','Запись не найдена'],409:['STOCK_CHANGED','Остаток или цена изменились'],500:['DEMO_SERVER_ERROR','Архив временно недоступен. Попробуйте ещё раз.']}
 const responses={[created?201:200]:{description:created?'Создано':'Успешный ответ',content:content(list?array(ref(result)):ref(result),list?[examples[result]]:examples[result])}}
 for(const [status,[code,message]] of Object.entries(errors))responses[status]={description:message,content:content(ref('Error'),{error:{code,message}})}
 paths[path]??={};paths[path][method]={summary,description:description||'Демонстрационные данные изолированы cookie df_demo. Сценарии ошибок: ?scenario=400, 404, 500. Контактные данные не сохраняются.',operationId:`${method}_${path.replace(/[^a-z0-9]/gi,'_')}`,parameters:[...([...path.matchAll(/\{(\w+)\}/g)].map(m=>({name:m[1],in:'path',required:true,schema:str}))),...params,{name:'scenario',in:'query',schema:{type:'string',enum:['400','404','500','empty']}}],responses,...(body?{requestBody:{required:true,content:content(typeof body==='string'?ref(body):body,typeof body==='string'?examples[body]:undefined)}}:{})}
}
const filters=['q','category','collection','available','sort','status'].map(name=>({name,in:'query',schema:str})).concat(['page','pageSize'].map(name=>({name,in:'query',schema:{type:'integer',minimum:1}})))
op('/products','get','Поиск, фильтры и пагинация опубликованных товаров','ProductPage',{params:[...filters,...['new','featured'].map(name=>({name,in:'query',schema:{type:'string',enum:['true','false']}}))]})
op('/products/{slug}','get','Опубликованный товар','Product');op('/categories','get','Ровно четыре категории','Category',{list:true});op('/collections','get','Тематические коллекции','Collection',{list:true});op('/collections/{slug}','get','Коллекция с опубликованными товарами','CollectionPage',{params:filters})
op('/cart/quote','post','Проверка текущих цен и остатков','CartQuote',{body:object({items:array(ref('CartItem'))})})
examples.OrderInput={items:[{productId:'p1',variantId:'v1-0',quantity:1,expectedPrice:590000}],contact:{name:'Тестовый гость',email:'guest@example.com',address:'Тестовый город, Архивная 1'},delivery:'pickup',demoConsent:true}
op('/orders','post','Создать тестовый заказ без оплаты','Order',{body:'OrderInput',created:true,description:'Цены и остатки проверяются сервером. expectedPrice нужен только для проверки согласия с ценой. При PRICE_CHANGED или STOCK_CHANGED возвращается 409. Контакты проверяются и отбрасываются. Заказ demo_created хранится только в демо-сессии.'});op('/orders/{id}','get','Тестовый заказ текущей сессии','Order')
examples.ProductInput=Object.fromEntries(Object.entries(productExample).filter(([key])=>key in writable));examples.ProductPatch={price:620000,status:'published'}
op('/admin/products','get','Все товары, включая черновики','ProductPage',{params:filters});op('/admin/products','post','Создать товар','Product',{body:'ProductInput',created:true});op('/admin/products/{id}','get','Товар для редактирования','Product');op('/admin/products/{id}','patch','Изменить, опубликовать или архивировать товар','Product',{body:'ProductPatch'});op('/admin/products/{id}','delete','Удалить товар','Ok')
op('/admin/collections','get','Коллекции для редактора','Collection',{list:true});op('/admin/collections','post','Создать коллекцию с товарами','Collection',{body:'CollectionInput',created:true});op('/admin/collections/{id}','patch','Изменить коллекцию и состав','Collection',{body:'CollectionInput'})
op('/admin/orders','get','Список тестовых заказов текущей сессии','Order',{list:true});op('/admin/orders/{id}','patch','Изменить тестовый статус заказа','Order',{body:object({status:schemas.Order.properties.status})});op('/demo/reset','post','Сбросить демо-каталог, коллекции и заказы','Ok')
await writeFile('docs/openapi.json',JSON.stringify({openapi:'3.0.3',info:{title:'Deadlock Family Mock API',version:'1.0.0',description:'MVP без реальной базы данных, платежей и авторизации. Цены в копейках. Административные маршруты открыты только для демонстрации, не являются защищёнными.'},servers:[{url:'/api/v1'}],paths,components:{schemas,securitySchemes:{demoSession:{type:'apiKey',in:'cookie',name:'df_demo',description:'Автоматически создаваемая изолированная демо-сессия. Это не авторизация.'}}}},null,2)+'\n')
console.log('OpenAPI: 19 operations documented.')
