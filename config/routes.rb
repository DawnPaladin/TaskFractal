Rails.application.routes.draw do
  devise_for :users, sign_out_via: [:get, :delete]
  resources :tasks
  root to: 'tasks#index'
  get 'tasks/:id/attachments', to: 'tasks#attachments'
  get 'attachments/:id/rename/:new_name', to: 'tasks#rename_attachment'
  delete 'attachments/:id', to: 'tasks#delete_attachment'
  get 'hello_world', to: 'hello_world#index'
end
