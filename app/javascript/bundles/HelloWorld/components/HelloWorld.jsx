import PropTypes from 'prop-types';
import React from 'react';
import ReactOnRails from 'react-on-rails';

export default class HelloWorld extends React.Component {
  static propTypes = {
    name: PropTypes.string.isRequired, // this is passed from the Rails view
  };

  /**
   * @param props - Comes from your rails view.
   */
  constructor(props) {
    super(props);

    // How to set initial state in ES6 class syntax
    // https://reactjs.org/docs/state-and-lifecycle.html#adding-local-state-to-a-class
    this.state = { name: this.props.name, task: this.props.task };
  }

  updateName = (name) => {
    this.setState({ name });
  };
  
  complete = () => {
    this.props.task.completed = true;

    let body = JSON.stringify({task: this.props.task});

    let headers = ReactOnRails.authenticityHeaders();
    headers["Content-Type"] = "application/json";

    fetch('/tasks/1.json', {
      method: "PUT",
      body: body,
      headers: headers
    });
  }

  render() {
    return (
      <div>
        <h3>
          Hello, {this.state.name}!
        </h3>
        <hr />
        <form >
          <label htmlFor="name">
            Say hello to:
          </label>
          <input
            id="name"
            type="text"
            value={this.state.name}
            onChange={(e) => this.updateName(e.target.value)}
          />
        </form>
        <p>Task name: {this.state.task.name}</p>
        <button onClick={(e) => this.complete()}>Complete</button>
      </div>
    );
  }
}
