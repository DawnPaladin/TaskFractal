class PagesController < ApplicationController
  before_action :authenticate_user!, only: :change_theme
  def index
  end
  
  def theme
  end
  
  def change_theme
    current_user.theme = params[:theme]
    if params[:theme] and current_user.save
      render json: { "status": "ok" }
    else
      flash[:error] = "Couldn't change theme to #{params[:theme]}"
      redirect_back(fallback_location: theme_path)
    end
  end
  
  private
    # Never trust parameters from the scary internet, only allow the white list through.
    def task_params
      params.permit(:theme)
    end
  
end
