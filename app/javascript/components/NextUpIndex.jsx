import React from 'react';
import NextUpCard from './NextUpCard';
import PropTypes from 'prop-types';
import send from './send'; // Sends task updates to the Rails backend

export default class NextUpIndex extends React.Component {
	static propTypes = {
		tasks: PropTypes.array.isRequired,
	}
	
	constructor(props) {
		super(props);
		var NextUpTaskIds = []; // make it easy to look up tasks in NextUpTasks by their id
		var NextUpTasks = props.tasks.map(taggedTask => {
			var task = taggedTask.task;
			task.score = taggedTask.score;
			task.reasons = taggedTask.reasons;
			task.ancestors = taggedTask.ancestors;
			NextUpTaskIds.push(task.id);
			return task;
		})
		this.state = {
			tasks: NextUpTasks
		}
	}
	
	checkboxChange = task => {
		// Update NextUp
		const taskIndex = Number(task.id);
		const newTasks = [...this.state.tasks];
		newTasks[taskIndex].completed = task.completed;
		this.setState({
			tasks: newTasks,
		});
		
		// Update server
		send(task);
	}
	
	render() {
		var tasks = this.state.tasks;
		console.log(tasks);
		
		if (tasks.length == 0) {
			return <div className="next-up-all">
				<h1>NextUp</h1>
				<p>No tasks</p>
			</div>
		}
		
		const cards = tasks.map(task => {
			console.log(task);
			return <NextUpCard task={task} checkboxChange={this.checkboxChange} key={task.id} />
		})

		return <div className="next-up-all">
			<h1>NextUp</h1>
			{cards}
		</div>
	}
}
