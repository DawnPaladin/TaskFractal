import React from 'react';
import PropTypes from 'prop-types';

import FrontSideTask from './FrontSideTask';

export default class NextUpCard extends React.Component {
	static propTypes = {
		task: PropTypes.object,
	}
	constructor(props) {
		super(props);
	}
	formatReasons = () => {
		var array = this.props.task && this.props.task.reasons ? this.props.task.reasons : [];
		if (array.length === 0) return "";
		var string = array.join('; ');
		var capitalizedString = string[0].toUpperCase() + string.slice(1);
		return capitalizedString;
	}
	render() {
		// The key passed to FrontSideTask resets the FrontSideTask state when the task is changed. Otherwise FrontSideTask caches its state. See https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html#recommendation-fully-uncontrolled-component-with-a-key
		var reasons = this.formatReasons();
		return <div className="next-up-card">
			<FrontSideTask task={this.props.task} key={this.props.task.id} />
			<div className="reasons">{ reasons }</div>
		</div>
	}
}
