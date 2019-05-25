import React from 'react';
import NextUpCard from './NextUpCard';

export default class NextUp extends React.Component {
	constructor() {
		super();
		this.state = {
			tasks: [],
			leftCard: null,
			rightCard: null,
		}
		fetch("/next_up")
			.then(response => {
				if (response.ok) {
					return response.json();
				} else {
					throw new Error("Couldn't fetch Next Up tasks.");
				}
			}).then(json => {
				console.log(json);
				var tasks = json.map(taggedTask => {
					var task = taggedTask.task;
					task.score = taggedTask.score;
					task.reasons = taggedTask.reasons;
					return task;
				})
				this.setState({
					tasks,
					leftCard: tasks[0],
					rightCard: tasks[tasks.length-1]
				});
			})
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
