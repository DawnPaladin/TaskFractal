import PropTypes from 'prop-types';
import React from 'react';
import * as Icon from 'react-feather';
import classNames from 'classnames';
import moment from 'moment';

import Checkbox from './Checkbox';
import ErrorBoundary from './ErrorBoundary';

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
	
	// Descendant count will come in as descendant_count or descendants.length, depending on where the component is included. Same for completed_descendant_count. Here we standardize these for easier access.
	getDescendantCount = () => {
		return Array.isArray(this.props.task.descendants) ? this.props.task.descendants.length : this.props.task.descendant_count
	}
	getCompletedDescendantCount = () => {
		return Array.isArray(this.props.task.completed_descendants) ? this.props.task.completed_descendants.length : this.props.task.completed_descendant_count;
	}
	
	handleCheckbox(event) {
		const task = {...this.props.task};
		task.completed = !task.completed;
		this.props.checkboxChange(task);
		// Parent component must call this.setState(), putting task wherever it belongs in parent's state.
		// Parent should also call send(task) as appropriate.
	}
	
	render() {
		const task = this.props.task;
		const url = "/tasks/" + task.id;
		const attachmentTitle = task.attachment_count > 1 ? task.attachment_count + " attachments" : "1 attachment";
		const blockedByCount = task.blocked_by_ids?.length;
		const blockingCount = task.blocking_ids?.length;
		
		// format due date, if applicable
		if (task.due_date) {
			var then = moment(task.due_date);
			var today = moment().startOf('day');
			var inOneWeek = moment().add(7, 'days');
			var isPast = then.isBefore(today);
			var isToday = then.isSame(today, 'day');
			var isWithinAWeek = then.isBetween(today, inOneWeek);
			var isThisYear = then.isSame(today, 'year');
			
			if (isWithinAWeek) {
				var formattedDate = then.format('ddd');
			} else if (isThisYear) {
				var formattedDate = then.format('MMM D');
			} else {
				var formattedDate = then.format('MMM D YYYY');
			}
		}
		
		// Calculate the number of details. If 0, set height of details panel to 0.
		// We do this so we can animate the height of the details panel.
		const numberify = data => {
			data = Number(data);
			if (isNaN(data)) data = 0;
			return data;
		}
		var detailsCount = numberify(blockedByCount) + numberify(blockingCount) + numberify(task.attachmentCount);
		if (task.due_date) detailsCount += 1;
		if (task.description) detailsCount += 1;
		if (!this.props.disableDescendantCount) detailsCount += this.getDescendantCount();
		
		var underlineWidth, underline = null;
		if (this.getDescendantCount() > 0) {
			if (task.completed === true) underlineWidth = "100%";
			else if (this.getDescendantCount() === 0) underlineWidth = "0%"; 
			else underlineWidth = this.getCompletedDescendantCount()/this.getDescendantCount()*100+"%";
			underline = <div>
				<div className="task-underline-incomplete"></div>
				{/* <div className="task-underline-changing" style={{ width: underlineWidth }}></div> */}
				<div className="task-underline-complete" style={{ width: underlineWidth }}></div>
			</div>
		}
		
		return (
			<ErrorBoundary>
				<div className="task-card-front" ref={this.props.innerRef}>
					<Checkbox checked={task.completed} handleChange={this.handleCheckbox} />
					<a className={classNames('task-link', { "deemphasize": blockedByCount > 0 })} href={url}>
						{ task.name }
						{ underline }
					</a>
					<div className="details" style={{ height: detailsCount > 0 ? 25 : 0 }}>
						{ blockedByCount ? 
							<div title={"Blocked by " + blockedByCount}><Icon.PauseCircle size="17" /> {blockedByCount} </div> : null
						}
						{ blockingCount ? 
							<div title={"Blocking " + blockingCount}><Icon.AlertCircle size="16" /> {blockingCount}</div> : null
						}
						{ task.due_date ?
							<div title={"Due " + task.due_date} className={classNames({ "due-today": isToday && !task.completed, "overdue": isPast && !task.completed })}><Icon.Calendar size="16" /> {formattedDate}</div> : ""
						}
						{ task.description ?
							<div title={task.description}><Icon.AlignLeft size="16" /></div> : ""
						}
						{ task.attachment_count ?
							<div title={attachmentTitle}><Icon.Paperclip size="16" /> {task.attachment_count}</div> : ""
						}
						{ !this.props.disableDescendantCount && this.getDescendantCount() > 0 ? 
							<div className="descendants"><Icon.CheckSquare size="16" /> {this.getCompletedDescendantCount()}/{this.getDescendantCount()}</div> : ""
						}
					</div>
				</div>
			</ErrorBoundary>
		)
	}
}
