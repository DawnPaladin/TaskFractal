class CreateTasks < ActiveRecord::Migration[5.2]
	def change
		create_table :tasks do |t|
			t.string :name
			t.string :description, default: ""
			t.boolean :completed, default: false
			t.date :due_date
			t.date :completed_date

			t.timestamps
		end
	end
end
