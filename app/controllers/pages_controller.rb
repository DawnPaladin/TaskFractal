class PagesController < ApplicationController
  before_action :authenticate_user!, only: :change_theme
  def index
  end
  
  def theme
  end
  
  def change_theme
    current_user.theme = params[:theme]
    if current_user.save
      redirect_to tasks_url
    else
      flash[:error] = "Couldn't change theme to #{params[:theme]}"
    end
  end
  
  private
    # Never trust parameters from the scary internet, only allow the white list through.
    def task_params
      params.permit(:theme)
    end
  
end
