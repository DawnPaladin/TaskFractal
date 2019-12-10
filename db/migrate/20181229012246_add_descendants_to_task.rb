class AddDescendantsToTask < ActiveRecord::Migration[5.2]
  def change
    add_column :tasks, :descendants, :integer, default: 0
  end
end
