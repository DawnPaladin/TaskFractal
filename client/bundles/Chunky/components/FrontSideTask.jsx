import PropTypes from 'prop-types';
import React from 'react';
import * as Icon from 'react-feather';

import Checkbox from './Checkbox';

export default class FrontSideTask extends React.Component {
	static propTypes = {
		task: PropTypes.object.isRequired,
		send: PropTypes.func,
		handleCheckboxChange: PropTypes.func,
	}
	constructor(props) {
		super(props);
		this.name = this.props.task.name; // for ease of debugging
		this.state = {
			task: this.props.task
		}
		if (this.send) this.send = this.props.send.bind(this);
		if (this.handleCheckbox) this.handleCheckbox = this.handleCheckbox.bind(this);
	}
	handleCheckbox(event) {
		this.props.handleCheckboxChange(event, this);
	}
	render() {
		return (
			<div className="task-card-front">
				<Checkbox checked={this.state.task.completed} handleChange={this.handleCheckbox} />
				<div className="checkbox-label">{ this.state.task.name }</div>
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
					{ parseInt(this.state.task.descendants.length) > 0 ? 
						<div><Icon.CheckSquare size="16" /> {this.state.task.completed_descendants.length}/{this.state.task.descendants.length}</div> : ""
					}
				</div>
			</div>
		)
	}
}