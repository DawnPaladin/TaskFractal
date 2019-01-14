require 'hirb'
Hirb.enable :output => {
	"Task"=>{
		:options=>{
			:fields=>%w{id name description completed due_date completed_date parent_id}
		}
	}
}
