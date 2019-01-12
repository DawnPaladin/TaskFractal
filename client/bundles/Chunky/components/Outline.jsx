import PropTypes from 'prop-types';
import React from 'react';
import ReactOnRails from 'react-on-rails';
import * as Icon from 'react-feather';

import FrontSideTask from './FrontSideTask';

export default class Outline extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			tasks: this.props.tasks,
			topLevelTasks: this.props.top_level_tasks,
		}
		this.getDescendants = this.getDescendants.bind(this);
	}
	getDescendants(task) {
		
	}
	render() {
		let topLevelTasks = this.state.topLevelTasks.map(task =>
			<FrontSideTask task={task} key={task.id} />
		)
		return (
			topLevelTasks
		)
	}
}
