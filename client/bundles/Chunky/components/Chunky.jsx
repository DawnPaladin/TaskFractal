import PropTypes from 'prop-types';
import React from 'react';
import ReactOnRails from 'react-on-rails';
import * as Icon from 'react-feather';

const Checkbox = props => (props.completed ? <input type="checkbox" defaultChecked /> : <input type="checkbox" />);

class FrontSideTask extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    console.log(this.props.task);
    return (
      <div className="frontSideTask">
        <label className="checkbox-label"> <Checkbox completed={this.props.task.completed} /> { this.props.task.name }</label>
        <div className="details">
          { this.props.task.dueDate ?
            <div><Icon.Calendar size="16" /> {this.props.task.dueDate}</div> : ""
          }
          { this.props.task.description ?
            <div><Icon.AlignLeft size="16" /></div> : ""
          }
          { this.props.task.attachments ?
            <div><Icon.Paperclip size="16" /> {this.props.task.attachments}</div> : ""
          }
          { parseInt(this.props.task.descendants) > 0 ? 
            <div><Icon.CheckSquare size="16" /> {this.props.task.completed_descendants}/{this.props.task.descendants}</div> : ""
          }
        </div>
      </div>
    )
  }
}

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
      notes: "",
      children: this.props.children,
      blockedBy: this.props.blocked_by,
      blocking: this.props.blocking
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
    let children = this.state.children.map(child => 
      <FrontSideTask task={child} key={child.id} />
    );
    let blockedBy = this.state.blockedBy.map(blockedBy =>
      <FrontSideTask task={blockedBy} key={blockedBy.id} />
    );
    let blocking = this.state.blocking.map(blocking =>
      <FrontSideTask task={blocking} key={blocking.id} />
    );
    return (
      <div className="task-card-back">
        <h1>
          <label>
            <Checkbox completed={this.state.task.completed} />
            { this.state.task.name }
          </label>
        </h1>
        
        <div className="field">
          <Icon.Calendar size="16" />
          { this.state.task.due_date ? " Due: " + this.state.task.due_date : <em> Add due date</em> }
        </div>
        
        <div className="row">
          <div>
            <Icon.PauseCircle size="16" />
            <span className="field-name"> waiting on</span>
            <div className="field">
              {blockedBy}
            </div>
          </div>
          <div>
            <Icon.AlertCircle size="16" />
            <span className="field-name"> blocking</span>
            <div className="field">
              {blocking}
            </div>
          </div>
        </div>
        
        <Icon.AlignLeft size="16" />
        <span className="field-name"> notes</span>
        <div className="field">
          <textarea value={this.state.notes} onChange={this.handleNotesChange} />
        </div>
        
        <div className="field">
          <Icon.Paperclip size="16" />
          <i className="deemphasize">Attach file</i>
        </div>
        
        <div className="field-name">subtasks</div>
        <div className="chunks">
          {children}
          <div className="add-chunk">Add chunk</div>
        </div>

      </div>
    );
  }
}
