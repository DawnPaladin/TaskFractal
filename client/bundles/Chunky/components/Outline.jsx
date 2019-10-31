// import PropTypes from 'prop-types';
import React from 'react';
import * as Icon from 'react-feather';
import Tree, { mutateTree, moveItemOnTree } from '@atlaskit/tree';
import update from 'immutability-helper';
import clone from 'lodash.clonedeep';

import NextUp from './NextUp';
import FrontSideTask from './FrontSideTask';
import sendTaskMovement from './sendTaskMovement';
import network from './network';
import send from './send';

export default class Outline extends React.Component {
	constructor(props) {
		super(props);
		var NextUpTaskIds = []; // make it easy to look up tasks in NextUpTasks by their id
		var NextUpTasks = props.next_up.map(taggedTask => {
			var task = taggedTask.task;
			task.score = taggedTask.score;
			task.reasons = taggedTask.reasons;
			task.ancestors = taggedTask.ancestors;
			NextUpTaskIds.push(task.id);
			return task;
		})
		this.state = {
			new_task_name: '',
			treeData: this.props.tasks,
			NextUpVisible: true,
			NextUpTasks,
			NextUpTaskIds,
			leftCardIndex: 0,
			rightCardIndex: NextUpTasks.length - 1,
			showCompletedTasks: this.props.show_completed_tasks,
		}
		// data structure for adding new subtasks to tree items
		Object.entries(this.state.treeData.items).forEach(([key, item]) => {
			if (item.data) {
				item.data.newSubtaskName = "";
				item.data.addSubtaskId = null;
				item.hidden = false;
			}
		});
		
		this.addNewTask = this.addNewTask.bind(this);
		this.getIcon = this.getIcon.bind(this);
		this.renderTreeItem = this.renderTreeItem.bind(this);
		this.onDragStart = this.onDragStart.bind(this);
		this.onDragEnd = this.onDragEnd.bind(this);
		this.onExpand = this.onExpand.bind(this);
		this.onCollapse = this.onCollapse.bind(this);
	}
	addNewTask(event) {
		event.preventDefault();
		
		var task = {
			name: this.state.new_task_name
		};
		
		network.post("/tasks", task)
		.then(response => {
			this.setState(state => {
				var newTask = response.data;
				var newState = {...state}
				var newId = newTask.id;
				newTask.id = newTask.id.toString();
				var newTask = {
					id: newTask.id,
					children: [],
					isExpanded: true,
					data: newTask,
				}
				newState.treeData.items[newId] = newTask;
				newState.treeData.items.root.children.push(newTask.id);
				return newState;
			})
		});
		
		this.setState({ new_task_name: '' });
	}
	addSubtask = (event, itemData) => {
		event.preventDefault();
		
		console.log(event, itemData);
		const newSubtaskName = itemData.newSubtaskName;
		const parentId = itemData.id;
		
		var task = {
			name: newSubtaskName,
			parent_id: parentId,
		};
		
		network.post("/tasks", task)
		.then(response => {
			this.setState(state => {
				var newTask = response.data;
				var newState = {...state}
				var newId = newTask.id;
				newTask.id = newTask.id.toString();
				var newTask = {
					id: newTask.id,
					children: [],
					isExpanded: true,
					data: newTask,
				}
				newState.treeData.items[newId] = newTask;
				newState.treeData.items[parentId].children.push(newTask.id);
				return newState;
			})
		}).catch(error => {
			toastr.error(error.message);
		});
		
		const newState = update(this.state, {
			treeData: {items: {[parentId]: {data: {newSubtaskName: {$set: ''}}}}},
		});
		this.setState(newState);
	}
	cycleCardPile = (pileName, cycleAmount) => {
		if (!(pileName == "left" || pileName == "right")) throw new Error("Invalid pile name", pileName);
		var key = pileName + "CardIndex";
		var currentValue = this.state[key];
		this.setState({ [key]: currentValue + cycleAmount });
	}
	componentDidMount() {
		const outline = document.getElementsByClassName('outline')[0];
		const tree = outline.firstChild;
		this.treeElement = tree;
	}
	handleAddNewTaskEdit = event => {
		this.setState({ new_task_name: event.target.value });
	}
	handleNewSubtaskEdit = (event, item) => {
		const newState = update(this.state, {
			treeData: {items: {[item.id]: {data: {newSubtaskName: {$set: event.target.value}}}}},
		});
		this.setState(newState);
	}
	handleToggleShowCompleted = event => {
		this.setState({ showCompletedTasks: event.detail.showCompletedTasks },
			() => { this.setHiddenOnTasks(); }
		);
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
		network.patch(`/tasks/${itemId}.json`, {id: itemId, is_expanded: true});
		this.setState({
			treeData: mutateTree(treeData, itemId, { isExpanded: true }),
		});
	}
	
