require 'zip/zip'
require 'zip/zipfilesystem'
class ApplicationController < ActionController::Base
  def pluginify
  	# get each file, append
  	standalone = ""
  	min = ""
    Zip::ZipOutputStream::open("#{RAILS_ROOT}/tmp/javascriptmvc.zip") { |io|
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
   
   @output = standalone
  	#send_file "#{RAILS_ROOT}/tmp/javascriptmvc.zip", :type=>"application/zip"
  	   #Zip::ZipFile.open("#{RAILS_ROOT}/tmp/my.zip", Zip::ZipFile::CREATE) {
	   # |zipfile|
	   # zipfile.file.open("first.txt", "w") { |f| f.puts "Hello world" }
	   # zipfile.dir.mkdir("mydir")
	   # zipfile.file.open("mydir/second.txt", "w") { |f| f.puts "Hello again" }
	  #}
  	#send_file "#{RAILS_ROOT}/tmp/my.zip", :type=>"application/zip"
	  write_file_as_string "#{RAILS_ROOT}/tmp/hi.txt", "hi world"
	  get_file_as_string "#{RAILS_ROOT}/tmp/hi.txt"
  	  send_file "#{RAILS_ROOT}/tmp/hi.txt"
	  
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
