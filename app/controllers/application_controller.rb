class ApplicationController < ActionController::Base
	before_action :configure_permitted_parameters, if: :devise_controller?
	
	def after_sign_in_path_for(resource)
		tasks_path
	end
	
	def change_completed_tasks_visible
		current_user.completed_tasks_visible = params[:completed_tasks_visible]
		if current_user.save
			render json: { message: "Success" }
		else
			render json: { error: "Couldn't change completed_tasks_visible" }
		end
	end
	def change_next_up_visible
		current_user.next_up_visible = params[:next_up_visible]
		if current_user.save
			render json: { message: "Success" }
		else
			render json: { error: "Couldn't change next_up_visible" }
		end
	end
	
	protected
	
	def configure_permitted_parameters
		devise_parameter_sanitizer.permit(:sign_up, keys: [:nickname])
		devise_parameter_sanitizer.permit(:account_update, keys: [:nickname, :theme, :completed_tasks_visible, :next_up_visible])
	end
end
