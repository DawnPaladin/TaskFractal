class TasksController < ApplicationController
  before_action :authenticate_user!
  before_action :set_task, only: [:show, :edit, :update, :move, :destroy, :attachments]
  
  # GET /tasks
  # GET /tasks.json
  def index
    respond_to do |format|
      format.html { 
        @outline_props = { 
          tasks: normalize_user_tasks_for_outline,
          next_up: next_up,
          next_up_visible: current_user.next_up_visible,
          show_completed_tasks: current_user.show_completed_tasks,
        }
        @show_completed_tasks = current_user.show_completed_tasks
        render :index 
      }
      format.json { render json: Task.where(user: current_user).order(:position) }
    end
  end

  # GET /tasks/1
  # GET /tasks/1.json
  def show
    respond_to do |format|
      format.html {
        @back_side_task_props = {
          task: @task,
          children: @task.children.order(:position),
          blocked_by: @task.blocked_by.order(:name),
          blocking: @task.blocking.order(:name),
          attachments: list_attachments(@task),
          count_descendants: @task.descendants.count,
          count_completed_descendants: @task.completed_descendants.count,
          ancestors: @task.ancestors.order(:name)
        }
        @show_completed_tasks = current_user.show_completed_tasks
      }
      format.json {
        render json: @task.to_json(include: [:children])
      }
    end
  end
  
  def next_up
    timer = Time.now
    logger.info "Start next_up"
    user_tasks = Task.where(user: current_user)
    logger.info "user_tasks: #{(Time.now - timer).to_s}"
    
    candidates = user_tasks.select do |task|
      task.completed == false and 
      (task.has_children? == false or task.children.all? { |task| task.completed == true }) and 
      (task.blocked_by.length == 0 or task.blocked_by.all? { |task| task.completed == true })
    end
    logger.info "candidates: #{(Time.now - timer).to_s}"
    
    # High-priority tasks whose children and blockers should be completed first
    high_priority = {}
    user_tasks.each do |task|
      if task.completed == false and task.descendants.length > 0 or task.blocking.length > 0
        score = task.descendants.length + task.blocking.length
        high_priority[task.id] = { score: score, task: task }
      end
    end # Result: { 1: { score: 9, task: <task> }, 2: { score: 8, task: <task> }, etc.}
    logger.info "high_priority: #{(Time.now - timer).to_s}"
    
    tagged_candidates = []
    candidates.each do |candidate|
      reasons = []
      score = 0
      ancestors = candidate.ancestors
      
      blocking_high_priority_ids = candidate.blocking_ids & high_priority.keys
      blocking_high_priority_ids.each do |id|
        score += high_priority[id][:score] * 100
        reasons << "blocking \"#{high_priority[id][:task].name}\""
      end
      children_of_high_priority_ids = candidate.ancestor_ids & high_priority.keys
      children_of_high_priority_ids.each do |id|
        score += high_priority[id][:score] * 10
        # reasons << "subtask of \"#{high_priority[id][:task].name}\""
      end
      if high_priority.keys.include? candidate.id
        score += high_priority[candidate.id][:score]
        # reasons << "task has many dependencies"
      end
      if candidate.parent_id != nil
        score += 1
        # reasons << "subtask of \"#{candidate.parent.name}\""
      end
      
      tagged_candidates << { "task" => candidate, "score" => score, "reasons" => reasons, "ancestors" => ancestors }
    end # result: { 0: { score: 120, reasons: [ "blocking \"Important Task\"" ], task: <task> }, etc.}
    logger.info "tagged_candidates: #{(Time.now - timer).to_s}"
    tagged_candidates = tagged_candidates.sort_by {|obj| obj["score"]}.reverse!
    # render json: tagged_candidates
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
      begin
        if @task.update(task_params)
          format.html { redirect_to @task, notice: 'Task was successfully updated.' }
          format.json { render json: @task, status: :ok }
        else
          format.html { render :edit }
          format.json { render json: @task.errors, status: :unprocessable_entity }
        end
      rescue ActiveRecord::RecordInvalid => error
        format.html { render :edit }
        format.json { render json: { "error": error.message }, status: :ok }
      end
    end
  end
  
  def move
    if params[:position] == "NaN" # Arrives with no position due to being the first child of a new parent
      position = false
    else
      position = params[:position].to_i
    end
    parent_id = params[:parent_id]
    unless (parent_id.nil?)
      if (parent_id == "root")
        @task.parent = nil
      else
        new_parent = Task.find(parent_id)
        if new_parent.user == current_user
          @task.parent = new_parent
        else
          not_your_task
        end
      end
    end
    
    if @task.save
      @task.insert_at(position) if position
      respond_to do |format|
        format.html { redirect_to @task, notice: 'Task was successfully moved.' }
        format.json { render json: @task, status: :ok }
      end
    else
      respond_to do |format|
        format.html { redirect_back fallback_location: @task, warning: "Couldn't move task." }
        format.json { render json: @task.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /tasks/1
  # DELETE /tasks/1.json
  def destroy
    @task_name = @task.name
    @task.destroy
    respond_to do |format|
      format.html { redirect_to tasks_url, notice: 'Task was successfully destroyed.' }
      format.json { 
        flash[:warning] = "\"" + @task_name + "\" deleted."
        render json: { text: "\"" + @task_name + "\" deleted."}
      }
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
  
  def add_blocking_task
    add_task_block('blocking')
  end
  
  def add_blocked_by_task
    add_task_block('blocked_by')
  end
  
  def remove_blocking_task
    remove_task_block('blocking')
  end
  
  def remove_blocked_by_task
    remove_task_block('blocked_by')
  end
  
  private
    def normalize_user_tasks_for_outline
      # sample_output = {
      #   rootId: 'root',
      #   items: {
      #     'root': {
      #       id: 'root',
      #       children: ['1'],
      #     },
      #     '1': {
      #       id: '1',
      #       children: ['2'],
      #       isExpanded: true,
      #       data: { name: "Parent" },
      #     },
      #     '2': {
      #       id: '2',
      #       children: [],
      #       isExpanded: true,
      #       data: { name: "Child" },
      #     },
      #   }
      # }
      logger.info "Start normalize_user_tasks_for_outline for" + current_user.email
      ar_tasks = Task.where(user: current_user).order(:position).includes(:blocking, :blocked_by) # ActiveRecord tasks
      logger.info "Got user tasks"
      prop_tasks = {
        "rootId" => 'root',
        "items" => {}
      }
      root_task = {
        "id" => 'root',
        "children" => [],
      }
      ar_tasks.each do |ar_task|
        id = ar_task.id.to_s
        prop_task = {
          "id" => id,
          "children" => ar_task.children.order(:position).pluck(:id),
          "isExpanded" => ar_task.is_expanded,
          "data" => {
            "id" => id,
            "name" => ar_task.name,
            "completed" => ar_task.completed,
            "due_date" => ar_task.due_date,
            "description" => ar_task.description,
            "attachment_count" => ar_task.attachment_count,
            "blocking_count" => ar_task.blocking.count,
            "blocked_by_count" => ar_task.blocked_by.count,
            "descendant_count" => ar_task.descendants.count,
            "completed_descendant_count" => ar_task.completed_descendants.count,
          }
        }
        prop_tasks["items"][id] = prop_task
        if ar_task.parent.nil?
          root_task['children'] << id
        end
      end
      prop_tasks["items"]['root'] = root_task
      logger.info "Finished with prop_tasks"
      return prop_tasks
    end
    
    def list_attachments(task)
      task.attachments.map{ |attachment| { name: attachment.filename, url: url_for(attachment), id: attachment.id } }
    end
    
    # Use callbacks to share common setup or constraints between actions.
    def set_task
      @task = Task.find(params[:id])
      not_your_task if @task.user != current_user
    end
    
    def add_task_block(relationship)
      @task = Task.find(params[:task_id])
      @secondary_task = Task.find(params[:id])
      relationship_text = relationship.gsub('_', ' ') # change "blocked_by" to "blocked by"
      if @task.user == current_user and @secondary_task.user == current_user
        @task.public_send(relationship) << @secondary_task
        text = "\"#{@task.name}\" is now #{relationship_text} \"#{@secondary_task.name}\"."
        respond_to do |format|
          format.html { redirect_to @task, notice: text }
          format.json { render json: { status: :ok, text: text }}
        end
      else
        not_your_task
      end
    rescue ActiveRecord::RecordInvalid, ActiveRecord::RecordNotFound => e
      respond_to do |format|
        format.html { redirect_to @task, alert: e }
        format.json { render json: { status: :bad_request, error: e }}
      end
    end
    
    def remove_task_block(relationship)
      @task = Task.find(params[:task_id])
      @secondary_task = Task.find(params[:id])
      relationship_text = relationship.gsub('_', ' ') # change "blocked_by" to "blocked by"
      if @task.user == current_user and @secondary_task.user == current_user
        @task.public_send(relationship).delete(@secondary_task)
        text = "\"#{@task.name}\" is no longer #{relationship_text} \"#{@secondary_task.name}\"."
        respond_to do |format|
          format.html { redirect_to @task, notice: text }
          format.json { render json: { status: :ok, text: text }}
        end
      else
        not_your_task
      end
    end
    
    def not_your_task
      respond_to do |format|
        format.html { redirect_to destroy_user_session_url, status: :unauthorized, text: "That task does not belong to you." and return }
        format.json { 
          render json: {
            error: "That task does not belong to you.",
            status: :forbidden
          }, status: :forbidden
          return
        }
      end
    end
    
    # Never trust parameters from the scary internet, only allow the white list through.
    def task_params
      params.require(:task).permit(:name, :description, :completed, :due_date, :completed_date, :attachments, :parent_id, :is_expanded)
    end
end
