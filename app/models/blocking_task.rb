class BlockingTask < ApplicationRecord
	belongs_to :blocking, foreign_key: :blocked_id, class_name: "Task"
	belongs_to :blocker, foreign_key: :blocker_id, class_name: "Task"
	validates :blocking, :uniqueness => { scope: :blocker_id }
	validates :blocker, :uniqueness => { scope: :blocked_id }
end
