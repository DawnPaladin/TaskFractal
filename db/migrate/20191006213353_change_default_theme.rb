class ChangeDefaultTheme < ActiveRecord::Migration[5.2]
  def change
    change_column_default :users, :theme, "jeans"
  end
end
