function search(query, cb) {
	return fetch(`api/food?q=${query}`, {
		accept: "application/json"
	})
	.then(checkStatus)
	.then(parseJSON)
	.then(cb);
}

function index(callback) {
	return fetch('chunks', {
		accept: "application/json"
	})
	.then(checkStatus)
	.then(parseJSON)
	.then(callback);
}

function testChunk(callback) {
	return fetch('chunks/1', {
		accept: "application/json"
	})
	.then(checkStatus)
	.then(parseJSON)
	.then(callback);
}

function checkStatus(response) {
	if (response.status >= 200 && response.status < 300) {
		return response;
	}
	const error = new Error(`HTTP Error ${response.statusText}`);
	error.status = response.statusText;
	error.response = response;
	console.log(error); // eslint-disable-line no-console
	throw error;
}

function parseJSON(response) {
	return response.json();
}

const Client = { index, testChunk };
export default Client;
