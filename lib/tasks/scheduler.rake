desc "Reset guest user"
task reset_guest: :environment do
	p "Resetting guest user..."

	guest = User.where(email: "guest@taskfractal.com").first
	guest.tasks.each do |task|
		begin
			task.destroy
		rescue => ActiveRecord::RecordNotFound
			p task
		end
	end
	
	p "Creating guest tasks..."
	
	pb = Task.create!(name: "Pack boxes", user: guest)
	pk = pb.children.create!(name: "Pack kitchen")
	plr = pb.children.create!(name: "Pack living room")
	bedroom = pb.children.create!(name: "Pack bedroom")
	bathroom = pb.children.create!(name: "Pack bathroom")
	
	pk.completed = true
	pk.save
	
	fridge = pk.children.create!(name: "Empty fridge")
	fridge.completed = true
	fridge.save
	
	pjc = bedroom.children.create!(name: "Pack James' closet")
	pjc.completed = true
	pjc.save
	
	bedroom.children.create!(name: "Pack Holly's closet")
	bathroom.children.create!(name: "Pack toiletries")
	
	pb.blocked_by.create!(name: "Get boxes", user: guest)
	pb.blocking.create!(name: "Put boxes in moving van", user: guest)
	
	p "Done."
end

desc "Clean up orphaned attachments"
task clean_up_attachments: :environment do
	ActiveStorage::Blob.unattached.each(&:purge)
end
