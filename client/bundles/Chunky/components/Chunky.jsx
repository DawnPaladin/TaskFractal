// TODO: Attachment count on subtasks
// TODO: Rename attachments
// TODO: Bigger drop zone for attachments
// TODO: Use setTaskDetail() more widely

import PropTypes from 'prop-types';
import React from 'react';
import ReactOnRails from 'react-on-rails';
import * as Icon from 'react-feather';
import classNames from 'classnames';
import Dropzone from 'react-dropzone';
import { DirectUpload } from "activestorage";

import Checkbox from './Checkbox';
import FrontSideTask from './FrontSideTask';

class Attachment extends React.Component {
	static propTypes = {
		attachment: PropTypes.object.isRequired,
	};
	constructor(props) {
		super(props);
		let fileExtension = this.props.attachment.name.split('.').pop();
		const imageExtensions = ['png', 'jpg', 'jpeg', 'gif', 'apng', 'svg', 'bmp', 'ico'];
		const isImage = imageExtensions.indexOf(fileExtension) > -1;
		this.state = {
			isImage: isImage
		}
		this.dropzoneRef = null;
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
			</div>
		)
	}
}

class FileUpload extends React.Component {
	static propTypes = {
		task: PropTypes.object.isRequired,
		afterUpload: PropTypes.func,
		attachments: PropTypes.array
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
				this.attachToModel(blob, this.props.afterUpload ? this.props.afterUpload : null);
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
			<Attachment attachment={attachment} key={attachment.id} />
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
							{
								// isDragActive ?
									<div className="drop-files-here">
										Drop files here
									</div> 
									// :
									// <p>Click or drag files here to upload</p>
							}
							{this.props.children}
							<div className="field">
								<Icon.Paperclip size="16" />
								<span className="field-name"> attachments</span>
								<div className="box">
									<div className="attachments">{attachments}</div>
									<div className="attach-file">
										<button onClick={this.dropzoneRef ? this.dropzoneRef.open : null}>Attach files</button>
										{/* <i className="deemphasize">Attach file: </i> */}
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

export default class Chunky extends React.Component {
	static propTypes = {
		task: PropTypes.object.isRequired,
	};

	/**
	 * @param props - Comes from your rails view.
	 */
	constructor(props) {
		super(props);
		
		// How to set initial state in ES6 class syntax
		// https://reactjs.org/docs/state-and-lifecycle.html#adding-local-state-to-a-class
		this.state = { 
			task: this.props.task,
			name: this.props.task.name,
			children: this.props.children,
			blocked_by: this.props.blocked_by,
			blocking: this.props.blocking,
			attachments: this.props.attachments
		};
		
		this.checkboxChange = this.checkboxChange.bind(this);
		this.changeCompletedDescendants = this.changeCompletedDescendants.bind(this);
		this.saveTask = this.saveTask.bind(this);
		this.setTaskDetail = this.setTaskDetail.bind(this);
		this.test = this.test.bind(this);
		this.refreshAttachments = this.refreshAttachments.bind(this);
	}
	
	test(value) {
		console.log(value);
	}
	
	updateName = (name) => {
		this.setState({ name });
	};
	
	changeCompletedDescendants(amount) {
		let new_cd = this.state.task.completed_descendants + amount;
		this.setState(
			(prevState, props) => ({
				task: {
					...prevState.task,
					completed_descendants: new_cd
				}
			})
		);
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
			() => { component.send(component.state.task); }
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
		this.send(this.state.task);
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
		.then(json => this.setState({ task: json }));
		
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
	
	send(task) {
		let body = JSON.stringify({task});
		let id = task.id;
		
		let headers = ReactOnRails.authenticityHeaders();
		headers["Content-Type"] = "application/json";
		
		fetch(`/tasks/${id}.json`, {
			method: "PUT",
			body: body,
			headers: headers
		});
	}
	
	render() {
		{/* TODO: Consistent sorting (probably done on backend) */}
		let children = this.state.children.map(child => 
			<FrontSideTask task={child} key={child.id} send={this.send} handleCheckboxChange={this.checkboxChange} />
		);
		let blocked_by = this.state.blocked_by.map(blocked_by =>
			<FrontSideTask task={blocked_by} key={blocked_by.id} send={this.send} handleCheckboxChange={this.checkboxChange} />
		);
		let blocking = this.state.blocking.map(blocking =>
			<FrontSideTask task={blocking} key={blocking.id} send={this.send} handleCheckboxChange={this.checkboxChange} />
		);
		
		let cells = [];
		const completedDescendants = this.state.task.completed_descendants;
		const totalDescendants = this.state.task.descendants;
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
				<FileUpload task={this.state.task} afterUpload={this.refreshAttachments} attachments={this.state.attachments}>
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
						<div className="chunks">
							{children}
							<div className="add-chunk">Add chunk</div>
						</div>
					</div>
					
					{completionBar}
				
				</FileUpload>
				
			</div>
		);
	}
}
