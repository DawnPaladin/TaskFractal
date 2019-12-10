class AddShowCompletedTasksToUser < ActiveRecord::Migration[5.2]
  def change
    add_column :users, :show_completed_tasks, :boolean, default: true
  end
end
