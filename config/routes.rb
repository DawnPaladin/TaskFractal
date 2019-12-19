Rails.application.routes.draw do
	root 'pages#home'
	
	devise_for :users,
		sign_out_via: [:get, :delete], 
		controllers: {
			registrations: 'users/registrations',
			sessions: 'users/sessions'
		}
	resources :tasks do
		post 'blocking/:id', to: 'tasks#add_blocking_task'
		post 'blocked_by/:id', to: 'tasks#add_blocked_by_task'
		delete 'blocking/:id', to: 'tasks#remove_blocking_task'
		delete 'blocked_by/:id', to: 'tasks#remove_blocked_by_task'
	end
	get 'next_up', to: 'tasks#next_up'
	patch 'tasks/:id/move/position/:position', to: 'tasks#move'
	patch 'tasks/:id/move/position/:position/parent/:parent_id', to: 'tasks#move'
	get 'tasks/:id/attachments', to: 'tasks#attachments'
	get 'attachments/:id/rename/:new_name', to: 'tasks#rename_attachment'
	delete 'attachments/:id', to: 'tasks#delete_attachment'
	get '/theme', to: 'pages#theme'
	patch '/theme', to: 'pages#change_theme'
	patch '/change_show_completed_tasks', to: 'application#change_show_completed_tasks'
	patch '/change_next_up_visible', to: 'application#change_next_up_visible'
end
