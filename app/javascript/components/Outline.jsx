// import PropTypes from 'prop-types';
import React from 'react';
import * as Icon from 'react-feather';
import Tree, { mutateTree, moveItemOnTree } from '@atlaskit/tree';
import update from 'immutability-helper';
import clone from 'lodash.clonedeep';

import NextUp from './NextUp';
import FrontSideTask from './FrontSideTask';
import network from './network'; // Performs network calls to the Rails backend
import send from './send'; // Sends task updates to the Rails backend
import sendTaskMovement from './sendTaskMovement'; // Tells the Rails backend that a task has a new parent and/or a new position in a list

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
			NextUpVisible: this.props.next_up_visible,
			NextUpTasks, // array of tasks to be displayed by NextUp
			NextUpTaskIds,
			leftCardIndex: 0, // In NextUp, the left card starts out displaying the first task...
			rightCardIndex: NextUpTasks.length - 1, // ...and the right card displays the last task.
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
		
	}
	
	// METHODS (alphabetical)
	
	addNewTask = event => {
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
		
		const newSubtaskName = itemData.newSubtaskName;
		const parentId = itemData.id;
		
		var task = {
			name: newSubtaskName,
			parent_id: parentId,
		};
		
		network.post("/tasks", task)
		.then(response => {
			this.updateAncestors(parentId, 'descendant_count', 1, 0);
			this.setState(state => {
				var newTask = response.data;
				var newState = {...state};
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
	
	checkboxChange = task => {
		// Update treeData
		const newState = update(this.state, {
			treeData: {items: {[task.id]: {data: {completed: {$set: task.completed}}}}},
		});
		this.setState(newState, () => {
			this.updateAncestors(this.getParentId(task.id), 'completed_descendant_count', task.completed ? 1 : -1, 750);
		});
		
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
	
	// NextUpTasks is an array of tasks. Think of it as a pile of cards. We start out pulling one card from the top and one card from the bottom of the pile. When the user clicks "Not now" on one pile, we cycle to a different card in the pile and display that instead.
	cycleCardPile = (pileName, cycleAmount) => {
		if (!(pileName == "left" || pileName == "right")) throw new Error("Invalid pile name", pileName);
		var key = pileName + "CardIndex";
		var currentValue = this.state[key];
		this.setState({ [key]: currentValue + cycleAmount });
	}
	
	getIcon = (item, onExpand, onCollapse) => { // Returns a disclosure triangle if a list item has children
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
	
	getParentId = taskId => {
		const parentId = Object.keys(this.state.treeData.items).find(id => {
			return (this.state.treeData.items[id].children.includes(Number(taskId)) || this.state.treeData.items[id].children.includes(String(taskId)));
		});
		if (parentId === undefined || parentId === 'root') {
			return null;
		} else {
			return Number(parentId); // IDs are stored as strings sometimes, which is undesirable but changing it breaks @atlaskit/tree
		}
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
	
	onDragStart = itemId => {
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
	onDragEnd = (source, destination) => {
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
	
	showAddSubtask = (item, event) => {
		const newState = update(this.state, {
			treeData: {items: {[item.id]: {data: {addSubtaskHere: {$set: !item.data.addSubtaskHere}}}}},
		});
		this.setState(newState);
		
		// Focus the Add Subtask field after showing it
		event.persist();
		window.setTimeout(function() {
			event.target.closest('.tree-node').querySelector('.add-subtask').focus();
		}, 15)
	}
	
	toggleNextUpVisibility = () => {
		const newState = !this.state.NextUpVisible;
		network.patch('/change_next_up_visible.json', { next_up_visible: newState });
		this.setState({ NextUpVisible : newState });
	}
	
	updateAncestors = (parentId, property, change, delay) => {
		var that = this;
		window.setTimeout(function() {
			const newState = update(that.state, {
				treeData: {items: {[parentId]: {data: {[property]: {$apply: value => value + change}}}}}
			})
			that.setState(newState);
			
			const grandparentId = that.getParentId(parentId);
			if (grandparentId) that.updateAncestors(grandparentId, property, change, delay);
		}, delay)
	}
	
	// EVENTS
	
	componentDidMount() {
		const outline = document.getElementsByClassName('outline')[0];
		const tree = outline.firstChild;
		this.treeElement = tree;
		
		this.setHiddenOnTasks();
		document.addEventListener('toggleShowCompleted', this.handleToggleShowCompleted);
	}
	
	// RENDERING
	
	renderTreeItem = ({item, provided, snapshot, onExpand, onCollapse}) => {
		const icon = this.getIcon(item, onExpand, onCollapse);
		const addSubtaskIsHere = item.data.addSubtaskHere;
		const addSubtaskField = <form className="subtask-adder" onSubmit={() => {this.addSubtask(event, item.data)}}>
			<input type="text" className="add-subtask" placeholder="Add subtask" value={item.data.newSubtaskName} onChange={(event) => { this.handleNewSubtaskEdit(event, item) }} />
			<button>Add</button>
		</form>
		
		if (item.hidden === true) return <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} data-item-number={item.id}></div>;
		return <div className="tree-node" ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} data-item-number={item.id}>
			{icon}
			<FrontSideTask task={item.data} disableDescendantCount={true} checkboxChange={this.checkboxChange} />
			<button title="Add subtask" className="add-subtask-button" onClick={event => {this.showAddSubtask(item, event)}}><Icon.Plus size="16"/></button>
			{ addSubtaskIsHere ? addSubtaskField : null}
		</div>
	}
	
	render() {
		return <div className={this.state.NextUpVisible ? "next-up-visible" : "next-up-hidden"}>
			<NextUp tasks={this.state.NextUpTasks} leftCardIndex={this.state.leftCardIndex} rightCardIndex={this.state.rightCardIndex} cycleCardPile={this.cycleCardPile} checkboxChange={this.checkboxChange} />
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
