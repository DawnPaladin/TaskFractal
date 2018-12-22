import PropTypes from 'prop-types';
import React from 'react';
import ReactOnRails from 'react-on-rails';

export default class Chunky extends React.Component {
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
  
  sendTask = () => {
    let body = JSON.stringify({task: this.state.task});

    let headers = ReactOnRails.authenticityHeaders();
    headers["Content-Type"] = "application/json";

    fetch('/tasks/1.json', {
      method: "PUT",
      body: body,
      headers: headers
    });
  }
  
  completeTask = () => {
    this.state.task.completed = true;
    this.sendTask();
  }

  render() {
    console.log(this.state.task);
    const checkbox = this.state.task.completed ? <input type="checkbox" checked /> : <input type="checkbox" />;
    return (
      <div>
        <h1>
          <label>
            { checkbox } { this.state.task.name }
          </label>
        </h1>
        <div className="field">
          
          { this.state.task.due_date ? "Due: " + this.state.task.due_date : <em>Add due date</em> }
        </div>
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
        <button onClick={(e) => this.completeTask()}>Complete</button>
      </div>
    );
  }
}
