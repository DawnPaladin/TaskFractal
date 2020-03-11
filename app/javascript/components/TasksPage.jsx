// import PropTypes from 'prop-types';
import React from 'react';
import update from 'immutability-helper';

import NextUp from './NextUp';
import Outline from './Outline';
import network from './network'; // Performs network calls to the Rails backend
import send from './send'; // Sends task updates to the Rails backend

export default class TasksPage extends React.Component {
	constructor(props) {
		super(props);
		var NextUpTaskIds = []; // make it easy to look up tasks in NextUpTasks by their id
		var NextUpTasks = props.next_tasks.map(taggedTask => {
			var task = taggedTask.task;
			task.score = taggedTask.score;
			task.reasons = taggedTask.reasons;
			task.ancestors = taggedTask.ancestors;
			NextUpTaskIds.push(task.id);
			return task;
		})
		this.state = {
			new_task_name: '',
			NextUpVisible: this.props.show_next_tasks,
			NextUpTasks, // array of tasks to be displayed by NextUp
			NextUpTaskIds,
			leftCardIndex: 0, // In NextUp, the left card starts out displaying the first task...
			rightCardIndex: NextUpTasks.length - 1, // ...and the right card displays the last task.
		}
		
	}
	
	// METHODS (alphabetical)
	
	checkboxChange = task => {
		// Update NextUp
		const taskIndex = this.state.NextUpTaskIds.findIndex(item => item === Number(task.id));
		if (taskIndex !== -1) {
			const newNextUpTasks = [...this.state.NextUpTasks];
			newNextUpTasks[taskIndex].completed = task.completed;
			this.setState({
				NextUpTasks: newNextUpTasks,
			});
		}
	}
	
	// NextUpTasks is an array of tasks. Think of it as a pile of cards. We start out pulling one card from the top and one card from the bottom of the pile. When the user clicks "Not now" on one pile, we cycle to a different card in the pile and display that instead.
	cycleCardPile = (pileName, cycleAmount) => {
		if (!(pileName == "left" || pileName == "right")) throw new Error("Invalid pile name", pileName);
		var key = pileName + "CardIndex";
		var currentValue = this.state[key];
		this.setState({ [key]: currentValue + cycleAmount });
	}
	
	toggleNextUpVisibility = () => {
		const newState = !this.state.NextUpVisible;
		network.patch('/change_next_up_visible.json', { next_up_visible: newState });
		this.setState({ NextUpVisible : newState });
	}
		
	// RENDERING
		
	render() {
		return <div className={this.state.NextUpVisible ? "next-up-visible" : "next-up-hidden"}>
			<NextUp tasks={this.state.NextUpTasks} leftCardIndex={this.state.leftCardIndex} rightCardIndex={this.state.rightCardIndex} cycleCardPile={this.cycleCardPile} checkboxChange={this.checkboxChange} />
			<Outline tasks={this.props.tasks} showCompletedTasks={this.props.show_completed_tasks} checkboxChange={this.checkboxChange} />
		</div>
	}
}
