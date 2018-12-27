import PropTypes from 'prop-types';
import React from 'react';
import ReactOnRails from 'react-on-rails';
import * as Icon from 'react-feather';

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
    this.state = { 
      name: this.props.name,
      task: this.props.task,
      notes: ""
    };
    
    this.handleNotesChange = this.handleNotesChange.bind(this);
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
  
  handleNotesChange = (event) => {
    this.setState({ notes: event.target.value });
  }

  render() {
    console.log(this.state.task);
    const checkbox = this.state.task.completed ? <input type="checkbox" defaultChecked /> : <input type="checkbox" />;
    const FrontSideTask = props => (<label>{ checkbox } { props.name }</label>);
    return (
      <div>
        <h1>
          <label>
            { checkbox } { this.state.task.name }
          </label>
        </h1>
        
        <div className="field">
          <Icon.Calendar size="16" />
          { this.state.task.due_date ? " Due: " + this.state.task.due_date : <em> Add due date</em> }
        </div>
        
        <div className="row">
          <div>
            <div className="smallcaps"><Icon.PauseCircle size="16" /> blocked by</div>
            <div className="field">
              <FrontSideTask name="Get boxes" />
            </div>
          </div>
          <div>
            <div className="smallcaps"><Icon.AlertCircle size="16" /> blocking</div>
            <div className="field">
              <FrontSideTask name="Put boxes in moving van" />
            </div>
          </div>
        </div>
        
        <Icon.AlignLeft size="16" />
        <span className="smallcaps">notes</span>
        <div className="field">
          <textarea value={this.state.notes} onChange={this.handleNotesChange} />
        </div>
        
        <div className="field">
          <Icon.Paperclip size="16" />
          <i className="deemphasize">Attach file</i>
        </div>
        
        <div className="smallcaps">chunks</div>
        <FrontSideTask name="Pack kitchen" />
        Add chunk

      </div>
    );
  }
}
