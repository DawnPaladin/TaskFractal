import PropTypes from 'prop-types';
import React from 'react';
import * as Icon from 'react-feather';
import WithSeparator from 'react-with-separator';
import Markdown from 'react-markdown';

import FileUpload from './FileUpload';
import Checkbox from './Checkbox';
import FrontSideTask from './FrontSideTask';
import TaskPicker from './TaskPicker'; // Type to select a task (autocomplete)
import Outline from './Outline';
import NextUp from './NextUp';
import network from './network'; // Performs network calls to the Rails backend
import send from './send'; // Sends task updates to the Rails backend
import deleteTask from './deleteTask';
import sendTaskMovement from './sendTaskMovement'; // Tells the Rails backend that a task has a new parent and/or a new position in a list
import taskUpdates from './taskUpdates'; // Broadcasts task changes to other components

const removeTaskFromArray = (task, array) => {
	let taskIndex = array.findIndex(arrayTask => arrayTask.id == task.id);
	array.splice(taskIndex, 1);
}

const moveItemInArray = (array, sourceIndex, destinationIndex) => {
	let item = array[sourceIndex];
	array.splice(sourceIndex, 1);
	array.splice(destinationIndex, 0, item);
}

export default class BackSideTask extends React.Component {
	static propTypes = {
		task: PropTypes.object.isRequired,
		descendants: PropTypes.object.isRequired,
		blocked_by: PropTypes.array.isRequired,
		blocking: PropTypes.array.isRequired,
		attachments: PropTypes.array.isRequired,
		count_descendants: PropTypes.number.isRequired,
		count_completed_descendants: PropTypes.number.isRequired,
		ancestors: PropTypes.array,
	};
	
	constructor(props) {
		super(props);
		
		this.state = { 
			task: this.props.task,
			blocked_by: this.props.blocked_by,
			blocking: this.props.blocking,
			allTasks: [],
			attachments: this.props.attachments,
			count_descendants: this.props.count_descendants,
			count_completed_descendants: this.props.count_completed_descendants,
			new_task_name: '',
			editingDueDate: false,
			editingDescription: false,
			editingTaskName: false,
			NextUpVisible: this.props.next_up_visible,
			completedTasksVisible: this.props.completed_tasks_visible,
		};
		
		document.title = this.state.task.name;
		
		this.deleteTask = deleteTask.bind(this);
	}
	
	addBlockingTask = (blockingTask, relationship) => {
		const id = this.state.task.id;
		this.setState(state => {
			state[relationship].push(blockingTask);
			return state;
		}, () => {
			network.post(`/tasks/${id}/${relationship}/${blockingTask.id}.json`);
		})
	}
	addSubtask = event => {
		event.preventDefault();
		
		var task = {
			name: this.state.new_task_name,
			parent_id: this.state.task.id
		};
		
		network.post("/tasks", {task})
			.then(response => {
				const newTask = response.data;
				this.setState(state => {
					const newState = {...state};
					newState.children.push(newTask);
					newState.allTasks.push(newTask);
					newState.count_descendants++;
					newState.new_task_name = '';
					return newState;
				});
			})
		;
	}
	
	changeCompletedDescendants = amount => {
		let new_ccd = this.state.count_completed_descendants + amount;
		this.setState({ count_completed_descendants: new_ccd });
	}
	
	// for the Checkbox at the top of the page
	checkboxChange = event => {
		const task = {...this.state.task};
		task.completed = !task.completed;
		this.setState({task});
		send(task);
		taskUpdates.broadcast(task, "BackSideTask")
	}
	
	// for FrontSideTasks in list of subtasks
	subtaskCheckboxChange = task => {
		this.checkCompletedDescendants(task);
	}
	blockingCheckboxChange = task => {
		const blockingIndex = this.state.blocking.findIndex(object => object.id == task.id);
		const newBlockingTasks = [...this.state.blocking];
		newBlockingTasks[blockingIndex] = task;
		this.setState({ blocking: newBlockingTasks });
		send(task);
		taskUpdates.broadcast(task, "BackSideTask")
		
		this.checkCompletedDescendants(task);
	}
	blockedByCheckboxChange = task => {
		const blockedByIndex = this.state.blocked_by.findIndex(object => object.id == task.id);
		const newBlockedByTasks = [...this.state.blocking];
		newBlockedByTasks[blockedByIndex] = task;
		this.setState({ blocked_by: newBlockedByTasks });
		send(task);
		taskUpdates.broadcast(task, "BackSideTask")
		
		this.checkCompletedDescendants(task);
	}
	
	/**
	 * Updates completedDescendants if task is one of those descendants
	 */
	checkCompletedDescendants = task => {
		if (this.isTaskADescendant(task)) {
			const amount = task.completed ? 1 : -1;
			this.changeCompletedDescendants(amount);
		}
	}

