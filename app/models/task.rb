class Task < ApplicationRecord
	validates :name, :presence => true
	
	belongs_to :user
	
	has_many :children, class_name: "Task", foreign_key: "parent_id"
	belongs_to :parent, class_name: "Task", optional: true
	has_ancestry
	acts_as_list scope: [:ancestry]
	
	# thanks to https://medium.com/@jbmilgrom/active-record-many-to-many-self-join-table-e0992c27c1e
	has_many :blocked_blocks, foreign_key: :blocker_id, class_name: "BlockingTask"
	has_many :blocked_by, through: :blocked_blocks, source: :blocking, dependent: :destroy
	
	has_many :blocker_blocks, foreign_key: :blocked_id, class_name: "BlockingTask"
	has_many :blocking, through: :blocker_blocks, source: :blocker, dependent: :destroy
	
	has_many_attached :attachments
	
	before_validation :inherit_user, on: :create
	
	def completed_descendants
		self.descendants.where(completed: true)
	end
	
	def attachment_count
		self.attachments.count
	end
	
	private
		def inherit_user
			if self.user == nil and self.parent
				self.user = self.parent.user
			end
		end
	
end
