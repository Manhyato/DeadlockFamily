import { resolveSession } from '../utils/session'
import {defineEventHandler,setHeader,getCookie,setCookie,getRequestURL} from 'h3'
export default defineEventHandler(event=>{
  if(event.path.startsWith('/admin'))setHeader(event,'X-Robots-Tag','noindex, nofollow')
  if(event.path.startsWith('/assets/')||event.path.startsWith('/_nuxt/'))return
  const session=resolveSession(getCookie(event,'df_demo'))
  event.context.demoSession=session
  setCookie(event,'df_demo',session.id,{httpOnly:true,sameSite:'lax',path:'/',maxAge:86400,secure:getRequestURL(event).protocol==='https:'})
})
