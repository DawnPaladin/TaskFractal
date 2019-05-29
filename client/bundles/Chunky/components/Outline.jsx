import PropTypes from 'prop-types';
import React from 'react';
import * as Icon from 'react-feather';
import Tree, { mutateTree, moveItemOnTree } from '@atlaskit/tree';
import update from 'immutability-helper';

import NextUp from './NextUp';
import FrontSideTask from './FrontSideTask';
import sendTaskMovement from './sendTaskMovement';
import network from './network';

export default class Outline extends React.Component {
	constructor(props) {
		super(props);
		var NextUpTaskIds = []; // make it easy to look up tasks in NextUpTasks by their id
		var NextUpTasks = props.next_up.map(taggedTask => {
			var task = taggedTask.task;
			task.score = taggedTask.score;
			task.reasons = taggedTask.reasons;
			NextUpTaskIds.push(task.id);
			return task;
		})
		this.state = {
			new_task_name: '',
			treeData: this.props.tasks,
			treeChangeNumber: 0, // Tree doesn't correctly rerender itself. Incrementing this changes the tree's key, forcing a rerender.
			NextUpChangeNumber: 0,
			NextUpVisible: true,
			NextUpTasks,
			NextUpTaskIds,
			leftCardIndex: 0,
			rightCardIndex: NextUpTasks.length - 1,
		}
		this.addNewTask = this.addNewTask.bind(this);
		this.getIcon = this.getIcon.bind(this);
		this.renderTreeItem = this.renderTreeItem.bind(this);
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
				newState.tasks.items[newId] = newTask;
				newState.treeData.items[newId] = newTask;
				newState.treeData.items.root.children.push(newTask.id);
				return newState;
			})
		}).catch(error => {
			toastr.error(error.message);
		});
		
		this.setState({ new_task_name: '' });
	}
	cycleCardPile = (pileName, cycleAmount) => {
		if (!(pileName == "left" || pileName == "right")) throw new Error("Invalid pile name", pileName);
		var key = pileName + "CardIndex";
		var currentValue = this.state[key];
		this.setState({ [key]: currentValue + cycleAmount });
	}
	NextUpCheckboxCallback = task => { // When a task is checked off in NextUp, check it off in the outline.
		this.setState(oldState => {
			// state.treeData.items[task.id].data.completed = task.completed;
			// state.tasks.items[task.id].data.completed = task.completed;
			const newState = update(oldState, {
				treeData: {items: {[task.id]: {data: {completed: {$set: task.completed}}}}},
			});
			newState.treeChangeNumber = oldState.treeChangeNumber + 1; // force tree to update
			return newState;
		});
	}
	outlineCheckboxCallback = task => { // When a task is checked off in the outline, check it off in NextUp.
		var taskIndex = this.state.NextUpTaskIds.findIndex(item => item === Number(task.id));
		if (taskIndex === -1) return false;
		const newNextUpTasks = update(this.state.NextUpTasks, {
			[taskIndex]: {completed: {$set: task.completed}}
		});
		this.setState({
			NextUpTasks: newNextUpTasks,
			NextUpChangeNumber: this.state.NextUpChangeNumber + 1,
		});
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
	
	renderTreeItem = ({item, provided, snapshot, onExpand, onCollapse}) => {
		var icon = this.getIcon(item, onExpand, onCollapse);
		return <div className="tree-node" ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} data-item-number={item.id}>
			{icon}
			<FrontSideTask task={item.data} disableDescendantCount={true} checkboxCallback={this.outlineCheckboxCallback} />
		</div>
	}
	
	toggleNextUpVisibility = () => {
		this.setState({ NextUpVisible : !this.state.NextUpVisible });
	}
	
	render() {
		return <div>
			<div className={this.state.NextUpVisible ? "" : "hidden"}>
				<NextUp tasks={this.state.NextUpTasks} leftCardIndex={this.state.leftCardIndex} rightCardIndex={this.state.rightCardIndex} cycleCardPile={this.cycleCardPile} checkboxCallback={this.NextUpCheckboxCallback} key={this.state.NextUpChangeNumber} />
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
					renderItem={this.renderTreeItem}
					offsetPerLevel={23}
					onDragStart={this.onDragStart}
					onDragEnd={this.onDragEnd}
					onExpand={this.onExpand}
					onCollapse={this.onCollapse}
					isDragEnabled
					isNestingEnabled
					key={this.state.treeChangeNumber}
				/>
				<form className="task-adder" onSubmit={this.addNewTask} >
					<input type="text" placeholder="New task" value={this.state.new_task_name} onChange={this.handleAddNewTaskEdit} />
					<button>Add</button>
				</form>
			</div>
		</div>
	}
}
