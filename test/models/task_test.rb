require 'test_helper'

class TaskTest < ActiveSupport::TestCase
  def setup
    @user = FactoryBot.create(:user)
  end
  
  test "create task" do
    task = Task.create(user: @user, name: "Test task")
    assert task.valid?
  end
  
  test "create child task" do
    parent = Task.create(user: @user, name: "Parent task")
    child = parent.children.create(name: "Child task")
    assert child.valid?
  end
  
  test "destroying parent removes child" do
    parent = Task.create(user: @user, name: "Parent task")
    child = parent.children.create(name: "Child task")
    parent.destroy
    child_tasks = Task.where(name: "Child task")
    assert child_tasks.length == 0
  end
  
  test "blocking a task creates a reciprocal blocked_by relationship" do
    blocker = Task.create(user: @user, name: "Blocker")
    blocked = blocker.blocking.create(name: "Blocked", user: @user)
    blocked.save
    assert blocker.blocking.first.name == "Blocked"
    assert blocked.blocked_by.first.name == "Blocker"
  end

  test "unblocking a task removes reciprocal relationship" do
    blocker = Task.create(user: @user, name: "Blocker")
    blocked = blocker.blocking.create(name: "Blocked", user: @user)
    blocked.save
    blocker.blocking.delete(blocked)
    assert blocked.blocked_by.length == 0
  end
end
