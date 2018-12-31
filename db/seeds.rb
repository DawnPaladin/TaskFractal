# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)

Task.create({ name: 'Test task' })
pb = Task.create(name: "Pack boxes")
pk = pb.children.create(name: "Pack kitchen")
plr = pb.children.create(name: "Pack living room")
bedroom = pb.children.create(name: "Pack bedroom")
bathroom = pb.children.create(name: "Pack bathroom")

pk.complete
fridge = pk.children.create(name: "Empty fridge")
fridge.complete

pjc = bedroom.children.create(name: "Pack James' closet")
pjc.complete
bedroom.children.create(name: "Pack Holly's closet")

bathroom.children.create(name: "Pack toiletries")

pb.blocked_by.create(name: "Get boxes")
pb.blocking.create(name: "Put boxes in moving van")
