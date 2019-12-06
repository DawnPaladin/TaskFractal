class TaskSerializer < ActiveModel::Serializer
  attributes :id, :name, :description, :completed, :due_date, :completed_date, :attachment_count
  
  has_many :attachments
  
end
