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
    return (
      <div className="frontSideTask">
        <label className="checkbox-label"> <Checkbox completed={this.props.completed} /> { this.props.name }</label>
        <div className="details">
          { this.props.dueDate ?
            <div><Icon.Calendar size="16" /> {this.props.dueDate}</div> : ""
          }
          { this.props.desc ?
            <Icon.AlignLeft size="16" /> : ""
          }
          { this.props.attachments ?
            <div><Icon.Paperclip size="16" /> {this.props.attachments}</div> : ""
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
    return (
      <div className="task-card-back">
        <h1>
          <label>
            <Checkbox completed={this.state.task.completed} />
            {/* { this.state.task.name } */}
            Pack boxes
          </label>
        </h1>
        
        <div className="field">
          <Icon.Calendar size="16" />
          { this.state.task.due_date ? " Due: " + this.state.task.due_date : <em> Add due date</em> }
        </div>
        
        <div className="row">
          <div>
            <Icon.PauseCircle size="16" />
            <span className="field-name"> blocked by</span>
            <div className="field">
              <FrontSideTask name="Get boxes" />
            </div>
          </div>
          <div>
            <Icon.AlertCircle size="16" />
            <span className="field-name"> blocking</span>
            <div className="field">
              <FrontSideTask name="Put boxes in moving van" dueDate="May 15"/>
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
        
        <div className="field-name">chunks</div>
        <div className="chunks">
          <FrontSideTask name="Pack kitchen" desc="true" attachments="1" completedChunks="1" totalChunks="1" />
          <div className="add-chunk">Add chunk</div>
        </div>

      </div>
    );
  }
}