	onCollapse = (itemId) => {
		const treeData = this.state.treeData;
		network.patch(`/tasks/${itemId}.json`, {id: itemId, is_expanded: false});
		this.setState({
			treeData: mutateTree(treeData, itemId, { isExpanded: false }),
		});
	}
	
	checkboxChange = task => {
		// Update treeData
		const newState = update(this.state, {
			treeData: {items: {[task.id]: {data: {completed: {$set: task.completed}}}}},
		});
		this.setState(newState);
		
		// Update NextUp
		const taskIndex = this.state.NextUpTaskIds.findIndex(item => item === Number(task.id));
		if (taskIndex !== -1) {
			const newNextUpTasks = [...this.state.NextUpTasks];
			newNextUpTasks[taskIndex].completed = task.completed;
			this.setState({
				NextUpTasks: newNextUpTasks,
			});
		}
		
		// Update server
		send(task);
	}
	
	setHiddenOnTasks = () => { // Go through all tasks and mark the appropriate ones (and their children) as hidden
		const treeData = clone(this.state.treeData);
		
		// first go through and unhide everything
		Object.entries(treeData.items).forEach(([key, item]) => {
			if (key === "root") return;
			treeData.items[key].hidden = false;
		});
		
		if (this.state.showCompletedTasks === false) {
			Object.entries(treeData.items).forEach(([key, item]) => {
				if (key === "root") return;
				if (item.data && item.data.completed === true) {
					treeData.items[key].hidden = true;
					this.hideSubtasks(treeData, item);
				}
			});
		}
		
		this.setState({treeData});
	}
	hideSubtasks = (treeData, parent) => { // Recursively hide all the children of a parent task
		const childIds = parent.children;
		Object.entries(treeData.items).forEach(([key, item]) => {
			if (childIds.includes(Number(item.id))) { // item is a child of the parent
				item.hidden = true;
				this.hideSubtasks(treeData, item);
			}
		})
	}
	
	renderTreeItem = ({item, provided, snapshot, onExpand, onCollapse}) => {
		var icon = this.getIcon(item, onExpand, onCollapse);
		var addSubtaskIsHere = item.data.addSubtaskHere;
		var addSubtaskField = <form className="subtask-adder" onSubmit={() => {this.addSubtask(event, item.data)}}>
			<input type="text" className="add-subtask" placeholder="Add subtask" value={item.data.newSubtaskName} onChange={(event) => { this.handleNewSubtaskEdit(event, item) }} />
			<button>Add</button>
		</form>
		if (item.hidden === true) return <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} data-item-number={item.id}></div>;
		return <div className="tree-node" ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} data-item-number={item.id}>
			{icon}
			<FrontSideTask task={item.data} disableDescendantCount={true} checkboxChange={this.checkboxChange} />
			<button title="Add subtask" className="add-subtask-button" onClick={() => {this.showAddSubtask(item)}}><Icon.Plus size="16"/></button>
			{ addSubtaskIsHere ? addSubtaskField : null}
		</div>
	}
	
	showAddSubtask = item => {
		const newState = update(this.state, {
			treeData: {items: {[item.id]: {data: {addSubtaskHere: {$set: !item.data.addSubtaskHere}}}}},
		});
		this.setState(newState);
	}
	
	toggleNextUpVisibility = () => {
		this.setState({ NextUpVisible : !this.state.NextUpVisible });
	}
	
	componentDidMount() {
		this.setHiddenOnTasks();
		document.addEventListener('toggleShowCompleted', this.handleToggleShowCompleted);
	}
	
	render() {
		return <div className={this.state.NextUpVisible ? "next-up-visible" : "next-up-hidden"}>
			<NextUp tasks={this.state.NextUpTasks} leftCardIndex={this.state.leftCardIndex} rightCardIndex={this.state.rightCardIndex} cycleCardPile={this.cycleCardPile} checkboxChange={this.checkboxChange} />
			<div className="button-wrapper">
				<button className="next-up-toggle" onClick={this.toggleNextUpVisibility}>
					{this.state.NextUpVisible ? "Hide" : "Next Up"}
				</button>
			</div>
			<div className="outline">
				<Tree
					tree={this.state.treeData}
					renderItem={this.renderTreeItem}
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
