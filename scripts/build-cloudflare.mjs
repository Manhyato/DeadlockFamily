import {spawnSync} from 'node:child_process'
import {cp,mkdir,writeFile,readFile,rm} from 'node:fs/promises'
import {resolve,relative} from 'node:path'
const build=spawnSync(process.execPath,['node_modules/nuxt/bin/nuxt.mjs','build'],{stdio:'inherit',env:{...process.env,NITRO_PRESET:'cloudflare-module'}})
if(build.status!==0)process.exit(build.status||1)
// Restrict cleanup to generated output within this checkout.
const target=resolve('dist');if(relative(process.cwd(),target)!=='dist')throw new Error('Unexpected output path')
await rm(target,{recursive:true,force:true})
await mkdir('dist/server',{recursive:true});await mkdir('dist/.openai',{recursive:true})
await cp('.output/server','dist/server',{recursive:true});await cp('.output/public','dist/client',{recursive:true})
await writeFile('dist/server/index.js',`import app from './index.mjs';\nexport default {async fetch(request,env,ctx){\nconst path=new URL(request.url).pathname;\nif((path.startsWith('/assets/')||path.startsWith('/_nuxt/')||path==='/favicon.svg')&&env.ASSETS)return env.ASSETS.fetch(request);\nreturn app.fetch(request,env,ctx);\n}};\n`)
await writeFile('dist/.openai/hosting.json',await readFile('.openai/hosting.json'))
console.log('Cloudflare Worker and static assets prepared in dist/.')
