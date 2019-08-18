import network from './network';

// TODO: Convert to React hook

export default function deleteTask() {
	if (confirm(`Delete ${this.state.task.name}?`)) {
		let id = this.state.task.id;

		network.delete(`/tasks/${id}.json`)
		.then(() => {
			var redirectUrl = this.state.task.parent_id ? this.state.task.parent_id : '/tasks';
			window.location.replace(redirectUrl);
		})
		
	}
}
