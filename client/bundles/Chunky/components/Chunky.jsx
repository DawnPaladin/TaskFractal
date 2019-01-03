// TODO: Add Save button to Notes field
// FIXME: handleCheckboxChange() needs to update completed_descendants

import PropTypes from 'prop-types';
import React from 'react';
import ReactOnRails from 'react-on-rails';
import * as Icon from 'react-feather';
const interpolate = require('color-interpolate');
const palette = interpolate(['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet']);

function send() {
  let body = JSON.stringify({task: this});
  let id = this.id;
  
  let headers = ReactOnRails.authenticityHeaders();
  headers["Content-Type"] = "application/json";
  
  fetch(`/tasks/${id}.json`, {
    method: "PUT",
    body: body,
    headers: headers
  });
}

class Checkbox extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      task: props.task
    }
    this.handleCheckboxChange = this.handleCheckboxChange.bind(this);
  }
  handleCheckboxChange(event) {
    this.state.task.completed = event.target.checked;
    this.state.task.send();
  }
  render() {
    let box;
    if (this.state.task.completed) {
      box = <input type="checkbox" onChange={this.handleCheckboxChange} defaultChecked />
    } else {
      box = <input type="checkbox" onChange={this.handleCheckboxChange} />
    }
    return box;
  }
}

class FrontSideTask extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      task: this.props.task
    }
    this.state.task.send = send;
  }
  render() {
    return (
      <div className="frontSideTask">
        <label className="checkbox-label"> <Checkbox task={this.state.task} /> { this.state.task.name }</label>
        <div className="details">
          { this.state.task.dueDate ?
            <div><Icon.Calendar size="16" /> {this.state.task.dueDate}</div> : ""
          }
          { this.state.task.description ?
            <div><Icon.AlignLeft size="16" /></div> : ""
          }
          { this.state.task.attachments ?
            <div><Icon.Paperclip size="16" /> {this.state.task.attachments}</div> : ""
          }
          { parseInt(this.state.task.descendants) > 0 ? 
            <div><Icon.CheckSquare size="16" /> {this.state.task.completed_descendants}/{this.props.task.descendants}</div> : ""
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
    this.state.task.send = send;
  }
  
  updateName = (name) => {
    this.setState({ name });
  };  
  
  handleNotesChange = (event) => {
    this.setState({ notes: event.target.value });
  }
  
  render() {
    {/* TODO: Consistent sorting (probably done on backend) */}
    let children = this.state.children.map(child => 
      <FrontSideTask task={child} key={child.id} />
    );
    let blockedBy = this.state.blockedBy.map(blockedBy =>
      <FrontSideTask task={blockedBy} key={blockedBy.id} />
    );
    let blocking = this.state.blocking.map(blocking =>
      <FrontSideTask task={blocking} key={blocking.id} />
    );
    
    let cells = [], barColor;
    const completedDescendants = this.state.task.completed_descendants;
    const totalDescendants = this.state.task.descendants;
    for (var i = 0; i < completedDescendants; i++) {
      barColor = palette(i/totalDescendants);
      cells.push(<td key={i} style={{background: barColor}}></td>);
    }
    for (var i = completedDescendants; i < totalDescendants; i++) {
      cells.push(<td key={i}></td>);
    }
    let completionBar = (
      <table className="completion-bar">
        <tbody>
          <tr>
            {cells}
          </tr>
        </tbody>
      </table>
    )
    
    return (
      <div className="task-card-back">
        <h1>
          <label>
            <Checkbox task={this.state.task} />
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
        
        {completionBar}
        
      </div>
    );
  }
}
