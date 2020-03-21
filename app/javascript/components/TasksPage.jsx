// import PropTypes from 'prop-types';
import React from 'react';

import NextUp from './NextUp';
import Outline from './Outline';
import network from './network'; // Performs network calls to the Rails backend

export default class TasksPage extends React.Component {
	constructor(props) {
		super(props);
		var NextUpTaskIds = []; // make it easy to look up tasks in NextUpTasks by their id
		var NextUpTasks = props.next_up_tasks.map(taggedTask => {
			var task = taggedTask.task;
			task.score = taggedTask.score;
			task.reasons = taggedTask.reasons;
			task.ancestors = taggedTask.ancestors;
			NextUpTaskIds.push(task.id);
			return task;
		})
		this.state = {
			new_task_name: '',
			
			NextUpVisible: this.props.next_up_visible,
			NextUpTasks, // array of tasks to be displayed by NextUp
			NextUpTaskIds,
			leftCardIndex: 0, // In NextUp, the left card starts out displaying the first task...
			rightCardIndex: NextUpTasks.length - 1, // ...and the right card displays the last task.
			
			completedTasksVisible: this.props.completed_tasks_visible,
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
	
	toggleNextUpVisibility = () => {
		const newState = !this.state.NextUpVisible;
		network.patch('/change_next_up_visible.json', { next_up_visible: newState });
		this.setState({ NextUpVisible : newState });
	}
	toggleCompletedTasksVisibility = () => {
		const newState = !this.state.completedTasksVisible;
		network.patch('/change_completed_tasks_visible.json', { completed_tasks_visible: newState });
		this.setState({ completedTasksVisible : newState });
	}
	
	// EVENTS
	
	componentDidMount() {
		document.addEventListener('toggleNextUpVisible', this.toggleNextUpVisibility);
		document.addEventListener('toggleCompletedTasksVisible', this.toggleCompletedTasksVisibility);
	}
	
	// RENDERING
	
	render() {
		return <div className={this.state.NextUpVisible ? "next-up-visible" : "next-up-hidden"}>
			<NextUp tasks={this.state.NextUpTasks} leftCardIndex={this.state.leftCardIndex} rightCardIndex={this.state.rightCardIndex} checkboxChange={this.checkboxChange} />
			<Outline tasks={this.props.tasks} completedTasksVisible={this.state.completedTasksVisible} checkboxChange={this.checkboxChange} />
		</div>
	}
}
