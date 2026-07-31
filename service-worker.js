// service-worker.js - 离线优先策略
const CACHE_VERSION = 'v3';
const CACHE_NAMES = {
  precache: `app-precache-${CACHE_VERSION}`,
  runtime: `app-runtime-${CACHE_VERSION}`
};

// 预缓存列表 - 应用核心资源
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/pwa-192x192.svg',
  '/pwa-512x512.svg',
  '/favicon.ico'
];

// 安装：预缓存核心资源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAMES.precache).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch((err) => {
        console.warn('部分预缓存资源加载失败：', err);
        // 即使部分资源失败，也继续安装
        return Promise.all(
          PRECACHE_URLS.map((url) =>
            cache.add(url).catch(() => null)
          )
        );
      });
    }).then(() => self.skipWaiting())
  );
});

// 激活：清理旧缓存
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      const currentCaches = Object.values(CACHE_NAMES);
      return Promise.all(
        cacheNames
          .filter((name) => !currentCaches.includes(name))
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// 消息：支持跳过等待
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// 请求拦截：离线优先策略
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // 只处理同源请求
  if (url.origin !== self.origin) {
    return;
  }

  // 不处理浏览器扩展请求
  if (url.pathname.startsWith('/_')) {
    return;
  }

  // GET 请求才缓存
  if (request.method !== 'GET') {
    return;
  }

  // 导航请求（HTML 页面）：Network First + 缓存回退
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAMES.runtime).then((cache) => {
            cache.put(request, copy);
          });
          return response;
        })
        .catch(() => {
          // 网络失败，尝试返回缓存的 index.html（App Shell）
          return caches.match('/').then((cached) => {
            return cached || caches.match('/index.html');
          });
        })
    );
    return;
  }

  // 静态资源（JS/CSS/图片等）：Cache First + 后台更新
  if (isStaticAsset(url.pathname)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) {
          // 后台更新缓存
          fetch(request).then((response) => {
            if (response && response.ok) {
              caches.open(CACHE_NAMES.runtime).then((cache) => {
                cache.put(request, response);
              });
            }
          }).catch(() => {});
          return cached;
        }
        // 缓存未命中，从网络获取并缓存
        return fetch(request)
          .then((response) => {
            if (response && response.ok) {
              const copy = response.clone();
              caches.open(CACHE_NAMES.runtime).then((cache) => {
                cache.put(request, copy);
              });
            }
            return response;
          })
          .catch(() => {
            // 网络失败，返回离线回退
            return caches.match('/');
          });
      })
    );
    return;
  }

  // 其他请求：Stale-While-Revalidate
  event.respondWith(
    caches.match(request).then((cached) => {
      const fetchPromise = fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAMES.runtime).then((cache) => {
              cache.put(request, copy);
            });
          }
          return response;
        })
        .catch(() => cached || caches.match('/'));

      return cached || fetchPromise;
    })
  );
});

// 判断是否为静态资源
function isStaticAsset(pathname) {
  const extensions = [
    '.js', '.css', '.svg', '.png', '.jpg', '.jpeg', '.gif', '.webp',
    '.ico', '.woff', '.woff2', '.ttf', '.eot', '.json', '.txt', '.xml'
  ];
  return extensions.some((ext) => pathname.endsWith(ext));
}