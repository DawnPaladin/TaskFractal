Rails.application.routes.draw do
  resources :tasks
  get 'tasks/:id/attachments', to: 'tasks#attachments'
  get 'attachments/:id/rename/:new_name', to: 'tasks#rename_attachment'
  delete 'attachments/:id', to: 'tasks#delete_attachment'
  get 'hello_world', to: 'hello_world#index'
  get '/', to: 'tasks#index'
end
