import PropTypes from 'prop-types';
import React from 'react';
import MtlCheckbox from '@material/react-checkbox';

export default class Checkbox extends React.Component {
	static propTypes = {
		handleChange: PropTypes.func.isRequired,
		checked: PropTypes.bool.isRequired,
	};
	render() {
		// return <input type="checkbox" onChange={this.props.handleChange} checked={!!this.props.checked} />
		return <MtlCheckbox
				checked={this.props.checked}
				onChange={this.props.handleChange}
			/>
		// </React.Fragment>
	}
}
