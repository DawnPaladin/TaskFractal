json.extract! task, :id, :name, :description, :completed, :due_date, :completed_date, :created_at, :updated_at, :attachments, :descendants, :completed_descendants
# json.count_descendants task.descendants.count
# json.count_completed_descendants task.descendants.where(completed: true).count
json.attachments task.attachments do |attachment|
	json.name attachment.name
	json.url url_for(attachment)
	json.id attachment.id
end
json.url task_url(task, format: :json)
