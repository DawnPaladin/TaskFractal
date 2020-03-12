class RenameShowNextTasksToNextUpVisible < ActiveRecord::Migration[6.0]
  def change
    rename_column :users, :show_next_tasks, :next_up_visible
    rename_column :users, :show_completed_tasks, :completed_tasks_visible
  end
end
