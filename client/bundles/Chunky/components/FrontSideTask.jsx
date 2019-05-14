import PropTypes from 'prop-types';
import React from 'react';
import * as Icon from 'react-feather';
import classNames from 'classnames';

import Checkbox from './Checkbox';
import send from './send';
import deleteTask from './deleteTask';

// This component is placed either on a BackSideTask component or in an Outline.
export default class FrontSideTask extends React.Component {
	static propTypes = {
		task: PropTypes.object.isRequired,
		handleCheckboxChange: PropTypes.func,
		disableDescendantCount: PropTypes.bool,
	}
	constructor(props) {
		super(props);
		this.name = this.props.task.name; // for ease of debugging
		this.state = {
			task: this.props.task
		}
		this.handleCheckbox = this.handleCheckbox.bind(this);
		this.checkboxChange = this.props.handleCheckboxChange ? this.props.handleCheckboxChange.bind(this) : this.checkboxChange.bind(this);
		this.deleteTask = deleteTask.bind(this);
	}
	
	handleCheckbox(event) {
		this.checkboxChange(event, this);
	}
	
	// If FrontSideTask is in a BackSideTask, BackSideTask will provide a checkboxChange function. If not, we use this one.
	checkboxChange(event) {
		const completed = event.target.checked;
		this.setState(
			(prevState, props) => ({
				task: {
					...prevState.task,
					completed: completed
				}
			}),
			() => { send(this.state.task); }
		);
	}
		
	render() {
		var task = this.state.task;
		var url = "/tasks/" + task.id;
		var attachmentTitle = task.attachment_count > 1 ? task.attachment_count + " attachments" : "1 attachment";
		return (
			<div className="task-card-front" ref={this.props.innerRef}>
				{/* <button className="delete-attachment-button" onClick={this.deleteTask}><Icon.Trash2 size="16" /></button> */}
				<Checkbox checked={task.completed} handleChange={this.handleCheckbox} />
				<a className={classNames('task-link', { "deemphasize": task.blocked_by_count > 0 })} href={url}>{ task.name }</a>
				<div className="details">
					{ task.blocked_by_count ? 
						<div title={"Blocked by " + task.blocked_by_count}><Icon.PauseCircle size="17" /> {task.blocked_by_count} </div> : null
					}
					{ task.blocking_count ? 
						<div title={"Blocking " + task.blocking_count}><Icon.AlertCircle size="16" /> {task.blocking_count}</div> : null
					}
					{ task.due_date ?
						<div title={"Due " + task.dueDate}><Icon.Calendar size="16" /> {task.dueDate}</div> : ""
					}
					{ task.description ?
						<div title={task.description}><Icon.AlignLeft size="16" /></div> : ""
					}
					{ task.attachment_count ?
						<div title={attachmentTitle}><Icon.Paperclip size="16" /> {task.attachment_count}</div> : ""
					}
					{ !this.props.disableDescendantCount && parseInt(task.descendants.length) > 0 ? 
						<div><Icon.CheckSquare size="16" /> {task.completed_descendants.length}/{task.descendants.length}</div> : ""
					}
				</div>
			</div>
		)
	}
}
