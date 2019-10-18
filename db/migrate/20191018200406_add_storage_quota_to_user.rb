class AddStorageQuotaToUser < ActiveRecord::Migration[5.2]
  def change
    add_column :users, :storage_quota, :integer, default: 100000000
  end
end
