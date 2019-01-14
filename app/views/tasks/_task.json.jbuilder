json.extract! task, :id, :name, :description, :completed, :due_date, :completed_date, :created_at, :updated_at, :attachments
json.descendants task.descendants.count
json.completed_descendants task.descendants.where(completed: true).count
json.attachments task.attachments do |attachment|
	json.filename attachment.filename
	json.url url_for(attachment)
	json.id attachment.id
end
json.url task_url(task, format: :json)
