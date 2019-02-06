import PropTypes from 'prop-types';
import React from 'react';
import * as Icon from 'react-feather';

import Checkbox from './Checkbox';
import send from './send';

/**
 * This component is placed either on a Chunky (back-side task) component or in an Outline.
 */
export default class FrontSideTask extends React.Component {
	static propTypes = {
		task: PropTypes.object.isRequired,
		checkboxChange: PropTypes.func,
		disableDescendantCount: PropTypes.bool,
	}
	constructor(props) {
		super(props);
		this.name = this.props.task.name; // for ease of debugging
		this.state = {
			task: this.props.task
		}
		if (this.handleCheckbox) this.handleCheckbox = this.handleCheckbox.bind(this);
		if (this.props.checkboxChange) { 
			this.checkboxChange = this.props.checkboxChange.bind(this);
		} else {
			this.checkboxChange = this.checkboxChange.bind(this);
		}
	}
	handleCheckbox(event) {
		this.checkboxChange(event, this);
	}

	// If FrontSideTask is in a Chunky, Chunky will provide a checkboxChange function. If not, we use this one.
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
			<div className="task-card-front">
				<Checkbox checked={this.state.task.completed} handleChange={this.handleCheckbox} />
				<a className="task-link" href={url}>{ this.state.task.name }</a>
				<div className="details">
					{ this.state.task.dueDate ?
						<div><Icon.Calendar size="16" /> {this.state.task.dueDate}</div> : ""
					}
					{ this.state.task.description ?
						<div><Icon.AlignLeft size="16" /></div> : ""
					}
					{ this.state.task.attachments ?
						<div><Icon.Paperclip size="16" /> {this.state.task.attachments}</div> : ""
					}
					{ parseInt(this.state.task.descendants.length) > 0 && !this.props.disableDescendantCount ? 
						<div><Icon.CheckSquare size="16" /> {this.state.task.completed_descendants.length}/{this.state.task.descendants.length}</div> : ""
					}
				</div>
			</div>
		)
	}
}
