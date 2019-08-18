import axios from 'axios';
import ReactOnRails from 'react-on-rails';

let headers = ReactOnRails.authenticityHeaders();
headers["Content-Type"] = "application/json";

const network = axios.create({ headers });

network.interceptors.response.use(response => {
	console.log(response);
	let json;
	if (typeof response.data === "string") {
		json = JSON.parse(response.data);
	} else {
		json = response.data;
	}
	console.log(json);
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
