import network from './network';

// TODO: Convert to React hook

export default function send(task) {
	let id = task.id;
	network.put(`/tasks/${id}.json`, {task});
}
