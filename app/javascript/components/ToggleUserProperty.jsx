import PropTypes from 'prop-types';
import React from 'react';
import * as Icon from 'react-feather';
import network from './network';

export default class ToggleUserProperty extends React.Component {
	static propTypes = {
		property: PropTypes.string.isRequired, // example: 'completed_tasks_visible'
		label: PropTypes.string.isRequired,
		initialState: PropTypes.bool.isRequired,
		userId: PropTypes.number.isRequired,
		networkPath: PropTypes.string.isRequired, // API endpoint to hit. Example: '/change_completed_tasks_visible.json'
		eventName: PropTypes.string, // Event to broadcast on toggle. Example: 'toggleShowCompleted'
		altKey: PropTypes.string // example: "c" for alt-C
	};
	constructor(props) {
		super(props);
		this.state = { enabled: this.props.initialState }
		this.handleChange = this.handleChange.bind(this);
	}
	handleChange = () => {
		const newState = !this.state.enabled;
		this.setState({ enabled: newState });
		network.patch(this.props.networkPath, { [this.props.property]: newState });
		if (this.props.eventName) {
			const event = new CustomEvent(this.props.eventName, { detail: newState });
			document.dispatchEvent(event);
		}
	}
	keyboardShortcut = event => {
		if (event.altKey && event.key === this.props.altKey) {
			this.handleChange();
		}
	}
	componentDidMount() {
		document.addEventListener("keydown", this.keyboardShortcut);
	}
	render() {
		const keyboardShortcut = this.props.altKey ? "(Alt-" + this.props.altKey.toUpperCase() + ")" : null;
		return <button className="toggle-user-property-button" onClick={this.handleChange}>
			{ this.state.enabled === true && <Icon.ToggleRight size="16" className="feather switch-on"  /> }
			{ this.state.enabled === false && <Icon.ToggleLeft size="16" className="feather switch-off" /> }
			{ this.props.label } <small>{keyboardShortcut}</small>
		</button>
	}
}
