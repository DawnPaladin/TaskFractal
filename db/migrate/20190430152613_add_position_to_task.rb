class AddPositionToTask < ActiveRecord::Migration[5.2]
  def change
    add_column :tasks, :position, :integer
    Task.all.each do |task|
      task.children.order(:updated_at).each.with_index(1) do |subtask, index|
        subtask.update_column :position, index
      end
    end
    Task.where(position: nil).order(:updated_at).each.with_index(1) do |task, index| # top-level tasks
      task.update_column :position, index
    end
  end
end
