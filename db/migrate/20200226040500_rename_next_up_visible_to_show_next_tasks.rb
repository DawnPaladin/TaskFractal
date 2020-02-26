class RenameNextUpVisibleToShowNextTasks < ActiveRecord::Migration[6.0]
  def change
    rename_column :users, :next_up_visible, :show_next_tasks
  end
end
