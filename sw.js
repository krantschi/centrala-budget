/* Only program assets enter the offline cache. Never statements or vaults. */
const CACHE='centrala-budget-code-v1';
const FILES=['./','./index.html','./style.css','./app.js','./core.js','./vault.js','./parser.js','./manifest.webmanifest','./icon-180.png','./icon-192.png','./icon-512.png','./vendor/pdf.mjs','./vendor/pdf.worker.mjs'];
const allowed=new Set(FILES.map(p=>new URL(p,self.registration.scope).href));
self.addEventListener('install',event=>event.waitUntil((async()=>{const cache=await caches.open(CACHE);try{await cache.addAll(FILES);}catch(e){await caches.delete(CACHE);throw e;}})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{for(const key of await caches.keys())if(key.startsWith('centrala-budget-code-')&&key!==CACHE)await caches.delete(key);await self.clients.claim();})()));
self.addEventListener('message',event=>{if(event.data?.type==='ACTIVATE')self.skipWaiting();});
self.addEventListener('fetch',event=>{if(event.request.method!=='GET')return;const url=new URL(event.request.url);if(url.origin!==self.location.origin)return;const exact=url.href;if(allowed.has(exact)){event.respondWith((async()=>{const cache=await caches.open(CACHE);return await cache.match(event.request)||fetch(event.request);})());}else if(event.request.mode==='navigate'&&url.pathname===new URL(self.registration.scope).pathname){event.respondWith(caches.match(new URL('./index.html',self.registration.scope).href).then(r=>r||fetch(event.request)));}});
