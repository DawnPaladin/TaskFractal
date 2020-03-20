import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import * as Icon from 'react-feather';
import network from './network';

export default function ToggleUserProperty(props) {
	const [enabled, setEnabled] = useState(props.initialState);
	
	const handleChange = () => {
		const newState = !enabled;
		setEnabled(newState);
		network.patch(props.networkPath, { [props.property]: newState });
		if (props.eventName) {
			const event = new CustomEvent(props.eventName, { detail: newState });
			document.dispatchEvent(event);
		}
	}
	const checkKeyboardShortcut = event => {
		if (event.altKey && event.key === props.altKey) {
			handleChange();
		}
	}
	useEffect(() => {
		document.addEventListener("keydown", checkKeyboardShortcut);
	})

	const keyboardShortcut = props.altKey ? "(Alt-" + props.altKey.toUpperCase() + ")" : null;
	return <button className="toggle-user-property-button" onClick={handleChange}>
		{ enabled === true && <Icon.ToggleRight size="16" className="feather switch-on"  /> }
		{ enabled === false && <Icon.ToggleLeft size="16" className="feather switch-off" /> }
		{ props.label } <small>{keyboardShortcut}</small>
	</button>
}

ToggleUserProperty.propTypes = {
	property: PropTypes.string.isRequired, // example: 'completed_tasks_visible'
	label: PropTypes.string.isRequired,
	initialState: PropTypes.bool.isRequired,
	userId: PropTypes.number.isRequired,
	networkPath: PropTypes.string.isRequired, // API endpoint to hit. Example: '/change_completed_tasks_visible.json'
	eventName: PropTypes.string, // Event to broadcast on toggle. Example: 'toggleShowCompleted'
	altKey: PropTypes.string // example: "c" for alt-C
}
