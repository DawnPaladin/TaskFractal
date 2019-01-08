// TODO: Add Save button to Notes field

import PropTypes from 'prop-types';
import React from 'react';
import ReactOnRails from 'react-on-rails';
import * as Icon from 'react-feather';

class Checkbox extends React.Component {
  render() {
    return <input type="checkbox" onChange={this.props.handleChange} defaultChecked={this.props.checked} />
  }
}

class FrontSideTask extends React.Component {
  constructor(props) {
    super(props);
    this.name = this.props.task.name; // for ease of debugging
    this.state = {
      task: this.props.task
    }
    this.send = this.props.send.bind(this);
    this.handleCheckbox = this.handleCheckbox.bind(this);
  }
  handleCheckbox(event) {
    this.props.handleCheckboxChange(event, this);
  }
  render() {
    return (
      <div className="frontSideTask">
        <label className="checkbox-label">
          <Checkbox checked={this.state.task.completed} handleChange={this.handleCheckbox} /><span> </span>
          { this.state.task.name }
        </label>
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
      blocked_by: this.props.blocked_by,
      blocking: this.props.blocking
    };
    
    this.handleNotesChange = this.handleNotesChange.bind(this);
    this.checkboxChange = this.checkboxChange.bind(this);
    this.changeCompletedDescendants = this.changeCompletedDescendants.bind(this);
  }
  
  updateName = (name) => {
    this.setState({ name });
  };
  
  handleNotesChange = (event) => {
    this.setState({ notes: event.target.value });
  }
  changeCompletedDescendants(amount) {
    let new_cd = this.state.task.completed_descendants + amount;
    this.setState(
      (prevState, props) => ({
        task: {
          ...prevState.task,
          completed_descendants: new_cd
        }
      })
    );
  }
  checkboxChange(event, component) {
    if (!component) component = this;
    const completed = event.target.checked;
    completed ? this.changeCompletedDescendants(1) : this.changeCompletedDescendants(-1);
    component.setState(
      (prevState, props) => ({
        task: {
          ...prevState.task, // https://stackoverflow.com/a/41391598/1805453
          completed: completed
        }
      }),
      () => { component.send(component.state.task); }
    );
  }
  
  refresh = () => {
    let id = this.state.task.id;
  
    let headers = ReactOnRails.authenticityHeaders();
    headers["Content-Type"] = "application/json";
    
    fetch(`/tasks/${id}.json`, {
      method: "GET",
      headers: headers
    })
    .then(response => response.json())
    .then(json => this.setState({ task: json }));
    
  }
  
  send(task) {
    let body = JSON.stringify({task});
    let id = task.id;
    
    let headers = ReactOnRails.authenticityHeaders();
    headers["Content-Type"] = "application/json";
    
    fetch(`/tasks/${id}.json`, {
      method: "PUT",
      body: body,
      headers: headers
    });
  }
  
  render() {
    {/* TODO: Consistent sorting (probably done on backend) */}
    let children = this.state.children.map(child => 
      <FrontSideTask task={child} key={child.id} send={this.send} handleCheckboxChange={this.checkboxChange} />
    );
    let blocked_by = this.state.blocked_by.map(blocked_by =>
      <FrontSideTask task={blocked_by} key={blocked_by.id} send={this.send} handleCheckboxChange={this.checkboxChange} />
    );
    let blocking = this.state.blocking.map(blocking =>
      <FrontSideTask task={blocking} key={blocking.id} send={this.send} handleCheckboxChange={this.checkboxChange} />
    );
    
    let cells = [];
    const completedDescendants = this.state.task.completed_descendants;
    const totalDescendants = this.state.task.descendants;
    const coverPercentage = (1-(completedDescendants/totalDescendants))*100 + "%";
    const coverCompletionBar = <div style={{width: coverPercentage}} className="completion-bar-cover"></div>
    for (var i = 0; i < totalDescendants; i++) {
      cells.push(<td key={i}></td>);
    }
    let completionBar = (
      <div className="completion-bar">
        <table>
          <tbody>
            <tr>
              {cells}
            </tr>
          </tbody>
        </table>
        {coverCompletionBar}
      </div>
    )
    
    return (
      <div className="task-card-back">
        <h1>
          <label>
            <Checkbox handleChange={this.checkboxChange} checked={this.state.task.completed} />
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
              {blocked_by}
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
