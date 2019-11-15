class AddNextUpVisibleToUser < ActiveRecord::Migration[5.2]
  def change
    add_column :users, :next_up_visible, :boolean, default: true
  end
end
