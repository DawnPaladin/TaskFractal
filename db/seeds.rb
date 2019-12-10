# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)

p "Seeding database..."

User.create!(email: "guest@taskfractal.com", nickname: "Guest", password: "password", password_confirmation: "password")

user = User.create!(email: "test@test.com", nickname: "Test user", password: "password", password_confirmation: "password")

pb = Task.create!(name: "Pack boxes", user: user)
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

pb.blocked_by.create!(name: "Get boxes", user: user)
pb.blocking.create!(name: "Put boxes in moving van", user: user)

p "Seeding complete."
