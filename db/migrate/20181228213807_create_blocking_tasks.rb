class CreateBlockingTasks < ActiveRecord::Migration[5.2]
  def change
    create_table :blocking_tasks do |t|
      t.integer :blocker_id
      t.integer :blocked_id

      t.timestamps
    end
  end
end
