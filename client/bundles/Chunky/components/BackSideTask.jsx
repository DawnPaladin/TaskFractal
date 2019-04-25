import PropTypes from 'prop-types';
import React from 'react';
import ReactOnRails from 'react-on-rails';
import * as Icon from 'react-feather';
import WithSeparator from 'react-with-separator';
import Markdown from 'react-markdown';

import FileUpload from './FileUpload';
import Checkbox from './Checkbox';
import FrontSideTask from './FrontSideTask';
import TaskPicker from './TaskPicker';
import send from './send';
import deleteTask from './deleteTask';

const removeTaskFromArray = (task, array) => {
	let taskIndex = array.findIndex(arrayTask => arrayTask.id == task.id);
	array.splice(taskIndex, 1);
}

export default class BackSideTask extends React.Component {
	static propTypes = {
		task: PropTypes.object.isRequired,
		children: PropTypes.array.isRequired,
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
			children: this.props.children,
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
		};
		
		// functions
		this.addBlockingTask = this.addBlockingTask.bind(this);
		this.addSubtask = this.addSubtask.bind(this);
		this.changeCompletedDescendants = this.changeCompletedDescendants.bind(this);
		this.checkboxChange = this.checkboxChange.bind(this);
		this.deleteTask = deleteTask.bind(this);
		this.editDueDate = this.editDueDate.bind(this);
		this.editTaskName = this.editTaskName.bind(this);
		this.handleAddSubtaskEdit = this.handleAddSubtaskEdit.bind(this);
		this.refresh = this.refresh.bind(this);
		this.refreshAllTasks = this.refreshAllTasks.bind(this);
		this.refreshAttachments = this.refreshAttachments.bind(this);
		this.removeBlockingTask = this.removeBlockingTask.bind(this);
		this.saveTask = this.saveTask.bind(this);
		this.setTaskDetail = this.setTaskDetail.bind(this);
		this.startEditingDueDate = this.startEditingDueDate.bind(this);
		this.stopEditingDueDate = this.stopEditingDueDate.bind(this);
		this.startEditingDescription = this.startEditingDescription.bind(this);
		this.stopEditingDescription = this.stopEditingDescription.bind(this);
		this.startEditingTaskName = this.startEditingTaskName.bind(this);
		this.stopEditingTaskName = this.stopEditingTaskName.bind(this);
		this.test = this.test.bind(this);
		this.updateName = this.updateName.bind(this);
	}
	
	addBlockingTask(blockingTask, relationship) {
		const id = this.state.task.id;
		this.setState(state => {
			state[relationship].push(blockingTask);
			return state;
		}, () => {
			let headers = ReactOnRails.authenticityHeaders();
			headers["Content-Type"] = "application/json";
			
			fetch(`/tasks/${id}/${relationship}/${blockingTask.id}.json`, { method: "POST", headers })
			.then(response => {
				if (response.ok) {
					return response.json();
				} else {
					throw new Error("Couldn't remove blocking task.");
				}
			}).then(json => {
				if (json.error) {
					toastr.error(json.error);
				} else {
					toastr.info(json.text);
				}
			}).catch(error => {
				toastr.error(error.message);
			});
		})
	}
	addSubtask(event) {
		event.preventDefault();
		
		var task = {
			name: this.state.new_task_name,
			parent_id: this.state.task.id
		};
		
		let body = JSON.stringify({task});
		let headers = ReactOnRails.authenticityHeaders();
		headers["Content-Type"] = "application/json";
		
		fetch("/tasks", {
			method: "POST",
			body: body,
			headers: headers,
		}).then(this.refresh());
		
		this.setState({ new_task_name: '' });
	}
	
	changeCompletedDescendants(amount) {
		let new_ccd = this.state.count_completed_descendants + amount;
		this.setState({ count_completed_descendants: new_ccd });
	}
	
	checkboxChange(event, component) {
		if (!component) component = this;
		const completed = event.target.checked;
		completed ? this.changeCompletedDescendants(1) : this.changeCompletedDescendants(-1);
		component.setState(
			(prevState, props) => ({
				task: {
					...prevState.task, // https://stackoverflow.com/a/41391598/1805453
					completed: completed
				}
			}),
			() => { send(component.state.task); }
		)
	}
	
	editDueDate(event) {
		this.setTaskDetail('due_date', event.target.value);
	}

	editTaskName(event) {
		this.setTaskDetail('name', event.target.value);
	}
	
	handleAddSubtaskEdit(event) {
		this.setState({ new_task_name: event.target.value });
	}
	
	refresh = () => {
		let id = this.state.task.id;
		
		let headers = ReactOnRails.authenticityHeaders();
		headers["Content-Type"] = "application/json";
		
		fetch(`/tasks/${id}.json`, {headers})
		.then(response => response.json())
		.then(json => this.setState({ task: json, children: json.descendants }));
	}
	
	refreshAllTasks() {
		const headers = ReactOnRails.authenticityHeaders();
		headers["Content-Type"] = "application/json";
		fetch('/tasks.json', {headers})
		.then(response => {
			if (response.ok) {
				return response.json();
			} else {
				throw new Error("Couldn't fetch tasks.");
			}
		})
		.then(json => {
			this.setState({ allTasks: json });
		}).catch(error => {
			toastr.error(error.message);
		});
	}
	
	refreshAttachments() {
		let id = this.state.task.id;
	
		let headers = ReactOnRails.authenticityHeaders();
		headers["Content-Type"] = "application/json";
		
		fetch(`/tasks/${id}/attachments.json`, {headers})
		.then(response => response.json())
		.then(json => {
			this.setState({ attachments: json })
		})
	}
	
	removeBlockingTask(blockingTask, relationship) {
		const id = this.state.task.id;
		const baseTask = {id};
		this.setState(state => {
			removeTaskFromArray(blockingTask, state[relationship]);
			return state;
		}, () => {
			let body = JSON.stringify({task: baseTask});
			let headers = ReactOnRails.authenticityHeaders();
			headers["Content-Type"] = "application/json";
			
			fetch(`/tasks/${id}/${relationship}/${blockingTask.id}.json`, { method: "DELETE", body, headers })
			.then(response => {
				if (response.ok) {
					return response.json();
				} else {
					throw new Error("Couldn't remove blocking task.");
				}
			}).then(json => {
				if (json.error) {
					toastr.error(json.error);
				} else {
					toastr.info(json.text);
				}
			}).catch(error => {
				toastr.error(error.message);
			});
		})
	}
	

	saveTask() {
		send(this.state.task);
	}
	
	setTaskDetail(detailName, value) {
		this.setState(
			(prevState, props) => {
				let newTaskObj = { ...prevState.task };
				newTaskObj[detailName] = value;
				return { task: newTaskObj }
			}
		)
	}
	
	startEditingDueDate(event) {
		event.preventDefault();
		this.setState({editingDueDate: true});
	}
	
	stopEditingDueDate(event) {
		event.preventDefault();
		this.setState({editingDueDate: false});
		this.saveTask();
	}
	
	startEditingDescription(event) {
		event.preventDefault();
		this.setState({editingDescription: true});
	}
	
	stopEditingDescription(event) {
		event.preventDefault();
		this.setState({editingDescription: false});
		this.saveTask();
	}

	startEditingTaskName(event) {
		event.preventDefault();
		this.setState({editingTaskName: true});
	}
	
	stopEditingTaskName(event) {
		event.preventDefault();
		this.setState({editingTaskName: false});
		this.saveTask();
	}
	
	test(value) {
		console.log(value);
	}
	
	updateName = (name) => {
		this.setState({ name, task: {...this.state.task, name } });
	}
	
	render() {
		let ancestors = this.props.ancestors.map(ancestor => <a href={"/tasks/" + ancestor.id} className="task-link" key={ancestor.id} >{ancestor.name}</a>);
		ancestors.unshift(<a href="/tasks/" className="task-link home-link" key="0"><Icon.Home size="16" /></a>); // TODO: Replace with outline icon
		
		let children = this.state.children.map(child => 
			<FrontSideTask task={child} key={child.id} handleCheckboxChange={this.checkboxChange} />
		);
		let blocked_by = this.state.blocked_by.map(blocked_by => (
			<div className="blocked-task" key={blocked_by.id}>
				<button className="remove-blocked-task-button" onClick={e => this.removeBlockingTask(blocked_by, 'blocked_by')}>
					<Icon.XCircle size="16" />
				</button>
				<FrontSideTask task={blocked_by} handleCheckboxChange={this.checkboxChange} />
			</div>
		));
		let blocking = this.state.blocking.map(blocking => (
			<div className="blocked-task" key={blocking.id}>
				<button className="remove-blocked-task-button" onClick={e => this.removeBlockingTask(blocking, 'blocking')}>
					<Icon.XCircle size="16" />
				</button>
				<FrontSideTask task={blocking} key={blocking.id} handleCheckboxChange={this.checkboxChange} />
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
			<div className="task-card-back">
				<FileUpload task={this.state.task} refreshAttachments={this.refreshAttachments} attachments={this.state.attachments}>
					<button className="delete-task-button" onClick={this.deleteTask}><Icon.Trash2 size="16" /></button>
					<div className="ancestors"><WithSeparator separator=" / ">{ancestors}</WithSeparator></div>
					<h1>
						<Checkbox handleChange={this.checkboxChange} checked={this.state.task.completed} />
						{!this.state.editingTaskName && 
							<label onClick={this.startEditingTaskName}>{this.state.task.name}<Icon.Edit2 size="20" className="edit-icon"/></label>
						}
						{ this.state.editingTaskName && 
							<form onSubmit={this.stopEditingTaskName}>
								<input type="text" value={this.state.task.name} onChange={this.editTaskName} /> 
							</form>
						}
					</h1>
					
					<div className="field box due-date">
						<button onClick={this.startEditingDueDate} className={this.state.editingDueDate ? "hidden doesnt-look-like-a-button" : "doesnt-look-like-a-button"}>
							<Icon.Calendar size="16" />
							{!this.state.task.due_date && <em> Add due date</em> }
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
										<div className="deemphasize">Add a description...</div>
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
						<div className="field-name">subtasks</div>
						<div className="subtasks">
							{children}
							<form className="task-adder" onSubmit={this.addSubtask} >
								<input type="text" placeholder="Add subtask" value={this.state.new_task_name} onChange={this.handleAddSubtaskEdit} />
							</form>
						</div>
					</div>
				
				</FileUpload>
				
				{completionBar}
				
			</div>
		);
	}
}
