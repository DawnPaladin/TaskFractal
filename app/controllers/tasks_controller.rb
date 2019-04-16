class TasksController < ApplicationController
  before_action :authenticate_user!
  before_action :set_task, only: [:show, :edit, :update, :destroy, :attachments]
  
  # GET /tasks
  # GET /tasks.json
  def index
    respond_to do |format|
      format.html { 
        @outline_props = { 
          tasks: Task.where(user: current_user).arrange_serializable do |parent, children|
            TaskSerializer.new(parent, children: children)
          end
        }
        render :index 
      }
      format.json { render json: Task.where(user: current_user).arrange_serializable.to_json do |parent, children|
        TaskSerializer.new(parent, children: children)
      end }
    end
  end

  # GET /tasks/1
  # GET /tasks/1.json
  def show
    respond_to do |format|
      format.html {
        @back_side_task_props = {
          task: @task,
          children: @task.children.order(:name),
          blocked_by: @task.blocked_by.order(:name),
          blocking: @task.blocking.order(:name),
          attachments: list_attachments(@task),
          count_descendants: @task.descendants.count,
          count_completed_descendants: @task.completed_descendants.count,
          ancestors: @task.ancestors.order(:name)
        }
      }
      format.json {
        render json: @task
      }
    end
  end
  
  def attachments
    task = Task.find(params[:id])
    render json: list_attachments(task)
  end
  
  # GET /tasks/new
  def new
    @task = Task.new
  end

  # GET /tasks/1/edit
  def edit
  end

  # POST /tasks
  # POST /tasks.json
  def create
    @task = Task.new(task_params)
    @task.user = current_user

    respond_to do |format|
      if @task.save
        format.html { render json: @task }
        format.json { render json: @task }
      else
        format.html { render :new }
        format.json { render json: @task.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /tasks/1
  # PATCH/PUT /tasks/1.json
  def update
    respond_to do |format|
      if @task.update(task_params)
        format.html { redirect_to @task, notice: 'Task was successfully updated.' }
        format.json { render :show, status: :ok, location: @task }
      else
        format.html { render :edit }
        format.json { render json: @task.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /tasks/1
  # DELETE /tasks/1.json
  def destroy
    @task.destroy
    respond_to do |format|
      format.html { redirect_to tasks_url, notice: 'Task was successfully destroyed.' }
      format.json { head :no_content }
    end
  end
  
  def delete_attachment
    @atch = ActiveStorage::Attachment.find(params[:id])
    @task = @atch.record
    if @task.user == current_user
      @atch.purge
      render json: { status: :ok }
    else
      render json: {
        error: "That attachment does not belong to you.",
        status: :forbidden
      }, status: :forbidden
    end
  end
  
  def rename_attachment
    @atch = ActiveStorage::Attachment.find(params[:id])
    @task = @atch.record
    if @task.user == current_user
      if @atch.blob.update(filename: params[:new_name] + '.' + @atch.filename.extension)
        render json: { name: @atch.filename }
      else
        render json: @atch.errors, status: :unprocessable_entity
      end
    else
      render json: {
        error: "That attachment does not belong to you.",
        status: :forbidden
      }, status: :forbidden
    end
  end

  private
    def list_attachments(task)
      task.attachments.map{ |attachment| { name: attachment.filename, url: url_for(attachment), id: attachment.id } }
    end

    # Use callbacks to share common setup or constraints between actions.
    def set_task
      @task = Task.find(params[:id])
      if @task.user != current_user
        respond_to do |format|
          format.html { redirect_to destroy_user_session_url, status: :unauthorized, text: "That task does not belong to you." and return }
          format.json { 
            render json: {
              error: "That task does not belong to you.",
              status: :forbidden
            }, status: :forbidden
          }
        end
      end
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def task_params
      params.require(:task).permit(:name, :description, :completed, :due_date, :completed_date, :attachments, :parent_id)
    end
end
