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
		}
		this.taskTree = this.taskTree.bind(this);
		// console.log(this.props.tasks);
	}
	taskTree(task) {
		var children = task.children.map(child => this.taskTree(child));
		return (<div key={task.id}>
			<FrontSideTask task={task} key={task.id} disableDescendantCount={true} />
			<div className="indent">{ children }</div>
		</div>)
	}
	render() {
		return this.state.tasks.map(task => this.taskTree(task));
	}
}
