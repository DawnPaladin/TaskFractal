import React, { useState, useEffect } from 'react';
import NextUpCard from './NextUpCard';
import PropTypes from 'prop-types';

export default function NextUp(props) {
	var tasks = props.tasks;
	
	const [leftCardIndex, setLeftCardIndex] = useState(0);
	const [rightCardIndex, setRightCardIndex] = useState(tasks.length - 1);

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

	if (tasks.length == 0) {
		return <div className="next-up">
			<div className="next-up-label">Next Up</div>
			No tasks
		</div>
	}
	
	return <div className="next-up">
		<div className="next-up-cards">
			<div className="column">
				<div className="card-and-buttons">
					<NextUpCard task={tasks[leftCardIndex]} checkboxChange={props.checkboxChange} />
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
					<NextUpCard task={tasks[rightCardIndex]} checkboxChange={props.checkboxChange} />
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
	tasks: PropTypes.array.isRequired,
	checkboxChange: PropTypes.func.isRequired,
}
