json.extract! task, :id, :name, :description, :completed, :due_date, :completed_date, :created_at, :updated_at, :descendants, :completed_descendants
json.url task_url(task, format: :json)
