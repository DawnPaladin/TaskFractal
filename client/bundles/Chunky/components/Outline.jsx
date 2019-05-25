import PropTypes from 'prop-types';
import React from 'react';
import ReactOnRails from 'react-on-rails';
import * as Icon from 'react-feather';
import Tree, { mutateTree, moveItemOnTree } from '@atlaskit/tree';

import NextUp from './NextUp';
import FrontSideTask from './FrontSideTask';
import sendTaskMovement from './sendTaskMovement';

export default class Outline extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			tasks: this.props.tasks,
			new_task_name: '',
			NextUpVisible: true,
			treeData: this.props.tasks,
		}
		this.addNewTask = this.addNewTask.bind(this);
		this.getIcon = this.getIcon.bind(this);
		this.renderItem = this.renderItem.bind(this);
		this.onDragStart = this.onDragStart.bind(this);
		this.onDragEnd = this.onDragEnd.bind(this);
		this.onExpand = this.onExpand.bind(this);
		this.onCollapse = this.onCollapse.bind(this);
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
				var newState = {...state}
				var newId = json.id;
				json.id = json.id.toString();
				var newTask = {
					id: json.id,
					children: [],
					isExpanded: true,
					data: json,
				}
				newState.tasks.items[newId] = newTask;
				newState.treeData.items[newId] = newTask;
				newState.treeData.items.root.children.push(json.id);
				return newState;
			})
		}).catch(error => {
			toastr.error(error.message);
		});
		
		this.setState({ new_task_name: '' });
	}
	componentDidMount() {
		const outline = document.getElementsByClassName('outline')[0];
		const tree = outline.firstChild;
		this.treeElement = tree;
	}
	handleAddNewTaskEdit(event) {
		this.setState({ new_task_name: event.target.value });
	}
	getIcon(item, onExpand, onCollapse) {
		if (item.children && item.children.length > 0) {
			if (item.isExpanded) {
				return <button className="tree-node-icon" onClick={() => onCollapse(item.id)}>▾</button>
			} else {
				return <button className="tree-node-icon" onClick={() => onExpand(item.id)}>▸</button>
			}
		} else {
			return <span className="tree-node-icon"></span>;
		}
	}
	
	onDragStart(itemId) {
		// work around bug where New Task field at the bottom pops up and covers last list item
		var treeHeight = this.treeElement.clientHeight; // offsetHeight or clientHeight
		var itemElement = document.querySelectorAll(`[data-item-number='${itemId}']`)[0];
		var itemHeight = itemElement.clientHeight;
		treeHeight = treeHeight + itemHeight;
		this.treeElement.style.height = `${treeHeight}px`;

		// collapse items before dragging them
		const item = this.state.treeData.items[itemId];
		if (item.children && item.children.length > 0) {
			if (item.isExpanded) {
				this.onCollapse(itemId);
			}
		}
	}
	
	onDragEnd(source, destination) {
		this.treeElement.style.height = "";
		const tree = this.state.treeData;
		if (!destination) return;
		
		const taskId = tree.items[source.parentId].children[source.index];
		
		const newTree = moveItemOnTree(tree, source, destination);
		this.setState({ treeData: newTree });
		
		sendTaskMovement(taskId, destination.index, destination.parentId);
	}
	
	onExpand = (itemId) => {
		const treeData = this.state.treeData;
		this.setState({
			treeData: mutateTree(treeData, itemId, { isExpanded: true }),
		});
	}
	
	onCollapse = (itemId) => {
		const treeData = this.state.treeData;
		this.setState({
			treeData: mutateTree(treeData, itemId, { isExpanded: false }),
		});
	}
	
	renderItem = ({item, provided, snapshot, onExpand, onCollapse}) => {
		var icon = this.getIcon(item, onExpand, onCollapse);
		return <div className="tree-node" ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} data-item-number={item.id}>
			{icon}
			<FrontSideTask task={item.data} disableDescendantCount={true} />
		</div>
	}
	
	toggleNextUpVisibility = () => {
		this.setState({ NextUpVisible : !this.state.NextUpVisible });
	}

	render() {
		return <div>
			<div className={this.state.NextUpVisible ? "" : "hidden"}>
				<NextUp tasks={this.props.next_up} />
			</div>
			<div className="button-wrapper">
				<button className="next-up-toggle" onClick={this.toggleNextUpVisibility} 
					style={{ top: this.state.NextUpVisible ? "-2em" : "0"}}
				>
					{this.state.NextUpVisible ? "Hide" : "Next Up"}
				</button>
			</div>
			<div className="outline">
				<Tree
					tree={this.state.treeData}
					renderItem={this.renderItem}
					offsetPerLevel={23}
					onDragStart={this.onDragStart}
					onDragEnd={this.onDragEnd}
					onExpand={this.onExpand}
					onCollapse={this.onCollapse}
					isDragEnabled
					isNestingEnabled
				/>
				<form className="task-adder" onSubmit={this.addNewTask} >
					<input type="text" placeholder="New task" value={this.state.new_task_name} onChange={this.handleAddNewTaskEdit} />
					<button>Add</button>
				</form>
			</div>
		</div>
	}
}
