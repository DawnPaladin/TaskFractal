class Task < ApplicationRecord
	validates :name, :presence => true
	
	has_many :children, class_name: "Task", foreign_key: "parent_id"
	belongs_to :parent, class_name: "Task", optional: true
	
	# thanks to https://medium.com/@jbmilgrom/active-record-many-to-many-self-join-table-e0992c27c1e
	has_many :blocked_blocks, foreign_key: :blocker_id, class_name: "BlockingTask"
	has_many :blocked_by, through: :blocked_blocks, source: :blocking, dependent: :destroy
	
	has_many :blocker_blocks, foreign_key: :blocked_id, class_name: "BlockingTask"
	has_many :blocking, through: :blocker_blocks, source: :blocker, dependent: :destroy
	
	after_create :increment_descendants_in_parents
	before_destroy do
		self.decrement_completed_descendants_in_parents if self.completed
		self.decrement_descendants_in_parents
	end
	before_save :check_completed_state, if: :will_save_change_to_completed?
	
	def check_completed_state
		if self.completed == true
			self.increment_completed_descendants_in_parents
		else
			self.decrement_completed_descendants_in_parents
		end
	end

	def increment_descendants_in_parents
		if self.parent
			theParent = self.parent
			theParent.descendants += 1
			theParent.save!
			theParent.increment_descendants_in_parents
		end
	end
	def decrement_descendants_in_parents
		if self.parent
			theParent = self.parent
			theParent.descendants -= 1
			theParent.save!
			theParent.decrement_descendants_in_parents
		end
	end
	
	def increment_completed_descendants_in_parents
		if self.parent
			theParent = self.parent
			theParent.completed_descendants += 1
			theParent.save!
			theParent.increment_completed_descendants_in_parents
		end
	end
	def decrement_completed_descendants_in_parents
		if self.parent
			theParent = self.parent
			theParent.completed_descendants -= 1
			theParent.save!
			theParent.decrement_completed_descendants_in_parents
		end
	end
					
end
