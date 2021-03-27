const APP_PREFIX = 'BudgetTracker';
const VERSION = '-v01';
const CACHE_NAME = APP_PREFIX + VERSION;
const FILES_TO_CACHE = [
	'./index.html',
	'./service-worker.js',
	'./css/styles.css',
	'./js/index.js',
	'./js/idb.js',
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

self.addEventListener('activate', function (e) {
	e.waitUntil(
		caches.keys().then(function (keyList) {
			console.log(keyList);
			let cacheKeeplist = keyList.filter(key => key.indexOf(APP_PREFIX));
			console.log(cacheKeeplist);

			cacheKeeplist.push(CACHE_NAME);

			return Promise.all(
				keyList.map((key, i) => {
					if (cacheKeeplist.indexOf(key) === -1) {
						console.log('deleteing cache: ' + keyList[i]);
						return caches.delete(keyList[i]);
					}
				})
			);
		})
	);
});

self.addEventListener('fetch', e => {
	if (e.request.headers.get('method') === 'POST') return fetch(e.request);

	// console.log('Fetching ' + e.request.url);

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
							return cache.match(e.request).then(req => {
								if (req) return req;
							});
						})
				)
				.catch(err => console.log(err))
		);
		return;
	}

	e.respondWith(
		fetch(e.request)
			.catch(err => {
				return caches
					.match(e.request)
					.then(req => {
						if (req) {
							console.log('Found in cache: ' + req);
							return req;
						} else {
							console.log(e.request);
							return fetch(e.request);
						}
					})
					.catch(err => console.log(err));
			})
			.catch(err => console.log(err))
	);
});
