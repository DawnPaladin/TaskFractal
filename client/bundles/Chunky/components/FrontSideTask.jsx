import PropTypes from 'prop-types';
import React from 'react';
import * as Icon from 'react-feather';
import classNames from 'classnames';

import Checkbox from './Checkbox';
import deleteTask from './deleteTask';

// This component is placed either on a BackSideTask component, in an Outline, or in NextUp.
// The checked/unchecked state must be controlled by the parent.
export default class FrontSideTask extends React.Component {
	static propTypes = {
		task: PropTypes.object.isRequired,
		checkboxChange: PropTypes.func.isRequired,
		disableDescendantCount: PropTypes.bool,
	}
	constructor(props) {
		super(props);
		this.name = this.props.task.name; // for ease of debugging
		this.handleCheckbox = this.handleCheckbox.bind(this);
	}
	
	handleCheckbox(event) {
		const task = {...this.props.task};
		task.completed = !task.completed;
		this.props.checkboxChange(task);
		// Parent component must call this.setState(), putting task wherever it belongs in parent's state.
		// Parent should also call send(task) as appropriate.
	}
	
	render() {
		var task = this.props.task;
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
