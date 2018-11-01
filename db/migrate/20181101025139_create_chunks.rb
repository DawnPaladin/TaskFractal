class CreateChunks < ActiveRecord::Migration[5.0]
  def change
    create_table :chunks do |t|
      t.string :name
      t.boolean :completed, default: false

      t.timestamps
    end
  end
end
