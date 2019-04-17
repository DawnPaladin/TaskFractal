import ReactOnRails from 'react-on-rails';

// TODO: Convert to React hook

export default function deleteTask() {
	if (confirm(`Delete ${this.state.task.name}?`)) {
		let id = this.state.task.id;
		let headers = ReactOnRails.authenticityHeaders();
		headers["Content-Type"] = "application/json";

		fetch(`/tasks/${id}.json`, {
			method: "DELETE",
			headers: headers
		}).then(() => {
			var redirectUrl = this.state.task.parent_id ? this.state.task.parent_id : '/';
			window.location.replace(redirectUrl);
		})
		
	}
}
