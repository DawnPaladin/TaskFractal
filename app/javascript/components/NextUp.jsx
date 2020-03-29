import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';

import NextUpCard from './NextUpCard';

import network from './network';
import taskUpdates from './taskUpdates';

export default function NextUp(props) {
	const [tasks, setTasks] = useState([]);
	const [taskIds, setTaskIds] = useState([]); // make it easy to look up tasks in NextUpTasks by their id
	const [loadingTasks, setLoadingTasks] = useState(true);
	
	// Format task data for use with NextUpCards
	const formatTasks = useCallback(tasks => {
		const taskIds = [];
		const formattedTasks = tasks.map(taggedTask => {
			var task = taggedTask.task;
			task.score = taggedTask.score;
			task.reasons = taggedTask.reasons;
			task.ancestors = taggedTask.ancestors;
			taskIds.push(task.id);
			return task;
		});
		setTaskIds(taskIds);
		return formattedTasks;
	}, [taskIds]);
	
	const fetchTasks = useCallback(() => {
		setLoadingTasks(true);
		const url = props.taskId ? `/next_up/${props.taskId}.json` : '/next_up.json';
		network.get(url)
			.then(response => {
				const formattedTasks = formatTasks(response.data);
				setTasks(formattedTasks);
				setLeftCardIndex(0); // In NextUp, the left card starts out displaying the first task...
				setRightCardIndex(formattedTasks.length - 1); // ...and the right card displays the last task.
				setLoadingTasks(false);
			})
			.catch(response => { console.warn(response) })
		;
	}, [tasks, leftCardIndex, rightCardIndex, loadingTasks]);
	useEffect(fetchTasks, []); // fetch tasks on mount
	
	const checkboxChange = useCallback((task, broadcast = true) => {
		if (tasks.length == 0) return; // Sometimes tasks is empty due to a stale closure.
		const taskIndex = taskIds.findIndex(item => item === Number(task.id));
		if (taskIndex !== -1) {
			const newTasks = [...tasks];
			newTasks[taskIndex].completed = task.completed;
			setTasks(newTasks);
			if (broadcast) taskUpdates.broadcast(task, "NextUp");
		}
	}, [tasks, taskIds]);
	
	useEffect(() => {
		taskUpdates.subscribe(event => {
			if (event.detail.from != "NextUp") { // Prevent us from broadcasting to ourselves
				// A task has been completed elsewhere. Update it in NextUp.
				const task = event.detail.task;
				checkboxChange(task, false);
			}
		});
		return () => {
			taskUpdates.unsubscribe();
		}
	}, [tasks, taskIds]);
	
	const [leftCardIndex, setLeftCardIndex] = useState(0);
	const [rightCardIndex, setRightCardIndex] = useState(0);

	const cycleBackIcon = <svg width="12" height="12" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path d="M2.11121 10.0146L1.10394 5.30332L3.77971 6.53828L6.18454 7.6482L2.11121 10.0146Z" fill="black"/>
		<path d="M12.521 14.9083C21.8338 5.30328 8.95493 -7.32752 2.11121 10.0146M2.11121 10.0146L1.10394 5.30332L6.18454 7.6482L2.11121 10.0146Z" stroke="black"/>
	</svg>
	
	// NextUpTasks is an array of tasks. Think of it as a pile of cards. We start out pulling one card from the top and one card from the bottom of the pile. When the user clicks "Not now" on one pile, we cycle to a different card in the pile and display that instead.
	function useCycleCardPile(pileName, cycleAmount) {
		if (pileName === "left") {
			setLeftCardIndex(leftCardIndex + cycleAmount);
		} else if (pileName === "right") {
			setRightCardIndex(rightCardIndex + cycleAmount);
		} else {
			throw new Error("Invalid pile name", pileName)
		}
	}
		
	if (tasks.length == 0 && loadingTasks == false) {
		return <div className="next-up">
			No tasks
		</div>
	}
	
	const skeletonTask = {
		name: "Loading...",
		ancestors: [],
		completed: false,
	}
	const leftCardTask = loadingTasks ? skeletonTask : tasks[leftCardIndex];
	const rightCardTask = loadingTasks ? skeletonTask : tasks[rightCardIndex];
	
	if (tasks.length == 1) {
		return <div className="next-up">
			<div className="next-up-cards">
				<div className="column">
					<div className="card-and-buttons">
						<NextUpCard task={leftCardTask} checkboxChange={checkboxChange} />
					</div>
				</div>
			</div>
		</div>
	}
	
	return <div className="next-up">
		<div className="next-up-cards">
			<div className="column">
				<div className="card-and-buttons">
					<NextUpCard task={leftCardTask} checkboxChange={checkboxChange} />
					<button className="reverse-cycle-card-stack-button" 
						onClick={() => { useCycleCardPile("left", -1) }}
						style={{ display: leftCardIndex == 0 ? "none" : "block" }}
					>{cycleBackIcon}</button>
					<button className="cycle-card-stack-button" 
						onClick={() => { useCycleCardPile("left", 1) }}
						disabled={leftCardIndex + 1 >= rightCardIndex}
					>Not now</button>
				</div>
			</div>
			<div className="or">or</div>
			<div className="column">
				<div className="card-and-buttons">
					<NextUpCard task={rightCardTask} checkboxChange={checkboxChange} />
					<button className="reverse-cycle-card-stack-button" 
						onClick={() => { useCycleCardPile("right", 1) }}
						style={{ display: rightCardIndex == tasks.length - 1 ? "none" : "block" }}
					>{cycleBackIcon}</button>
					<button className="cycle-card-stack-button" 
						onClick={() => { useCycleCardPile("right", -1) }}
						disabled={rightCardIndex - 1 <= leftCardIndex}
					>Not now</button>
				</div>
			</div>
		</div>
	</div>
}

NextUp.propTypes = {
	taskId: PropTypes.number
};
