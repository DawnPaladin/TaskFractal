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
			<details>
				<summary>Next Up</summary>
				<div className="next-up-cards">
					<NextUpCard task={this.state.leftCard} />
					<div className="or">or</div>
					<NextUpCard task={this.state.rightCard} />
				</div>
			</details>
		</div>
	}
}
