let db;

const request = indexedDB.open('budget-tracker', 1);

request.onupgradeneeded = function (e) {
	console.log({ onupgradeneededEvent: e });
	const db = e.target.result;
	db.createObjectStore('transaction', { autoIncrement: true });
};

request.onsuccess = function (e) {
	console.log({ onsuccessEvent: e });
	db = e.target.result;

	if (navigator.onLine) postOfflineTransactions();
};

request.onerror = function (e) {
	console.log(e.target.errorCode);
};

function saveRecord(record) {
	const transaction = db.transaction(['transaction'], 'readwrite');
	const transactionObjectStore = transaction.objectStore('transaction');
	transactionObjectStore.add(record);
}

function postOfflineTransactions() {
	const transaction = db.transaction(['transaction'], 'readwrite');
	const transactionObjectStore = transaction.objectStore('transaction');

	const getAll = transactionObjectStore.getAll();

	getAll.onsuccess = async function () {
		if (!getAll.result.length) return;
		try {
			const response = await fetch(`/api/transaction${getAll.result.length > 1 ? `/bulk` : ``}`, {
				method: 'POST',
				body: JSON.stringify(getAll.result),
				headers: {
					Accept: 'application/json, text/plain, */*',
					'Content-Type': 'application/json',
				},
			});

			const data = await response.json();
			if (data.message) throw new Error(data);

			const transaction = db.transaction(['transaction'], 'readwrite');
			const transactionObjectStore = transaction.objectStore('transaction');
			transactionObjectStore.clear();

			const errorEl = document.querySelector('.error'); // not an error but a convenient location for message
			errorEl.textContent = 'Back online: Offline transactions sent to server.';
			setTimeout(() => (errorEl.textContent = ''), 1000 * 15);
			getTransactions();
		} catch (err) {
			console.log(err);
		}
	};
}

window.addEventListener('online', postOfflineTransactions);
