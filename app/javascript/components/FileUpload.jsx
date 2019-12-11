import PropTypes from 'prop-types';
import React from 'react';
import Attachment from './Attachment';
import Dropzone from 'react-dropzone';
import { DirectUpload } from "@rails/activestorage";
import classNames from 'classnames';
import * as Icon from 'react-feather';
import network from './network';

export default class FileUpload extends React.Component {
	static propTypes = {
		task: PropTypes.object.isRequired,
		attachments: PropTypes.array,
		refreshAttachments: PropTypes.func,
	}
	constructor(props) {
		super(props);
		this.uploadFile = this.uploadFile.bind(this);
		this.onDrop = this.onDrop.bind(this);
		this.attachToModel = this.attachToModel.bind(this);
	}
	
	onDrop(acceptedFiles, rejectedFiles) {
		Array.from(acceptedFiles).forEach(file => this.uploadFile(file));
	}
	
	uploadFile(file) {
		const url = '/rails/active_storage/direct_uploads';
		const upload = new DirectUpload(file, url, this);
		
		upload.create((error, blob) => {
			if (error) {
				console.warn(error);
			} else {
				this.attachToModel(blob, this.props.refreshAttachments ? this.props.refreshAttachments : null);
			}
		});
	}
	
	attachToModel(blob, callback) {
		const id = this.props.task.id;
		
		network.put(`/tasks/${id}.json`, { task: { attachments: [blob.signed_id] }} )
		.then(callback);
	}
	
	render() {
		let attachments = this.props.attachments.map(attachment =>
			<Attachment attachment={attachment} key={attachment.id} afterDelete={this.props.refreshAttachments} />
		);
		return (
			<Dropzone onDrop={this.onDrop} noClick={true} ref={ref => this.dropzoneRef = ref}>
				{({ getRootProps, getInputProps, isDragActive}) => {
					return (
						<div
							{...getRootProps()}
							className={classNames('dropzone', {'dropzone--isActive': isDragActive})}
						>
							<input {...getInputProps()} />
							{this.props.children}
							<div className="field">
								<Icon.Paperclip size="16" />
								<span className="field-name"> attachments</span>
								<div className="box">
									<div className="attachments">{attachments}</div>
									<div className="attach-file">
										<button onClick={this.dropzoneRef ? this.dropzoneRef.open : null}>Attach files</button> <i className="deemphasize">or drag them here</i>
									</div>
								</div>
							</div>
						</div>
					)
				}}
			</Dropzone>
		)
	}
}
