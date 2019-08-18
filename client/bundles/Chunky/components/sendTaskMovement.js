import network from './network';

export default function sendTaskMovement(taskId, destinationIndex, newParentId) {
	destinationIndex = destinationIndex + 1; // Ruby lists are 1-indexed
	
	var url;
	if (newParentId) {
		url = `/tasks/${taskId}/move/position/${destinationIndex}/parent/${newParentId}.json`;
	} else {
		url = `/tasks/${taskId}/move/position/${destinationIndex}.json`;
	}
	
	network.patch(url);
}
