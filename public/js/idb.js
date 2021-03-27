let db;

const request = indexebDB.open('budget-tracker', 1);

request.onupgradeneeded() = function (e) {
	console.log({ onupgradeneededEvent: e });
	const db = e.target.result;
	db.createObjectStore('transaction', { autoIncrement: true });
};

request.onsuccess() = function (e) {
	console.log({ onsuccessEvent: e });
	db = e.target.result;

	if (navigator.onLine) postOfflineTransactions();
};

request.onerror() = function (e) {
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

	getAll.onsuccess() = async function () {
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
		} catch (err) {
			console.log(err);
		}
	};
}

window.addEventListener('online', postOfflineTransactions);
