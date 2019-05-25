Rails.application.routes.draw do
  root 'pages#home'
  
  devise_for :users, sign_out_via: [:get, :delete]
  resources :tasks do
    post 'blocking/:id', to: 'tasks#add_blocking_task'
    post 'blocked_by/:id', to: 'tasks#add_blocked_by_task'
    delete 'blocking/:id', to: 'tasks#remove_blocking_task'
    delete 'blocked_by/:id', to: 'tasks#remove_blocked_by_task'
  end
  # get 'next_up', to: 'tasks#next_up'
  patch 'tasks/:id/move/position/:position', to: 'tasks#move'
  patch 'tasks/:id/move/position/:position/parent/:parent_id', to: 'tasks#move'
  get 'tasks/:id/attachments', to: 'tasks#attachments'
  get 'attachments/:id/rename/:new_name', to: 'tasks#rename_attachment'
  delete 'attachments/:id', to: 'tasks#delete_attachment'
end
