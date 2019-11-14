require 'test_helper'

class UserTest < ActiveSupport::TestCase
  test "user requires email and password" do
    user = User.new
    assert user.invalid?
    user.email = "test@test.com"
    user.password = "password"
    assert user.valid?
  end
end
