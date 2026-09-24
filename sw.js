/* Riznica: App-Hülle für den Offline-Start. Kein Backup für Daten, die bleiben im localStorage. */
const PREFIX="riznica-"+encodeURIComponent(self.registration.scope)+"-";
const CACHE=PREFIX+"v8";
const CORE=["./","./index.html"];
const OPTIONAL=["./icon-180.png","./icon-192.png","./icon-512.png","./manifest.webmanifest"];
self.addEventListener("install",e=>{ e.waitUntil((async()=>{ const c=await caches.open(CACHE); await c.addAll(CORE); await Promise.all(OPTIONAL.map(a=>c.add(a).catch(()=>{}))); })()); });
self.addEventListener("activate",e=>{ e.waitUntil((async()=>{ const keys=await caches.keys(); await Promise.all(keys.filter(k=>k!==CACHE&&k.startsWith(PREFIX)).map(k=>caches.delete(k))); await self.clients.claim(); })()); });
self.addEventListener("message",e=>{ if(e.data&&e.data.type==="SKIP_WAITING") self.skipWaiting(); });
self.addEventListener("fetch",e=>{
  const r=e.request, url=new URL(r.url); if(r.method!=="GET"||url.origin!==self.location.origin) return;
  const scope=new URL(self.registration.scope); if(!url.pathname.startsWith(scope.pathname)) return;
  const page=r.mode==="navigate"||/\/index\.html$/.test(url.pathname)||url.pathname.endsWith("/");
  if(page){ e.respondWith((async()=>{ const c=await caches.open(CACHE); try{ const res=await fetch(r); if(res.ok){ await c.put("./index.html",res.clone()); } return res; }catch(err){ return (await c.match("./index.html"))||(await c.match("./"))||Response.error(); } })()); return; }
  e.respondWith((async()=>{ const c=await caches.open(CACHE); const hit=await c.match(r); if(hit) return hit; try{ const res=await fetch(r); if(res.ok) c.put(r,res.clone()); return res; }catch(err){ return Response.error(); } })());
});