	deleteCompletedSubtasks = event => {
		if (confirm(`This will delete all of this task's completed subtasks, along with all of their children, attachments, and other information. Are you sure?`)) {
			let id = this.state.task.id;
	
			network.delete(`/tasks/${id}/completed_subtasks.json`)
				.then(() => { location.reload(); })
		}
	}
	
	editDueDate = event => {
		this.setTaskDetail('due_date', event.target.value);
	}

	editTaskName = event => {
		this.setTaskDetail('name', event.target.value);
	}
	
	handleAddSubtaskEdit = event => {
		this.setState({ new_task_name: event.target.value });
	}
	
	/**
	 * Checks if a task is one of the BackSideTask's descendants.
	 */
	isTaskADescendant = task => {
		const descendants = this.state.task.descendants.map(descendant => descendant.id);
		return descendants.includes(task.id);
	}
	
	onDragEnd = result => {
		const { destination, source, draggableId } = result;
		
		if (!destination) return;
		if (destination.droppableId === source.droppableId && destination.index === source.index) return;
		
		this.setState(state => {
			const children = Array.from(state.children);
			moveItemInArray(children, source.index, destination.index);
			return { children };
		});
		
		sendTaskMovement(draggableId, destination.index);
	}
	
	refresh = () => {
		let id = this.state.task.id;
		
		network.get(`/tasks/${id}.json`)
		.then(response => this.setState({ task: response.data, children: response.data.children }));
	}
	
	refreshAllTasks = () => {
		network.get('/tasks.json')
		.then(response => {
			this.setState({ allTasks: response.data });
		});
	}
	
	refreshAttachments = () => {
		let id = this.state.task.id;
	
		network.get(`/tasks/${id}/attachments.json`)
		.then(response => {
			this.setState({ attachments: response.data })
		})
	}
	
	removeBlockingTask = (blockingTask, relationship) => {
		const id = this.state.task.id;
		const baseTask = {id};
		this.setState(state => {
			removeTaskFromArray(blockingTask, state[relationship]);
			return state;
		}, () => { network.delete(`/tasks/${id}/${relationship}/${blockingTask.id}.json`, {task: baseTask}) })
	}
	
	saveTask = () => {
		send(this.state.task);
	}
	
	// setState any part of a task. Network update not included.
	setTaskDetail = (detailName, value) => {
		this.setState(
			(prevState, props) => {
				let newTaskObj = { ...prevState.task };
				newTaskObj[detailName] = value;
				return { task: newTaskObj }
			}
		)
	}
	
	startEditingDueDate = event => {
		event.preventDefault();
		this.setState({editingDueDate: true});
	}
	
	stopEditingDueDate = event => {
		event.preventDefault();
		this.setState({editingDueDate: false});
		this.saveTask();
	}
	
	startEditingDescription = event => {
		event.preventDefault();
		this.setState({editingDescription: true});
	}
	
	stopEditingDescription = event => {
		event.preventDefault();
		this.setState({editingDescription: false});
		this.saveTask();
	}

	startEditingTaskName = event => {
		event.preventDefault();
		this.setState({editingTaskName: true});
	}
	
	stopEditingTaskName = event => {
		event.preventDefault();
		this.setState({editingTaskName: false});
		this.saveTask();
		document.title = this.state.task.name;
	}
	
	updateName = name => {
		this.setState({ name, task: {...this.state.task, name } });
	}
	
	toggleNextUpVisibility = () => {
		const newState = !this.state.NextUpVisible;
		this.setState({ NextUpVisible : newState });
	}
	
	toggleCompletedTasksVisibility = () => {
		const newState = !this.state.completedTasksVisible;
		this.setState({ completedTasksVisible: newState });
	}
	
	componentDidMount() {
		document.addEventListener('toggleNextUpVisible', this.toggleNextUpVisibility);
		document.addEventListener('toggleCompletedTasksVisible', this.toggleCompletedTasksVisibility);
	}
	
