class AddParentIdToTasks < ActiveRecord::Migration[5.2]
  def change
    add_column :tasks, :parent_id, :integer
  end
end
