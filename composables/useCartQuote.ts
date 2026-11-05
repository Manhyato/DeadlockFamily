import type {CartQuote} from '~/shared/types'
export function useCartQuote(){
  const api=useApi(),cart=useCartStore(),quote=ref<CartQuote|null>(null),pending=ref(false),error=ref('')
  let requestId=0
  async function refresh(){const id=++requestId;pending.value=true;error.value='';try{const result=await api.quote(cart.items);if(id===requestId)quote.value=result}catch(e){if(id===requestId)error.value=errorMessage(e)}finally{if(id===requestId)pending.value=false}}
  onMounted(()=>{cart.hydrate();refresh()})
  watch(()=>JSON.stringify(cart.items),()=>refresh())
  return {cart,quote,pending,error,refresh}
}
