// service-worker-optimized.js

const CACHE_VERSION = 'v2';
const CACHE_NAMES = {
  static: `link-manager-static-${CACHE_VERSION}`,
  dynamic: `link-manager-dynamic-${CACHE_VERSION}`,
  offline: `link-manager-offline-${CACHE_VERSION}`
};

// 需要缓存的静态资源
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/pwa-192x192.svg',
  '/pwa-512x512.svg'
];

// 安装 Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: 安装中...');
  event.waitUntil(
    Promise.all([
      // 缓存静态资源
      caches.open(CACHE_NAMES.static)
        .then((cache) => {
          console.log('Service Worker: 缓存静态资源');
          return cache.addAll(STATIC_ASSETS);
        }),
      // 缓存离线页面
      caches.open(CACHE_NAMES.offline)
        .then((cache) => {
          console.log('Service Worker: 缓存离线页面');
          // 注意：这里假设存在一个离线页面
          // 如果没有，可以移除这一行
          return cache.add('/');
        })
    ]).then(() => {
      // 跳过等待，直接激活
      return self.skipWaiting();
    })
  );
});

// 激活 Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: 激活中...');
  event.waitUntil(
    Promise.all([
      // 清理旧缓存
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!Object.values(CACHE_NAMES).includes(cacheName)) {
              console.log('Service Worker: 删除旧缓存:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // 立即控制所有客户端
      self.clients.claim()
    ])
  );
});

// 处理请求
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  
  // 忽略非同源请求
  if (url.origin !== self.origin) {
    return;
  }
  
  // 忽略浏览器扩展请求
  if (url.pathname.startsWith('/_')) {
    return;
  }
  
  // 处理不同类型的请求
  if (isStaticAsset(request)) {
    // 静态资源：Cache First 策略
    event.respondWith(cacheFirstStrategy(request));
  } else if (isNavigationRequest(request)) {
    // 导航请求：Network First 策略
    event.respondWith(networkFirstStrategy(request));
  } else {
    // 其他请求：Stale-While-Revalidate 策略
    event.respondWith(staleWhileRevalidateStrategy(request));
  }
});

// 后台同步
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

// 推送通知
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  try {
    const data = event.data.json();
    const options = {
      body: data.body || '您有新的通知',
      icon: '/pwa-192x192.svg',
      badge: '/pwa-192x192.svg',
      vibrate: [100, 50, 100],
      data: {
        url: data.url || '/'
      }
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || '链接管理器', options)
    );
  } catch (error) {
    console.error('Service Worker: 推送通知处理失败:', error);
  }
});

// 点击通知
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clientList) => {
      const url = event.notification.data?.url || '/';
      
      // 如果已有窗口，则聚焦
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      
      // 否则打开新窗口
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
    })
  );
});

// 辅助函数

// 判断是否为静态资源
function isStaticAsset(request) {
  const url = new URL(request.url);
  const staticExtensions = [
    '.html', '.js', '.css', '.svg', '.png', '.jpg', '.jpeg', '.gif', '.webp',
    '.json', '.ico', '.txt', '.xml', '.manifest'
  ];
  return staticExtensions.some(ext => url.pathname.endsWith(ext));
}

// 判断是否为导航请求
function isNavigationRequest(request) {
  return request.mode === 'navigate';
}

// Cache First 策略
async function cacheFirstStrategy(request) {
  try {
    // 先从缓存中获取
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // 缓存中没有则从网络获取
    const networkResponse = await fetch(request);
    
    // 如果响应有效，更新缓存
    if (networkResponse && networkResponse.ok) {
      const cache = await caches.open(CACHE_NAMES.static);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Service Worker: Cache First 策略失败:', error);
    // 返回离线页面
    return caches.match('/');
  }
}

// Network First 策略
async function networkFirstStrategy(request) {
  try {
    // 先从网络获取
    const networkResponse = await fetch(request);
    
    // 如果响应有效，更新缓存
    if (networkResponse && networkResponse.ok) {
      const cache = await caches.open(CACHE_NAMES.dynamic);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Service Worker: Network First 策略失败:', error);
    // 网络失败时从缓存获取
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    // 缓存中也没有则返回离线页面
    return caches.match('/');
  }
}

// Stale-While-Revalidate 策略
async function staleWhileRevalidateStrategy(request) {
  try {
    // 并行执行：从缓存获取并从网络获取
    const [cachedResponse, networkResponsePromise] = await Promise.all([
      caches.match(request),
      fetch(request).catch(() => null)
    ]);
    
    // 处理网络响应（更新缓存）
    if (networkResponsePromise && networkResponsePromise.ok) {
      const cache = await caches.open(CACHE_NAMES.dynamic);
      cache.put(request, networkResponsePromise.clone());
    }
    
    // 优先返回缓存响应
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // 缓存中没有则返回网络响应
    return networkResponsePromise;
  } catch (error) {
    console.error('Service Worker: Stale-While-Revalidate 策略失败:', error);
    // 全部失败时返回离线页面
    return caches.match('/');
  }
}

// 同步数据
async function syncData() {
  try {
    console.log('Service Worker: 开始同步数据');
    // 这里可以添加数据同步逻辑
    // 例如：将本地存储的待同步数据发送到服务器
    return true;
  } catch (error) {
    console.error('Service Worker: 数据同步失败:', error);
    return false;
  }
}