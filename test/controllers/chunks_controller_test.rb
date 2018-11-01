require 'test_helper'

class ChunksControllerTest < ActionDispatch::IntegrationTest
  setup do
    @chunk = chunks(:one)
  end

  test "should get index" do
    get chunks_url, as: :json
    assert_response :success
  end

  test "should create chunk" do
    assert_difference('Chunk.count') do
      post chunks_url, params: { chunk: { completed: @chunk.completed, name: @chunk.name } }, as: :json
    end

    assert_response 201
  end

  test "should show chunk" do
    get chunk_url(@chunk), as: :json
    assert_response :success
  end

  test "should update chunk" do
    patch chunk_url(@chunk), params: { chunk: { completed: @chunk.completed, name: @chunk.name } }, as: :json
    assert_response 200
  end

  test "should destroy chunk" do
    assert_difference('Chunk.count', -1) do
      delete chunk_url(@chunk), as: :json
    end

    assert_response 204
  end
end
