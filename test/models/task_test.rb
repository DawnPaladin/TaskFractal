require 'test_helper'

class TaskTest < ActiveSupport::TestCase
  test "create task" do
    user = FactoryBot.create(:user)
    task = Task.create(user: user, name: "Test task")
    assert task.valid?
  end
  
  test "create child task" do
    user = FactoryBot.create(:user)
    parent = Task.create(user: user, name: "Parent task")
    child = parent.children.create(name: "Child task")
    assert child.valid?
  end
  
  test "destroying parent removes child" do
    user = FactoryBot.create(:user)
    parent = Task.create(user: user, name: "Parent task")
    child = parent.children.create(name: "Child task")
    parent.destroy
    child_tasks = Task.where(name: "Child task")
    assert child_tasks.length == 0
  end
end
