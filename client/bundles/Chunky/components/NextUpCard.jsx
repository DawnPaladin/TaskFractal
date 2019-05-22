import React from 'react';
import PropTypes from 'prop-types';

import FrontSideTask from './FrontSideTask';

export default class NextUpCard extends React.Component {
	static propTypes = {
		task: PropTypes.object,
	}
	render() {
		var reasons = this.props.task && this.props.task.reasons ? this.props.task.reasons : null;
		return <div className="next-up-card">
			{ this.props.task ? <FrontSideTask task={this.props.task} /> : null }
			{/* FIXME: Give FrontSideTask a guard clause, causing it to render nothing if a task isn't passed? */}
			<div className="reasons">{ reasons }</div>
		</div>
	}
}
