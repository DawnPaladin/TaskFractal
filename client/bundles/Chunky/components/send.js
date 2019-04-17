import ReactOnRails from 'react-on-rails';

// TODO: Convert to React hook

export default function send(task) {
	let body = JSON.stringify({task});
	let id = task.id;
	
	let headers = ReactOnRails.authenticityHeaders();
	headers["Content-Type"] = "application/json";
	
	fetch(`/tasks/${id}.json`, {
		method: "PUT",
		body: body,
		headers: headers
	});
}
