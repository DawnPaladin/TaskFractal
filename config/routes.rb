Rails.application.routes.draw do
  root 'pages#home'
  
  devise_for :users, sign_out_via: [:get, :delete]
  resources :tasks
  get 'tasks/:id/attachments', to: 'tasks#attachments'
  get 'attachments/:id/rename/:new_name', to: 'tasks#rename_attachment'
  delete 'attachments/:id', to: 'tasks#delete_attachment'
end
