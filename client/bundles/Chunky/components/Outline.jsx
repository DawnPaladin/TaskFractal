import PropTypes from 'prop-types';
import React from 'react';
import ReactOnRails from 'react-on-rails';
import * as Icon from 'react-feather';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

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
	onDragEnd = result => {
		
	}
	taskTree(task, index) {
		var children = task.descendants ? task.descendants.map((child, index) => this.taskTree(child, index)) : <div></div>;
		return (
			<Draggable draggableId={task.id} key={task.id} index={index}>
				{(provided) => (
					<div {...provided.draggableProps} {...provided.dragHandleProps} ref={provided.innerRef}>
						<FrontSideTask task={task} key={task.id} disableDescendantCount={true} />
						<div className="indent">{ children }</div>
					</div>
				)}
			</Draggable>
		)
	}
	render() {
		return <div className="outline">
			<DragDropContext onDragEnd={this.onDragEnd}>
				<Droppable droppableId="1">
					{(provided) => (
						<div ref={provided.innerRef} {...provided.droppableProps}>
							{ this.state.tasks.map((task, index) => this.taskTree(task, index)) }
							{ provided.placeholder }
						</div>
					)}
				</Droppable>
				<form className="task-adder" onSubmit={this.addNewTask} >
					<input type="text" placeholder="New task" value={this.state.new_task_name} onChange={this.handleAddNewTaskEdit} />
					<button>Add</button>
				</form>
			</DragDropContext>
		</div>
	}
}
