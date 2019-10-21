class AddIsExpandedToTask < ActiveRecord::Migration[5.2]
  def change
    add_column :tasks, :is_expanded, :boolean, default: true
  end
end
