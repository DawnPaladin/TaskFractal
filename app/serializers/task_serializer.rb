class TaskSerializer < ActiveModel::Serializer
  attributes :id, :name, :description, :completed, :due_date, :completed_date, :descendants, :attachment_count
  
  has_many :completed_descendants
  has_many :attachments
  
end
