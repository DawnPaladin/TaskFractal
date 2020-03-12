import PropTypes from 'prop-types';
import React from 'react';
import * as Icon from 'react-feather';
import network from './network';

export default class ToggleShowCompleted extends React.Component {
	static propTypes = {
		completedTasksVisible: PropTypes.bool.isRequired,
		userId: PropTypes.number.isRequired,
	};
	constructor(props) {
		super(props);
		this.state = { completedTasksVisible: this.props.completedTasksVisible }
		this.handleChange = this.handleChange.bind(this);
	}
	handleChange = () => {
		const newState = !this.state.completedTasksVisible;
		this.setState({ completedTasksVisible: newState });
		network.patch('/change_completed_tasks_visible.json', { completed_tasks_visible: newState });
		const event = new CustomEvent('toggleShowCompleted', { detail: { completedTasksVisible: newState }});
		document.dispatchEvent(event);
	}
	keyboardShortcut = event => {
		if (event.altKey && event.key === "c") {
			this.handleChange();
		}
	}
	componentDidMount() {
		document.addEventListener("keydown", this.keyboardShortcut);
	}
	render() {
		return <button className="toggle-show-completed-button" onClick={this.handleChange}>
			{ this.state.completedTasksVisible === true && <Icon.ToggleRight size="16" className="feather switch-on"  /> }
			{ this.state.completedTasksVisible === false && <Icon.ToggleLeft size="16" className="feather switch-off" /> }
			Show Completed <small>(Alt-C)</small>
		</button>
	}
}
