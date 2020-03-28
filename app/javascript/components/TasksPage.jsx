// import PropTypes from 'prop-types';
import React from 'react';

import NextUp from './NextUp';
import Outline from './Outline';

import network from './network'; // Performs network calls to the Rails backend

export default class TasksPage extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			new_task_name: '',
			NextUpVisible: this.props.next_up_visible,
			completedTasksVisible: this.props.completed_tasks_visible,
		}
		
	}
	
	// METHODS (alphabetical)
	
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
			<NextUp />
			<Outline tasks={this.props.tasks} completedTasksVisible={this.state.completedTasksVisible} />
		</div>
	}
}
