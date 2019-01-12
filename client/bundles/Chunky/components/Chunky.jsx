// FIXME: Uploaded files only visible on reload
// TODO: Attachment count on subtasks
// TODO: Drag-and-drop upload
// TODO: Rename attachments
// TODO: Use setTaskDetail() more widely

import PropTypes from 'prop-types';
import React from 'react';
import ReactOnRails from 'react-on-rails';
import ActiveStorageProvider from 'react-activestorage-provider';
import * as Icon from 'react-feather';

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
		
		let attachments = this.state.attachments.map(attachment =>
			<Attachment attachment={attachment} key={attachment.id} />
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
		
		let fileUpload = <ActiveStorageProvider
			endpoint={{
				path: '/tasks/' + this.state.task.id + '.json',
				model: 'Task',
				attribute: 'attachments',
				method: 'PUT',
			}}
			onSubmit={task => this.setTaskDetail('attachments', task.attachments)}
			render={({ handleUpload, uploads, ready }) => (
				<span>
					<input 
						type="file"
						disabled={!ready}
						onChange={e => handleUpload(e.currentTarget.files)}
					/>
					
					{uploads.map(upload => {
						switch (upload.state) {
							case 'waiting':
								return <p key={upload.id}>Waiting to upload {upload.file.name}</p>
							case 'uploading':
								return (
									<p key={upload.id}>Uploading {upload.file.name}: {upload.progress}%</p>
								)
							case 'error':
								return (
									<p key={upload.id}>Error uploading {upload.file.name}: {upload.error}</p>
								)
							case 'finished':
								return <p key={upload.id}>Finished uploading {upload.file.name}</p>
						}
					})}
				</span>
			)}
		/>
		
		return (
			<div className="task-card-back">
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
					<Icon.AlignLeft size="16" />
					<span className="field-name"> notes</span>
					<div className="box">
						<textarea value={this.state.task.description} onChange={e => this.setTaskDetail('description', e.target.value)} />
					</div>
					<button className="save-notes" onClick={this.saveTask}>Save</button>
				</div>
				
				<div className="field">
					<Icon.Paperclip size="16" />
					<span className="field-name"> attachments</span>
					<div className="box">
						<div className="attachments">{attachments}</div>
						<div className="attach-file">
							<i className="deemphasize">Attach file: </i>
							{fileUpload}
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
				
			</div>
		);
	}
}
