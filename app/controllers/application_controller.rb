require 'zip/zip'
require 'zip/zipfilesystem'
class ApplicationController < ActionController::Base
  def pluginify
  	# get each file, append
    Zip::ZipOutputStream::open("#{RAILS_ROOT}/tmp/myfile_#{Process.pid}") { |io|
	  	standalone_file = ""
	  	min_file = ""
	  	for plugin in params[:plugins]
	  		standalone_name = plugin.gsub(/\/\w+\.js/, '.js').gsub(/\//, '.')
	  		puts "name: "+standalone_name+", end"
	  		standalone_path = 'public/jquery/dist/standalone/'+standalone_name
	  		standalone_contents = get_file_as_string standalone_path
	  		
	  		min_name = standalone_name.gsub(/\.js$/, '.min.js')
	  		min_path = 'public/jquery/dist/standalone/'+min_name
	  		min_contents = get_file_as_string min_path
	  		
  			standalone_file += "\n//"+standalone_name+"\n\n"
  			standalone_file += standalone_contents+"\n"
  			min_file += min_contents
  			
		    io.put_next_entry("development/"+standalone_name)
		    io.write(standalone_contents)
		    
		    io.put_next_entry("development/minified/"+min_name)
		    io.write(min_contents)
	  	end
		# zip everything up
	    io.put_next_entry("production/jquerymx-3.0.custom.js")
	    io.write(standalone_file)
	    
	    io.put_next_entry("production/jquerymx-3.0.custom.min.js")
	    io.write(min_file)
    }
   
  	send_file "#{RAILS_ROOT}/tmp/myfile_#{Process.pid}", 
  		:filename => "jquerymx-3.0.0.custom.zip", :type=>"application/zip"
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
