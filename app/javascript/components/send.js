import network from './network';

export default function send(task) {
	let id = task.id;
	network.put(`/tasks/${id}.json`, {task});
}
