// Primero internet (versión más nueva); si no hay conexión, la copia guardada.
const C="banco-tv-v9";
const FILES=["./","index.html","manifest.webmanifest","icon-192.png","icon-512.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(FILES.map(f=>new Request(f,{cache:"reload"})))));self.skipWaiting()});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))));self.clients.claim()});
self.addEventListener("fetch",e=>{
  const req=e.request;
  if(req.method!=="GET")return;
  const url=new URL(req.url);
  const same=url.origin===location.origin;
  const font=url.hostname.startsWith("fonts.g");
  if(!same&&!font)return; // las consultas a la IA van directo a internet
  if(font){ // fuentes: copia guardada primero
    e.respondWith(caches.match(req).then(r=>r||fetch(req).then(res=>{if(res.ok){const cp=res.clone();caches.open(C).then(c=>c.put(req,cp))}return res})));
    return;
  }
  e.respondWith(
    fetch(req,{cache:"no-cache"}).then(res=>{
      if(res.ok){const cp=res.clone();caches.open(C).then(c=>c.put(req,cp))}
      return res;
    }).catch(()=>caches.match(req).then(r=>r||caches.match("index.html")))
  );
});
