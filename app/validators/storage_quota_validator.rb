class StorageQuotaValidator < ActiveModel::EachValidator
	def validate_each(record, attribute, value)
		attachment_size = record.blob.byte_size
		owner = record.record.user
		if attachment_size + owner.attachments_size >= owner.storage_quota
			record.errors[:attachments] << "would exceed your 100 MB storage quota. We're glad you like TaskFractal so much! Please email james@taskfractal.com to purchase more storage."
		end
	end
end
