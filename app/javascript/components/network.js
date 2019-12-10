// Performs network calls to the Rails backend.
// Pipes success and error responses to Toastr.

import axios from 'axios';
import toastr from 'toastr';

const csrfToken = document.querySelector('[name="csrf-token"]').content;

const network = axios.create();
network.defaults.headers.common['X-CSRF-Token'] = csrfToken;

network.interceptors.response.use(response => {
	// console.log(response);
	let json;
	if (typeof response.data === "string") {
		json = JSON.parse(response.data);
	} else {
		json = response.data;
	}
	// console.log(json);
	if (json.status === "ok") {
		if (json.text) toastr.info(json.text);
	} else if (json.error) {
		toastr.error(json.error);
	}
	return response;
}, error => {
	toastr.error(error);
	return error;
});

export default network;
