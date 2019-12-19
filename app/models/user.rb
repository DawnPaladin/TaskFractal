class User < ApplicationRecord
	# Include default devise modules. Others available are:
	# :confirmable, :lockable, :timeoutable, :trackable, and :omniauthable
	devise :database_authenticatable, :registerable, :rememberable, :validatable, :recoverable
	
	has_many :tasks
	
	def attachments_size
		tasks_with_attachments = self.tasks.joins(:attachments_attachments).includes(attachments_attachments: [:blob])
		tasks_with_attachments.sum do |task|
			task.attachments.sum do |attachment|
				attachment.blob.byte_size
			end
		end
	end
end
