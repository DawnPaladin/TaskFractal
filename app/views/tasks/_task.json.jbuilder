json.extract! task, :id, :name, :description, :completed, :due_date, :completed_date, :created_at, :updated_at
json.url task_url(task, format: :json)
