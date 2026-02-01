// 优化后的 Service Worker
// 使用 Stale-While-Revalidate 策略，提供更好的离线体验

const CACHE_NAME = 'link-manager-v2';
const STATIC_CACHE_NAME = 'static-v1';
const DYNAMIC_CACHE_NAME = 'dynamic-v1';

// 需要预缓存的静态资源
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/pwa-192x192.svg',
  '/pwa-512x512.svg'
];

// 安装事件 - 预缓存静态资源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Pre-caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// 激活事件 - 清理旧缓存
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // 删除旧版本的缓存
            if (
              cacheName !== STATIC_CACHE_NAME &&
              cacheName !== DYNAMIC_CACHE_NAME &&
              cacheName !== CACHE_NAME
            ) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// 辅助函数：确定使用哪个缓存策略
function getCacheStrategy(request) {
  const url = new URL(request.url);
  
  // 对于静态资源，使用 Cache First 策略
  if (STATIC_ASSETS.some(asset => url.pathname === asset || url.pathname.endsWith(asset))) {
    return 'cache-first';
  }
  
  // 对于 API 请求，使用 Network First 策略
  if (url.pathname.startsWith('/api/')) {
    return 'network-first';
  }
  
  // 对于其他资源，使用 Stale-While-Revalidate 策略
  return 'stale-while-revalidate';
}

// Cache First 策略：优先从缓存获取
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('[SW] Network request failed:', error);
    throw error;
  }
}

// Network First 策略：优先从网络获取
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache');
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Stale-While-Revalidate 策略：先返回缓存，同时在后台更新
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  // 在后台更新缓存
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse && networkResponse.status === 200) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch((error) => {
    console.error('[SW] Background fetch failed:', error);
  });
  
  // 如果有缓存，立即返回缓存
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // 如果没有缓存，等待网络请求
  return fetchPromise;
}

// Fetch 事件 - 根据请求类型使用不同的缓存策略
self.addEventListener('fetch', (event) => {
  // 只处理 GET 请求
  if (event.request.method !== 'GET') {
    return;
  }
  
  // 跳过非 HTTP(S) 请求
  if (!event.request.url.startsWith('http')) {
    return;
  }
  
  const strategy = getCacheStrategy(event.request);
  
  event.respondWith(
    (async () => {
      try {
        switch (strategy) {
          case 'cache-first':
            return await cacheFirst(event.request);
          case 'network-first':
            return await networkFirst(event.request);
          case 'stale-while-revalidate':
          default:
            return await staleWhileRevalidate(event.request);
        }
      } catch (error) {
        console.error('[SW] All strategies failed:', error);
        // 返回一个基本的离线页面
        return new Response('离线模式：无法连接到网络', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: new Headers({
            'Content-Type': 'text/plain'
          })
        });
      }
    })()
  );
});

// 消息事件 - 处理来自客户端的消息
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// 后台同步事件（可选，用于离线操作）
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(
      // 在这里处理离线时的数据同步
      console.log('[SW] Background sync triggered')
    );
  }
});

// 推送通知事件（可选）
self.addEventListener('push', (event) => {
  if (event.data) {
    const options = {
      body: event.data.text(),
      icon: '/pwa-192x192.svg',
      badge: '/pwa-192x192.svg'
    };
    
    event.waitUntil(
      self.registration.showNotification('链接管理器', options)
    );
  }
});