	render() {
		let ancestors = this.props.ancestors.map(ancestor => <a href={"/tasks/" + ancestor.id} className="task-link" key={ancestor.id} >{ancestor.name}</a>);
		ancestors.unshift(<a href="/tasks/" className="task-link" key="0"><Icon.Home size="16" /> Home</a>);
		
		let blocked_by = this.state.blocked_by.map(blocked_by => (
			<div className="blocked-task" key={blocked_by.id}>
				<button className="remove-blocked-task-button" onClick={e => this.removeBlockingTask(blocked_by, 'blocked_by')}>
					<Icon.XCircle size="16" />
				</button>
				<FrontSideTask task={blocked_by} checkboxChange={this.blockedByCheckboxChange} />
			</div>
		));
		let blocking = this.state.blocking.map(blocking => (
			<div className="blocked-task" key={blocking.id}>
				<button className="remove-blocked-task-button" onClick={e => this.removeBlockingTask(blocking, 'blocking')}>
					<Icon.XCircle size="16" />
				</button>
				<FrontSideTask task={blocking} key={blocking.id} checkboxChange={this.blockingCheckboxChange} />
			</div>
		));
		
		let cells = [];
		const completedDescendants = this.state.count_completed_descendants;
		const totalDescendants = this.state.count_descendants;
		const coverPercentage = (1-(completedDescendants/totalDescendants))*100 + "%";
		const coverCompletionBar = <div style={{width: coverPercentage}} className="completion-bar-cover"></div>
		for (var i = 0; i < totalDescendants; i++) {
			cells.push(<td key={i}></td>);
		}
		let completionBar = (
			<div className="completion-bar">
				<table>
					<tbody>
						<tr>
							{cells}
						</tr>
					</tbody>
				</table>
				{coverCompletionBar}
			</div>
		)
		
		return (
			<div className="back-side-task-page">
				<div className={this.state.NextUpVisible ? "next-up-visible" : "next-up-hidden"}>
					<NextUp taskId={this.state.task.id} />
				</div>
				<div className="task-card-back">
					<FileUpload task={this.state.task} refreshAttachments={this.refreshAttachments} attachments={this.state.attachments}>
						<button className="delete-task-button" title="Delete task" onClick={this.deleteTask}><Icon.Trash2 size="16" /></button>
						<div className="ancestors"><WithSeparator separator=" / ">{ancestors}</WithSeparator></div>
						<h1>
							<Checkbox handleChange={this.checkboxChange} checked={this.state.task.completed} />
							{!this.state.editingTaskName && 
								<label onClick={this.startEditingTaskName}>{this.state.task.name}<Icon.Edit2 size="20" className="edit-icon"/></label>
							}
							{ this.state.editingTaskName && 
								<form onSubmit={this.stopEditingTaskName}>
									<input type="text" value={this.state.task.name} onChange={this.editTaskName} />
									<button><Icon.Check/></button>
								</form>
							}
						</h1>
						
						<div className="field box due-date">
							<button onClick={this.startEditingDueDate} className={this.state.editingDueDate ? "hidden doesnt-look-like-a-button" : "doesnt-look-like-a-button"}>
								<Icon.Calendar size="16" />
								{!this.state.task.due_date && <em className="deemphasize"> Add due date</em> }
								{ this.state.task.due_date && " Due: " + this.state.task.due_date }
							</button>
							<div className={this.state.editingDueDate ? "" : "hidden"}>
								<Icon.Calendar size="16" />
								<input type="date" value={this.state.task.due_date || ""} onChange={this.editDueDate} />
								<button onClick={this.stopEditingDueDate}><Icon.Check size="16"/></button>
							</div>
						</div>
						
						<Icon.AlignLeft size="16" />
						<span className="field-name"> notes</span>
						<a className="markdown-formatting-help" style={{ display: this.state.editingDescription ? "inline" : "none" }} href="https://www.markdownguide.org/basic-syntax/" target="_blank" rel="noopener">markdown formatting help</a>
						<div className="description-field">
							{ this.state.editingDescription ? (
								<div>
									<div className="field box">
										<textarea value={this.state.task.description} onChange={e => this.setTaskDetail('description', e.target.value)} />
									</div>
									<button className="save-notes" onClick={this.stopEditingDescription}>Save</button>
								</div>
							) : (
								<button onClick={this.startEditingDescription} className="block doesnt-look-like-a-button">
									<div className="field box">
										{ this.state.task.description ? (
											<Markdown source={this.state.task.description} className="description" />
										) : (
											<em className="deemphasize">Add a description</em>
										) }
									</div>
								</button>
							) }
						</div>

						<div className="row">
							<div className="field">
								<Icon.PauseCircle size="16" />
								<span className="field-name"> waiting on</span>
								<div className="box">
									{blocked_by}
									<TaskPicker 
										allTasks={this.state.allTasks} 
										refreshAllTasks={this.refreshAllTasks} 
										addBlockingTask={this.addBlockingTask}
										relationship="blocked_by"
									/>
								</div>
							</div>
							<div className="field">
								<Icon.AlertCircle size="16" />
								<span className="field-name"> blocking</span>
								<div className="box">
									{blocking}
									<TaskPicker 
										allTasks={this.state.allTasks} 
										refreshAllTasks={this.refreshAllTasks} 
										addBlockingTask={this.addBlockingTask}
										relationship="blocking"
									/>
								</div>
							</div>
						</div>
						
						<div className="field">
							{ this.state.count_completed_descendants > 0 && <button className="delete-completed-subtasks-button doesnt-look-like-a-button" title="Delete completed subtasks" onClick={this.deleteCompletedSubtasks}>
								<div className="icon delete-completed-subtasks-icon"></div>
							</button> }
							<div className="field-name">subtasks</div>
							<div className="subtasks">
								<Outline tasks={this.props.descendants} parentId={this.state.task.id} completedTasksVisible={this.state.completedTasksVisible} checkboxChange={this.subtaskCheckboxChange} />
							</div>
						</div>
					
					</FileUpload>
					
					{completionBar}
					
				</div>
			</div>
		);
	}
}
