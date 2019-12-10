import React from 'react';
import PropTypes from 'prop-types';
import WithSeparator from 'react-with-separator';

import FrontSideTask from './FrontSideTask';

export default class NextUpCard extends React.Component {
	static propTypes = {
		task: PropTypes.object.isRequired,
		checkboxChange: PropTypes.func.isRequired,
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
		let ancestors = this.props.task.ancestors.map(ancestor => <a href={"/tasks/" + ancestor.id} className="task-link" key={ancestor.id} >{ancestor.name}</a>);
		var reasons = this.formatReasons();
		return <div className="next-up-card">
			<div className="ancestors"><WithSeparator separator=" / ">{ancestors}</WithSeparator></div>
			<FrontSideTask task={this.props.task} checkboxChange={this.props.checkboxChange} />
			<div className="reasons">{ reasons }</div>
		</div>
	}
}
