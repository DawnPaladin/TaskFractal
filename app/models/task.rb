class Task < ApplicationRecord
	validates :name, :presence => true
	
	has_many :children, class_name: "Task", foreign_key: "parent_id"
	belongs_to :parent, class_name: "Task", optional: true
	
	has_many :blocked_by, class_name: "Task", foreign_key: "blocking_id"
	has_many :blocking, class_name: "Task", foreign_key: "blocked_by_id"
end
