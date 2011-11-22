Gaptooth is a basic skeleton for PhoneGap applications that includes support for HAML, SASS, and Coffeescript using the watchr and thor gems.

    download
    cd gaptooth/
    bundle install
    watchr watchr.rb
    have fun in the src folder



Watchr watches the src folder for changes to files with .haml, .sass, .scss, and .coffee.  When one of those changes, it calls the appropriate thor method.  Thor then runs the appropriate commands to save those convert the file and stick it into the assets folder.

