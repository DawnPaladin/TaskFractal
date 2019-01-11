json.extract! task, :id, :name, :description, :completed, :due_date, :completed_date, :created_at, :updated_at, :descendants, :completed_descendants, :attachments
json.attachments task.attachments do |attachment|
	json.filename attachment.filename
	json.url url_for(attachment)
	json.id attachment.id
end
json.url task_url(task, format: :json)
