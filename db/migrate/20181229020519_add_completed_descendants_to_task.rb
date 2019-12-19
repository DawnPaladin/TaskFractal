class AddCompletedDescendantsToTask < ActiveRecord::Migration[5.2]
	def change
		add_column :tasks, :completed_descendants, :integer, default: 0
	end
end
