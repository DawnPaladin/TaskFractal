import PropTypes from 'prop-types';
import React from 'react';
import ReactOnRails from 'react-on-rails';
import * as Icon from 'react-feather';

import FrontSideTask from './FrontSideTask';

export default class Outline extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			tasks: this.props.tasks,
			new_task_name: '',
		}
		this.addNewTask = this.addNewTask.bind(this);
		this.taskTree = this.taskTree.bind(this);
		this.handleAddNewTaskEdit = this.handleAddNewTaskEdit.bind(this);
		// console.log(this.props.tasks);
	}
	addNewTask(event) {
		event.preventDefault();
		
		var task = {
			name: this.state.new_task_name
		};
		
		let body = JSON.stringify({task});
		let headers = ReactOnRails.authenticityHeaders();
		headers["Content-Type"] = "application/json";
		
		fetch("/tasks", {
			method: "POST",
			body: body,
			headers: headers,
		}).then(response => {
			if (response.ok) {
				return response.json();
			} else {
				throw new Error("Couldn't create new task.");
			}
		}).then(json => {
			this.setState(state => {
				state.tasks.push(json);
				return state;
			})
		}).catch(error => {
			toastr.error(error.message);
		});
		
		this.setState({ new_task_name: '' });
	}
	handleAddNewTaskEdit(event) {
		this.setState({ new_task_name: event.target.value });
	}
	taskTree(task) {
		var children = task.descendants ? task.descendants.map(child => this.taskTree(child)) : <div></div>;
		return (<div key={task.id}>
			<FrontSideTask task={task} key={task.id} disableDescendantCount={true} />
			<div className="indent">{ children }</div>
		</div>)
	}
	render() {
		return <div className="outline">
			{ this.state.tasks.map(task => this.taskTree(task)) }
			<form className="add-new-task" onSubmit={this.addNewTask} >
				<input type="text" placeholder="New task" value={this.state.new_task_name} onChange={this.handleAddNewTaskEdit} />
			</form>
		</div>
	}
}
