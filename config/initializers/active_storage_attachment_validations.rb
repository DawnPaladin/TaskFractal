Rails.configuration.to_prepare do
	ActiveStorage::Attachment.class_eval do
		validates :attachments, :storage_quota => true
	end
end
