# frozen_string_literal: true

class ChunkyController < ApplicationController
  layout "chunky"

  def index
    task = Task.second
    @chunky_props = { name: "Stranger", task: task, children: task.children, blocked_by: task.blocked_by, blocking: task.blocking }
  end
end
