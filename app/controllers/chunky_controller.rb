# frozen_string_literal: true

class ChunkyController < ApplicationController
  layout "chunky"

  def index
    @chunky_props = { name: "Stranger", task: Task.first }
  end
end
