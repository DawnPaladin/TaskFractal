import PropTypes from 'prop-types';
import React from 'react';
import * as Icon from 'react-feather';

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
		var url = "/tasks/" + this.state.task.id;
		return (
			<div className="task-card-front" ref={this.props.innerRef}>
				{/* <button className="delete-attachment-button" onClick={this.deleteTask}><Icon.Trash2 size="16" /></button> */}
				<Checkbox checked={this.state.task.completed} handleChange={this.handleCheckbox} />
				<a className="task-link" href={url}>{ this.state.task.name }</a>
				<div className="details">
					{ this.state.task.due_date ?
						<div><Icon.Calendar size="16" /> {this.state.task.dueDate}</div> : ""
					}
					{ this.state.task.description ?
						<div><Icon.AlignLeft size="16" /></div> : ""
					}
					{ this.state.task.attachment_count ?
						<div><Icon.Paperclip size="16" /> {this.state.task.attachment_count}</div> : ""
					}
					{ !this.props.disableDescendantCount && parseInt(this.state.task.descendants.length) > 0 ? 
						<div><Icon.CheckSquare size="16" /> {this.state.task.completed_descendants.length}/{this.state.task.descendants.length}</div> : ""
					}
				</div>
			</div>
		)
	}
}
