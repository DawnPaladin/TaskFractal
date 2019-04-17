import React from 'react';
import PropTypes from 'prop-types';
import ReactOnRails from 'react-on-rails';
import Autosuggest from 'react-autosuggest';

// When suggestion is clicked, Autosuggest needs to populate the input
// based on the clicked suggestion. Teach Autosuggest how to calculate the
// input value for every given suggestion.
const getSuggestionValue = suggestion => suggestion.name;

const renderSuggestion = suggestion => (
	<div>
		{suggestion.name}
	</div>
);

export default class TaskPicker extends React.Component {
	static propTypes = {
		allTasks: PropTypes.array.isRequired,
		refreshAllTasks: PropTypes.func.isRequired,
	}
	constructor(props) {
		super(props);
		this.state = {
			value: '',
			suggestions: [],
		};
	}
	componentDidMount() {
		this.props.refreshAllTasks();
	}
	getSuggestions = (value, list) => {
		const inputValue = value.trim().toLowerCase();
		const inputLength = inputValue.length;
	
		return inputLength === 0 ? [] : this.props.allTasks.filter(task =>
			task.name.toLowerCase().slice(0, inputLength) === inputValue
		);
	};
	onChange = (event, { newValue }) => {
		this.setState({
			value: newValue
		});
	}
	onSuggestionsFetchRequested = ({ value }) => {
		this.setState({
			suggestions: this.getSuggestions(value),
		});
	}
	onSuggestionsClearRequested = () => {
		this.setState({
			suggestions: []
		});
	};
	render() {
		const { value, suggestions } = this.state;
		const inputProps = {
			placeholder: "Add a task...",
			value,
			onChange: this.onChange,
		}
		return <div>
			<Autosuggest
				suggestions={suggestions}
				onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
				onSuggestionsClearRequested={this.onSuggestionsClearRequested}
				getSuggestionValue={getSuggestionValue}
				renderSuggestion={renderSuggestion}
				inputProps={inputProps}
			/>
		</div>
	}
}
