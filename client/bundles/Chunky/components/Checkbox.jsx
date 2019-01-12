import PropTypes from 'prop-types';
import React from 'react';
import ReactOnRails from 'react-on-rails';
import ActiveStorageProvider from 'react-activestorage-provider';
import * as Icon from 'react-feather';

export default class Checkbox extends React.Component {
	static propTypes = {
		handleChange: PropTypes.func.isRequired,
		checked: PropTypes.bool.isRequired,
	};
	render() {
		return <input type="checkbox" onChange={this.props.handleChange} defaultChecked={this.props.checked} />
	}
}
