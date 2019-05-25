import React from 'react';
import NextUpCard from './NextUpCard';
import PropTypes from 'prop-types';

export default class NextUp extends React.Component {
	static propTypes = {
		tasks: PropTypes.array.isRequired,
	}
	constructor(props) {
		super(props);
		var tasks = props.tasks.map(taggedTask => {
			var task = taggedTask.task;
			task.score = taggedTask.score;
			task.reasons = taggedTask.reasons;
			return task;
		})
		this.state = {
			tasks,
			leftCard: tasks[0],
			rightCard: tasks[tasks.length-1]
		};
	}
	render() {
		return <div className="next-up">
			<div className="next-up-label">Next Up</div>
			<div className="next-up-cards">
				<div className="column">
					<div className="column-label">High Impact</div>
					<NextUpCard task={this.state.leftCard} />
				</div>
				<div className="or">or</div>
				<div className="column">
					<div className="column-label">Easy Win</div>
					<NextUpCard task={this.state.rightCard} />
				</div>
			</div>
		</div>
	}
}
