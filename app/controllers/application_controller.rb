require 'zip/zip'
require 'zip/zipfilesystem'
class ApplicationController < ActionController::Base
  def pluginify
  	# get each file, append
  	standalone = ""
  	min = ""
    Zip::ZipOutputStream::open("#{RAILS_ROOT}/tmp/myfile_#{Process.pid}") { |io|
	  	params.each do |name, deps|
	  		deps = deps.split(",")
	  		next if name == "action" || name == "controller"
	  		
	  		standalone_name = name.gsub(/\/\w+\.js/, '.js').gsub(/\//, '.')
	  		saved_path = 'public/jquery/dist/pluginify/'+standalone_name
	  		
	  		min_name = standalone_name.gsub(/\.js$/, '.min.js')
	  		saved_min_path = 'public/jquery/dist/pluginify/'+min_name
	  		
	  		#if !(File.exists? saved_path)
			  	standalone = ""
			  	min = ""
		  		for dep in deps
		  			dep_name = dep.gsub(/\/\w+\.js/, '.js').gsub(/\//, '.')
		  			dep_path = 'public/jquery/dist/standalone/'+dep_name
		  			dep_min_path = dep_path.gsub(/\.js$/, '.min.js')
		  			standalone += "\n//"+dep_name+"\n\n"
		  			standalone += (get_file_as_string dep_path)+"\n"
		  			min += get_file_as_string dep_min_path
				end
				#write_file_as_string saved_path, standalone
				#write_file_as_string saved_min_path, min
			#end
			
  			# zip everything up
		    io.put_next_entry(standalone_name)
		    io.write(standalone)
		    
		    io.put_next_entry(min_name)
		    io.write(min)
	  	end
    }
   
  	send_file "#{RAILS_ROOT}/tmp/myfile_#{Process.pid}", 
  		:filename => "javascriptmvc.zip", :type=>"application/zip"
  end
  
	def get_file_as_string(filename)
	  data = ''
	  f = File.open(filename, "r") 
	  f.each_line do |line|
	    data += line
	  end
	  f.close
	  return data
	end
	
	def write_file_as_string(path, contents)
		File.open(path, 'w') {|f| f.write(contents) }
	end
end
