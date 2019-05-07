import ReactOnRails from 'react-on-rails';

export default function sendTaskMovement(taskId, destinationIndex, newParentId) {
	destinationIndex = destinationIndex + 1; // Ruby lists are 1-indexed
	
	var url;
	if (newParentId) {
		url = `/tasks/${taskId}/move/position/${destinationIndex}/parent/${newParentId}.json`;
	} else {
		url = `/tasks/${taskId}/move/position/${destinationIndex}.json`;
	}
	
	const headers = ReactOnRails.authenticityHeaders();
	headers["Content-Type"] = "application/json";
	fetch(url, { method: "PATCH", headers })
	.then(response => {
		if (response.ok) {
			return response.json();
		} else {
			throw new Error("Couldn't move task.");
		}
	}).then(json => {
		if (json.error) {
			toastr.error(json.error);
		}
	}).catch(error => {
		toastr.error(error.message);
	})
}
