require 'zip/zip'
require 'zip/zipfilesystem'
require 'json'

  class File
	def self.get_contents(filename)
	  data = ''
	  f = File.open(filename, "r") 
	  f.each_line do |line|
	    data += line
	  end
	  f.close
	  return data
	end
	
	def self.write_contents(path, contents)
		File.open(path, 'w') {|f| f.write(contents) }
	end
  end
 
  
class ApplicationController < ActionController::Base
  # get dependencies.json and parse it
  @@dependencies = JSON.parse(File.get_contents("public/jquery/dist/standalone/dependencies.json"))	

  def pluginify
  	@plugins = []
  
  	# go through the plugins, find the ordered list of dependencies
  	for plugin in params[:plugins]
		push_plugins(get_dependencies(plugin));
	end
  	
  	# get each file, append
    Zip::ZipOutputStream::open("#{RAILS_ROOT}/tmp/myfile_#{Process.pid}") { |io|
	  	standalone_file = ""
	  	min_file = ""
	  	for plugin in @plugins
	  		standalone_name = plugin.gsub(/\/\w+\.js/, '.js').gsub(/\//, '.')
	  		standalone_path = 'public/jquery/dist/standalone/'+standalone_name
	  		standalone_contents = File.get_contents standalone_path
	  		
	  		min_name = standalone_name.gsub(/\.js$/, '.min.js')
	  		min_path = 'public/jquery/dist/standalone/'+min_name
	  		min_contents = File.get_contents min_path
	  		
  			standalone_file += "\n//"+standalone_name+"\n\n"
  			standalone_file += standalone_contents+"\n"
  			min_file += min_contents
  			
		    io.put_next_entry("development/"+standalone_name)
		    io.write(standalone_contents)
		    
		    io.put_next_entry("development/minified/"+min_name)
		    io.write(min_contents)
	  	end
		# zip everything up
	    io.put_next_entry("jquerymx-1.0.custom.js")
	    io.write(standalone_file)
	    
	    io.put_next_entry("jquerymx-1.0.custom.min.js")
	    io.write(min_file)
	    
	    io.put_next_entry("jquery-1.4.4.js")
	    io.write(File.get_contents("public/jquery/dist/standalone/jquery-1.4.4.js"))
	    
	    io.put_next_entry("jquery-1.4.4.min.js")
	    io.write(File.get_contents("public/jquery/dist/standalone/jquery-1.4.4.min.js"))
    }
   
  	send_file "#{RAILS_ROOT}/tmp/myfile_#{Process.pid}", 
  		:filename => "jquerymx-1.0.custom.zip", :type=>"application/zip"
  end
  
  private
  
  def push_plugins(dependencies)
 	for dep in dependencies
		if(!@plugins.include? dep)
		  @plugins.push(dep);
		end
	end
  end
  
  def get_dependencies(name)
 	dependencies = @@dependencies[name]
	total_dependencies = []
	
	if(!dependencies.length || 
		(dependencies.length == 1 && dependencies[0] == "jquery/jquery.js"))
		return [name]
	end
 	for dep in dependencies
		lower_dependencies = get_dependencies(dep);
		for lower_dep in lower_dependencies
			# TODO if you find a duplicate, remove the other one first
			total_dependencies.push(lower_dep)
		end
	end
	total_dependencies.push(name)
	return total_dependencies
  end
end