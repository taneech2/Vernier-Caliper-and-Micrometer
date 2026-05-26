const CACHE = 'vernier-mic-v2';
const PRECACHE = [
  './index.html',
  './vernier-caliper.html',
  './micrometer.html',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Network-First: ดึงจาก Server ก่อนเสมอ → อัปเดตอัตโนมัติเมื่อออนไลน์
// ถ้าไม่มีเน็ต → ใช้ Cache สำรองแทน (ใช้ออฟไลน์ได้)
self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (res && res.status === 200 && res.type !== 'opaque') {
          caches.open(CACHE).then(c => c.put(e.request, res.clone()));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
