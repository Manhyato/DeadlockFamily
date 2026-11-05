import { createSeed } from './seed'
import type { DemoState } from '../../shared/types'
const sessions=new Map<string,{state:DemoState;expires:number}>()
export function resolveSession(id?:string){
  const now=Date.now()
  for(const [key,value] of sessions)if(value.expires<now)sessions.delete(key)
  if(id&&sessions.has(id)){const entry=sessions.get(id)!;entry.expires=now+86400000;return {id,state:entry.state}}
  if(sessions.size>=300)sessions.delete(sessions.keys().next().value!)
  const next=crypto.randomUUID(),state=createSeed();sessions.set(next,{state,expires:now+86400000});return {id:next,state}
}
export function resetSession(id:string){const state=createSeed();sessions.set(id,{state,expires:Date.now()+86400000});return state}
