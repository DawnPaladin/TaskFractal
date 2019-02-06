// TODO: Attachment count on subtasks
// TODO: Rename attachments

import PropTypes from 'prop-types';
import React from 'react';
import ReactOnRails from 'react-on-rails';
import * as Icon from 'react-feather';
import classNames from 'classnames';
import Dropzone from 'react-dropzone';
import { DirectUpload } from "activestorage";
import WithSeparator from 'react-with-separator';

import Checkbox from './Checkbox';
import FrontSideTask from './FrontSideTask';
import send from './send'

class Attachment extends React.Component {
	static propTypes = {
		attachment: PropTypes.object.isRequired,
		afterDelete: PropTypes.func.isRequired
	};
	constructor(props) {
		super(props);
		let fileExtension = this.props.attachment.name.split('.').pop();
		const imageExtensions = ['png', 'jpg', 'jpeg', 'gif', 'apng', 'svg', 'bmp', 'ico'];
		const isImage = imageExtensions.indexOf(fileExtension) > -1;
		this.state = {
			isImage: isImage
		}
		this.deleteAttachment = this.deleteAttachment.bind(this);
	}
	deleteAttachment() {
		const attachmentId = this.props.attachment.id;
		const name = this.props.attachment.name;

		const headers = ReactOnRails.authenticityHeaders();
		headers["Content-Type"] = "application/json";
		const body = JSON.stringify({
			attachment: this.props.attachment
		})
		
		if (confirm(`Delete ${name}?`)) {
			fetch(`/attachments/${attachmentId}`, {
				method: "DELETE",
				headers: headers,
				body: body
			})
			.then(this.props.afterDelete);
		}
	}
	render() {
		let previewImage = <img src={this.props.attachment.url} />
		let icon = <Icon.File size="16" />
		return (
			<div className="attachment">
				<a href={this.props.attachment.url} target="_blank" rel="noopener noreferrer">
					<div className="file-graphic">
						{ this.state.isImage ? previewImage : icon }
					</div>
				</a>
				<div className="file-name">{ this.props.attachment.name }</div>
				<button className="delete-attachment-button" onClick={this.deleteAttachment}><Icon.Trash2 size="16" /></button>
			</div>
		)
	}
}

class FileUpload extends React.Component {
	static propTypes = {
		task: PropTypes.object.isRequired,
		attachments: PropTypes.array,
		refreshAttachments: PropTypes.func,
	}
	constructor(props) {
		super(props);
		this.uploadFile = this.uploadFile.bind(this);
		this.onDrop = this.onDrop.bind(this);
		this.attachToModel = this.attachToModel.bind(this);
	}
	
	onDrop(acceptedFiles, rejectedFiles) {
		Array.from(acceptedFiles).forEach(file => this.uploadFile(file));
	}
	
	uploadFile(file) {
		const url = '/rails/active_storage/direct_uploads';
		const upload = new DirectUpload(file, url, this);
		
		upload.create((error, blob) => {
			if (error) {
				console.warn(error);
			} else {
				this.attachToModel(blob, this.props.refreshAttachments ? this.props.refreshAttachments : null);
			}
		});
	}
	
	attachToModel(blob, callback) {
		const id = this.props.task.id;
		const headers = ReactOnRails.authenticityHeaders();
		headers["Content-Type"] = "application/json";
		const body = JSON.stringify({
			task: {
				attachments: blob.signed_id
			}
		})
		
		fetch(`/tasks/${id}.json`, {
			method: "PUT",
			headers: headers,
			body: body
		})
		.then(callback);
	}
	
