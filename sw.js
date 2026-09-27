const CACHE="nael-production-v194-mobilefix-paypal";
const ASSETS=["./","./index.html","./manifest.webmanifest","./privacy.html","./support.html"];
self.addEventListener("install",e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET") return;
  e.respondWith(fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return r}).catch(()=>caches.match(e.request).then(r=>r||caches.match("./index.html"))));
});
self.addEventListener("push",event=>{
  let data={title:"Naël",body:"Vous avez un nouveau rappel.",url:"/"};
  try{if(event.data)data=Object.assign(data,event.data.json())}catch(e){}
  event.waitUntil(self.registration.showNotification(data.title,{body:data.body,data:{url:data.url||"/"}}));
});
self.addEventListener("notificationclick",event=>{
  event.notification.close();
  const url=event.notification.data?.url||"/";
  event.waitUntil(clients.matchAll({type:"window",includeUncontrolled:true}).then(list=>{for(const c of list){if("focus" in c)return c.focus()}if(clients.openWindow)return clients.openWindow(url)}));
});