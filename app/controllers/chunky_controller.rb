# frozen_string_literal: true

class ChunkyController < ApplicationController
  layout "chunky"

  def index
    task = Task.second
    @chunky_props = { task: task, children: task.children, blocked_by: task.blocked_by, blocking: task.blocking, attachments: attachments(task) }
  end
  
  private
    def attachments(task)
      task.attachments.map{ |attachment| { name: attachment.filename, url: url_for(attachment), id: attachment.id } }
    end
  
end
