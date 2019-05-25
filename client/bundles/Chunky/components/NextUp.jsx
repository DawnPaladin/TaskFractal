import React from 'react';
import NextUpCard from './NextUpCard';
import PropTypes from 'prop-types';

export default class NextUp extends React.Component {
	static propTypes = {
		tasks: PropTypes.array.isRequired,
	}
	constructor(props) {
		super(props);
		var tasks = props.tasks.map(taggedTask => {
			var task = taggedTask.task;
			task.score = taggedTask.score;
			task.reasons = taggedTask.reasons;
			return task;
		})
		this.state = {
			tasks,
			leftCardIndex: 0,
			rightCardIndex: tasks.length - 1,
		};
	}
	cycleCardPile = (pileName, cycleAmount) => {
		if (!(pileName == "left" || pileName == "right")) throw new Error("Invalid pile name", pileName);
		var key = pileName + "CardIndex";
		var currentValue = this.state[key];
		this.setState({ [key]: currentValue + cycleAmount });
	}
	
	render() {
		var tasks = this.state.tasks;
		var leftCardIndex = this.state.leftCardIndex;
		var rightCardIndex = this.state.rightCardIndex;

		const cycleBackIcon = <svg width="12" height="12" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path d="M2.11121 10.0146L1.10394 5.30332L3.77971 6.53828L6.18454 7.6482L2.11121 10.0146Z" fill="black"/>
			<path d="M12.521 14.9083C21.8338 5.30328 8.95493 -7.32752 2.11121 10.0146M2.11121 10.0146L1.10394 5.30332L6.18454 7.6482L2.11121 10.0146Z" stroke="black"/>
		</svg>

		return <div className="next-up">
			<div className="next-up-label">Next Up</div>
			<div className="next-up-cards">
				<div className="column">
					<div className="column-label">High Impact</div>
					<div className="card-and-buttons">
						<NextUpCard task={tasks[leftCardIndex]} />
						<button className="reverse-cycle-card-stack-button" 
							onClick={() => { this.cycleCardPile("left", -1) }}
							style={{ display: leftCardIndex == 0 ? "none" : "block" }}
						>{cycleBackIcon}</button>
						<button className="cycle-card-stack-button" 
							onClick={() => { this.cycleCardPile("left", 1) }}
							disabled={leftCardIndex + 1 >= rightCardIndex}
						>Not now</button>
					</div>
				</div>
				<div className="or">or</div>
				<div className="column">
					<div className="column-label">Easy Win</div>
					<div className="card-and-buttons">
						<NextUpCard task={tasks[rightCardIndex]} />
						<button className="reverse-cycle-card-stack-button" 
							onClick={() => { this.cycleCardPile("right", 1) }}
							style={{ display: rightCardIndex == tasks.length - 1 ? "none" : "block" }}
						>{cycleBackIcon}</button>
						<button className="cycle-card-stack-button" 
							onClick={() => { this.cycleCardPile("right", -1) }}
							disabled={rightCardIndex - 1 <= leftCardIndex}
						>Not now</button>
					</div>
				</div>
			</div>
		</div>
	}
}
