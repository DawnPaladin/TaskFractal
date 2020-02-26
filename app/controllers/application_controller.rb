class ApplicationController < ActionController::Base
	before_action :configure_permitted_parameters, if: :devise_controller?
	
	def after_sign_in_path_for(resource)
		tasks_path
	end
	
	def change_show_completed_tasks
		current_user.show_completed_tasks = params[:show_completed_tasks]
		if current_user.save
			render json: { message: "Success" }
		else
			render json: { error: "Couldn't change show_completed_tasks" }
		end
	end
	def change_next_tasks_visible
		current_user.show_next_tasks = params[:show_next_tasks]
		if current_user.save
			render json: { message: "Success" }
		else
			render json: { error: "Couldn't change next_up_visible" }
		end
	end
	
	protected
	
	def configure_permitted_parameters
		devise_parameter_sanitizer.permit(:sign_up, keys: [:nickname])
		devise_parameter_sanitizer.permit(:account_update, keys: [:nickname, :theme, :show_completed_tasks, :next_up_visible])
	end
end
