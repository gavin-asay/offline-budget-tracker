const APP_PREFIX = 'BudgetTracker';
const VERSION = '-v01';
const CACHE_NAME = APP_PREFIX + VERSION;
const FILES_TO_CACHE = [
	'./index.html',
	'./service-worker.js',
	'./css/styles.css',
	'./js/index.js',
	'./idb.js',
	'./icons/icon-72x72.png',
	'./icons/icon-96x96.png',
	'./icons/icon-128x128.png',
	'./icons/icon-144x144.png',
	'./icons/icon-152x152.png',
	'./icons/icon-192x192.png',
	'./icons/icon-384x384.png',
	'./icons/icon-512x512.png',
];

self.addEventListener('install', async e => {
	e.waitUntil(
		caches.open(CACHE_NAME).then(cache => {
			console.log(`Cache ${CACHE_NAME} installed successfully.`);
			return cache.addAll(FILES_TO_CACHE);
		})
	);
});

self.addEventListener('activate', e => {
	e.waitUntil(
		caches.keys().then(keyList => {
			let cacheKeepList = keyList.filter(key => !keyList.includes(key));
			cacheKeepList.push(CACHE_NAME);

			return Promise.resolve(
				keyList.map((key, i) => {
					if (!cacheKeepList.includes(key)) {
						console.log('Deleteing cache: ' + keyList[i]);
						return caches.delete(keyList[i]);
					}
				})
			);
		})
	);
});

self.addEventListener('fetch', e => {
	if (e.request.headers.method === 'POST') return fetch(e.request);

	console.log('Fetching ' + e.request.url);

	if (e.request.url.includes('/api/')) {
		e.respondWith(
			caches
				.open(CACHE_NAME)
				.then(cache =>
					fetch(e.request)
						.then(response => {
							if (response.status === 200) {
								cache.put(e.request.url, response.clone());
							}
							return response;
						})
						.catch(err => {
							return cache.match(e.request);
						})
				)
				.catch(err => console.log(err))
		);
	}

	e.respondWith(
		fetch(e.request).catch(() => {
			return caches.match(e.request).then(res => {
				if (res) return res;
				else if (evt.request.headers.get('accept').includes('text/html')) return caches.match('/');
			});
		})
	);
});
