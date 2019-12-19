class UserMailer < Devise::Mailer   
	helper :application # gives access to all helpers defined within `application_helper`.
	include Devise::Controllers::UrlHelpers # Optional. eg. `confirmation_url`

	layout "notifications_mailer"
end