	render() {
		let attachments = this.props.attachments.map(attachment =>
			<Attachment attachment={attachment} key={attachment.id} afterDelete={this.props.refreshAttachments} />
		);
		return (
			<Dropzone onDrop={this.onDrop} disableClick={true} ref={ref => this.dropzoneRef = ref}>
				{({ getRootProps, getInputProps, isDragActive}) => {
					return (
						<div
							{...getRootProps()}
							className={classNames('dropzone', {'dropzone--isActive': isDragActive})}
						>
							<input {...getInputProps()} />
							{this.props.children}
							<div className="field">
								<Icon.Paperclip size="16" />
								<span className="field-name"> attachments</span>
								<div className="box">
									<div className="attachments">{attachments}</div>
									<div className="attach-file">
										<button onClick={this.dropzoneRef ? this.dropzoneRef.open : null}>Attach files</button> <i className="deemphasize">or drag them here</i>
									</div>
								</div>
							</div>
						</div>
					)
				}}
			</Dropzone>
		)
	}
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
			name: this.props.task.name,
			children: this.props.children,
			blocked_by: this.props.blocked_by,
			blocking: this.props.blocking,
			attachments: this.props.attachments,
			count_descendants: this.props.count_descendants,
			count_completed_descendants: this.props.count_completed_descendants,
			new_task_name: '',
		};
		
		// functions
		this.checkboxChange = this.checkboxChange.bind(this);
		this.changeCompletedDescendants = this.changeCompletedDescendants.bind(this);
		this.saveTask = this.saveTask.bind(this);
		this.setTaskDetail = this.setTaskDetail.bind(this);
		this.test = this.test.bind(this);
		this.refresh = this.refresh.bind(this);
		this.refreshAttachments = this.refreshAttachments.bind(this);
		this.handleAddSubtaskEdit = this.handleAddSubtaskEdit.bind(this);
		this.addSubtask = this.addSubtask.bind(this);
	}
	
	test(value) {
		console.log(value);
	}
	
	updateName = (name) => {
		this.setState({ name });
	};
	
	changeCompletedDescendants(amount) {
		let new_ccd = this.state.count_completed_descendants + amount;
		this.setState({ count_completedDescendants: new_ccd });
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
		);
	}
	
	setTaskDetail(detailName, value) {
		console.log(value);
		this.setState(
			(prevState, props) => {
				let newTaskObj = { ...prevState.task };
				newTaskObj[detailName] = value;
				console.log(newTaskObj);
				return { task: newTaskObj }
			}
		)
	}
	
	saveTask() {
		send(this.state.task);
	}
	
	refresh = () => {
		let id = this.state.task.id;
	
		let headers = ReactOnRails.authenticityHeaders();
		headers["Content-Type"] = "application/json";
		
		fetch(`/tasks/${id}.json`, {
			method: "GET",
			headers: headers
		})
		.then(response => response.json())
		.then(json => this.setState({ task: json, children: json.descendants }));
	}
	
	refreshAttachments() {
		let id = this.state.task.id;
	
		let headers = ReactOnRails.authenticityHeaders();
		headers["Content-Type"] = "application/json";
		
		fetch(`/tasks/${id}/attachments.json`, {
			method: "GET",
			headers: headers
		})
		.then(response => response.json())
		.then(json => {
			console.log(json);
			this.setState({ attachments: json })
		})
	}
	
	handleAddSubtaskEdit(event) {
		this.setState({ new_task_name: event.target.value });
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
	
	render() {
		{/* TODO: Consistent sorting (probably done on backend) */}
		const none = <div className="deemphasize"><em>None</em></div>

		let ancestors = this.props.ancestors.map(ancestor => <a href={"/tasks/" + ancestor.id} className="task-link" key={ancestor.id} >{ancestor.name}</a>);
		ancestors.unshift(<a href="/tasks/" className="task-link home-link" key="0"><Icon.Home size="16" /></a>); // TODO: Replace with outline icon
		
		let children = this.state.children.map(child => 
			<FrontSideTask task={child} key={child.id} handleCheckboxChange={this.checkboxChange} />
		);
		let blocked_by = this.state.blocked_by.map(blocked_by =>
			<FrontSideTask task={blocked_by} key={blocked_by.id} handleCheckboxChange={this.checkboxChange} />
		);
		if (blocked_by.length == 0) blocked_by = none;
		let blocking = this.state.blocking.map(blocking =>
			<FrontSideTask task={blocking} key={blocking.id} handleCheckboxChange={this.checkboxChange} />
		);
		if (blocking.length == 0) blocking = none;
		
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
					<div className="ancestors"><WithSeparator separator=" / ">{ancestors}</WithSeparator></div>
					<h1>
						<label>
							<Checkbox handleChange={this.checkboxChange} checked={this.state.task.completed} />
							{ this.state.task.name }
						</label>
					</h1>
					
					<div className="field box due-date">
						<Icon.Calendar size="16" />
						{ this.state.task.due_date ? " Due: " + this.state.task.due_date : <em> Add due date</em> }
					</div>
					
					<div className="field">
						<Icon.AlignLeft size="16" />
						<span className="field-name"> notes</span>
						<div className="box">
							<textarea value={this.state.task.description} onChange={e => this.setTaskDetail('description', e.target.value)} />
						</div>
						<button className="save-notes" onClick={this.saveTask}>Save</button>
					</div>

					<div className="row">
						<div className="field">
							<Icon.PauseCircle size="16" />
							<span className="field-name"> waiting on</span>
							<div className="box">
								{blocked_by}
							</div>
						</div>
						<div className="field">
							<Icon.AlertCircle size="16" />
							<span className="field-name"> blocking</span>
							<div className="box">
								{blocking}
							</div>
						</div>
					</div>
					
					<div className="field">
						<div className="field-name">subtasks</div>
						<div className="subtasks">
							{children}
							<form className="add-subtask" onSubmit={this.addSubtask} >
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
