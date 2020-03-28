import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import NextUpCard from './NextUpCard';

import network from './network';

export default function NextUp(props) {
	const [tasks, setTasks] = useState([]);
	const [taskIds, setTaskIds] = useState([]); // make it easy to look up tasks in NextUpTasks by their id
	const [loadingTasks, setLoadingTasks] = useState(true);
	
	// Format task data for use with NextUpCards
	const formatTasks = tasks => {
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
	}
	
	const fetchTasks = () => {
		setLoadingTasks(true);
		network.get('/next_up.json')
			.then(response => {
				const formattedTasks = formatTasks(response.data);
				setTasks(formattedTasks);
				setLeftCardIndex(0);
				setRightCardIndex(formattedTasks.length - 1);
				setLoadingTasks(false);
			})
			.catch(response => { console.warn(response) })
		;
	}
	useEffect(fetchTasks, []); // fetch tasks on mount
	
	const checkboxChange = task => {
		const taskIndex = taskIds.findIndex(item => item === Number(task.id));
		if (taskIndex !== -1) {
			const newTasks = [...tasks];
			newTasks[taskIndex].completed = task.completed;
			setTasks(newTasks);
		}
	}
	
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
	
	if (loadingTasks == true) {
		return <div className="next-up">
			Loading...
		</div>
	}
	
	if (tasks.length == 0) {
		return <div className="next-up">
			No tasks
		</div>
	}
	
	return <div className="next-up">
		<div className="next-up-cards">
			<div className="column">
				<div className="card-and-buttons">
					<NextUpCard task={tasks[leftCardIndex]} checkboxChange={checkboxChange} />
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
					<NextUpCard task={tasks[rightCardIndex]} checkboxChange={checkboxChange} />
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

NextUp.propTypes = {};
