import PropTypes from 'prop-types';
import React from 'react';
import ReactOnRails from 'react-on-rails';
import * as Icon from 'react-feather';
import Tree, { mutateTree, moveItemOnTree } from '@atlaskit/tree';

import FrontSideTask from './FrontSideTask';
import sendTaskMovement from './sendTaskMovement';

export default class Outline extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			tasks: this.props.tasks,
			new_task_name: '',
			treeData: this.props.tasks,
		}
		this.addNewTask = this.addNewTask.bind(this);
		this.renderItem = this.renderItem.bind(this);
		this.onDragEnd = this.onDragEnd.bind(this);
		this.handleAddNewTaskEdit = this.handleAddNewTaskEdit.bind(this);
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
	getIcon(item, onExpand, onCollapse) {
		if (item.children && item.children.length > 0) {
			return item.isExpanded ? <span className="tree-node-icon">▾</span> : <span className="tree-node-icon">▸</span>;
		} else {
			return <span className="tree-node-icon"></span>;
		}
	}
	
	onDragEnd(source, destination) {
		const tree = this.state.treeData;
		if (!destination) return;
		
		const taskId = tree.items[source.parentId].children[source.index];
		
		const newTree = moveItemOnTree(tree, source, destination);
		this.setState({ treeData: newTree });
		
		sendTaskMovement(taskId, destination.index, destination.parentId);
	}
	
	renderItem = ({item, provided, snapshot, onExpand, onCollapse}) => {
		var icon = this.getIcon(item);
		return <div className="tree-node" ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
			{icon}
			<FrontSideTask task={item.data} disableDescendantCount={true} />
			{ provided.placeholder }
		</div>
	}

	render() {
		return <div className="outline">
			<Tree
				tree={this.state.treeData}
				renderItem={this.renderItem}
				offsetPerLevel={23}
				onDragEnd={this.onDragEnd}
				isDragEnabled
			/>
			<form className="task-adder" onSubmit={this.addNewTask} >
				<input type="text" placeholder="New task" value={this.state.new_task_name} onChange={this.handleAddNewTaskEdit} />
				<button>Add</button>
			</form>
		</div>
	}
}
