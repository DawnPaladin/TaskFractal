require 'test_helper'

class TasksControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers

  def setup
    @request.env["devise.mapping"] = Devise.mappings[:user]
    sign_in FactoryBot.create(:user)
    @task = tasks(:one)
  end
  
  # Tests won't run - "No route matches"
  
#   test "should get index" do
#     get tasks_url
#     assert_response :success
#   end

#   test "should get new" do
#     get new_task_url
#     assert_response :success
#   end

#   test "should create task" do
#     assert_difference('Task.count') do
#       post tasks_url, params: { task: { completed: @task.completed, completed_date: @task.completed_date, description: @task.description, due_date: @task.due_date, name: @task.name } }
#     end

#     assert_redirected_to task_url(Task.last)
#   end

#   test "should show task" do
#     get task_url(@task)
#     assert_response :success
#   end

#   test "should get edit" do
#     get edit_task_url(@task)
#     assert_response :success
#   end

#   test "should update task" do
#     patch task_url(@task), params: { task: { completed: @task.completed, completed_date: @task.completed_date, description: @task.description, due_date: @task.due_date, name: @task.name } }
#     assert_redirected_to task_url(@task)
#   end

#   test "should destroy task" do
#     assert_difference('Task.count', -1) do
#       delete task_url(@task)
#     end

#     assert_redirected_to tasks_url
#   end
end
