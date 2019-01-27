Rails.application.routes.draw do
  resources :tasks
  delete 'attachments/:id', to: 'tasks#delete_attachment'
  get 'tasks/:id/attachments', to: 'tasks#attachments'
  get 'hello_world', to: 'hello_world#index'
  get '/', to: 'tasks#index'
end
