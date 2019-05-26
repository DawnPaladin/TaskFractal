import PropTypes from 'prop-types';
import React from 'react';
import * as Icon from 'react-feather';
import network from './network';

export default class Attachment extends React.Component {
	static propTypes = {
		attachment: PropTypes.object.isRequired,
		afterDelete: PropTypes.func.isRequired
	};
	constructor(props) {
		super(props);
		let fileName = this.props.attachment.name.split('.');
		let fileExtension = fileName.pop();
		const imageExtensions = ['png', 'jpg', 'jpeg', 'gif', 'apng', 'svg', 'bmp', 'ico'];
		const isImage = imageExtensions.indexOf(fileExtension) > -1;
		this.state = {
			renaming: false,
			isImage: isImage,
			fileName: fileName[0],
			fileExtension: fileExtension,
		}
		this.deleteAttachment = this.deleteAttachment.bind(this);
		this.toggleRenaming = this.toggleRenaming.bind(this);
		this.handleNameChange = this.handleNameChange.bind(this);
		this.submitRename = this.submitRename.bind(this);
	}
	
	deleteAttachment() {
		const attachmentId = this.props.attachment.id;
		const name = this.state.fileName;

		if (confirm(`Delete "${name}"?`)) {
			network.delete(`/attachments/${attachmentId}`, { attachment: this.props.attachment })
			.then(json => {
				if (json.error) {
					toastr.error(json.error);
				} else {
					toastr.info(`"${name}" deleted.`);
				}
			})
			.then(this.props.afterDelete);
		}
	}
	
	toggleRenaming() {
		this.setState({ renaming: !this.state.renaming });
	}
	handleNameChange(event) {
		this.setState({ fileName: event.target.value });
	}
	submitRename(event) {
		event.preventDefault();
		const attachmentId = this.props.attachment.id;
		const name = this.state.fileName;
		const headers = ReactOnRails.authenticityHeaders();
		headers["Content-Type"] = "application/json";
		
		fetch(`/attachments/${attachmentId}/rename/${name}`, {headers})
		.then(response => response.json())
		.then(json => {
			if (json.error) {
				toastr.error(json.error);
			} else {
				var name = json.name.split('.');
				let [withoutExtension, fileExtension] = name;
				this.setState({
					fileName: withoutExtension,
					fileExtension: fileExtension,
					renaming: false,
				});
			}
		})
	}
	
	render() {
		let previewImage = <img src={this.props.attachment.url} />
		let icon = <Icon.File size="16" />
		return (
			<div className="attachment">
				<a href={this.props.attachment.url} target="_blank" rel="noopener noreferrer">
					<div className="file-graphic">
						{ this.state.isImage ? previewImage : icon }
					</div>
				</a>
				<div className="right-side">
					<form className="file-name" onSubmit={this.submitRename}>
						{ this.state.renaming && <input value={this.state.fileName} onChange={this.handleNameChange} /> }
						{ this.state.renaming && '.' + this.state.fileExtension}
						{!this.state.renaming && <a href={this.props.attachment.url} target="_blank" rel="noopener noreferrer">{this.state.fileName}.{this.state.fileExtension}</a> }
					</form>
					<div className="attachment-action-links">
						<div><button onClick={this.toggleRenaming}><Icon.Edit size="16"/>Rename</button></div>
						<div><button onClick={this.deleteAttachment}><Icon.Trash2 size="16"/>Delete</button></div>
					</div>
				</div>
			</div>
		)
	}
}
