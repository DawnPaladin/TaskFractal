module ApplicationHelper

def toastr_flash # thanks to https://coderwall.com/p/ximm8a/coverting-rails-flash-messages-to-toastr-notifications
	flash_messages = []
	flash.each do |type, message|
		type = 'success' if type == 'notice'
		type = 'error'   if type == 'alert'
		text = "<script>toastr.#{type}(`#{message}`);</script>"
		flash_messages << text.html_safe if message
	end
	flash_messages.join("\n").html_safe
end

end
