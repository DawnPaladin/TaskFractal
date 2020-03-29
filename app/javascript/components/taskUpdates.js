// Notifies other components that a task's status has changed.

function broadcast(task, from) {
	task.id = Number(task.id); // convert from string if necessary
	const event = new CustomEvent("taskUpdate", { detail: { task, from }});
	document.dispatchEvent(event);
}

var eventListener;
function subscribe(callback) {
	eventListener = document.addEventListener("taskUpdate", event => {
		callback(event);
	});
}

function unsubscribe() {
	if (eventListener) {
		document.removeEventListener("taskUpdate", eventListener)
	}
}

const taskUpdates = { broadcast, subscribe, unsubscribe };
export default taskUpdates;
