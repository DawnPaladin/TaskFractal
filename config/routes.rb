Rails.application.routes.draw do
  resources :tasks
  get 'tasks/:id/attachments', to: 'tasks#attachments'
  get 'hello_world', to: 'hello_world#index'
  get '/', to: 'chunky#index'
end
