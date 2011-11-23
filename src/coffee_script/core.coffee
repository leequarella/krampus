$ ->
  #window.target = "browser"
  window.target = "android"
  
  if target == "browser"
    observers.init()
  else
    document.addEventListener "deviceready", ->
      observers.init()
  

@keysDown = {}  
  
@observers =
  init: ->
    $("button#game_start").click -> game.start()
    $("button#game_stop").click -> game.stop()    
    addEventListener "keydown", (e) -> keysDown[e.keyCode] = true
    addEventListener "keyup", (e) -> delete keysDown[e.keyCode]
      
@game =
  running: false
  running_time: 0
  user_commands: []
  game_over: 10
  
  init: ->
    @krampus_song = null
    kids.clearAll()
    $("#output0").html "Initializing Game"
    $("#output1").html "0"
    @score = 0
    @misses = 0
    kids.total = 0
    kids.active = 0
    kids.count = 1
    kids.list = []
    kids.speed = 2000
    @user_commands = []
    @running_time = 0
    switch target
      when 'android'
        document.addEventListener "touchstart", (e)-> game.user_commands.push e.changedTouches[0]#, alert e.changedTouches[0].pageX
      when 'browser'
        $("body").bind("click", (e)-> game.user_commands.push e)
  
  start: ->
    @init()
    @running = true
    @main_loop_interval = setInterval(game.main, 1)
    @past = Date.now()
    switch target
      when 'android'
        @krampus_song = new Media('/android_asset/www/audio/krampus.mp3')  #new Audio("audio/krampus.mp3")
      when 'browser'
        @krampus_song = new Audio("audio/krampus.mp3")
    @krampus_song.play()
    $("#output0").html "Game Started"
  
  stop: ->
    @krampus_song.pause()
    @running = false
    @main_loop_interval = window.clearInterval(@main_loop_interval)
    kids.clearAll()
    $("#output0").html "Game Stopped"
    
  
  main: -> 
    if game.running
      now = Date.now()
      delta = now - game.past
      game.running_time += delta
      game.update(delta / 1000)
      game.render(delta)
      game.past = now  
      
  
  update: (modifier)->
    kids.clean()
    kids.speed = Math.floor(@running_time/10000) + 3000
    kids.count = Math.floor(@running_time/10000) + 1
    kids.add() if kids.count > kids.active
  
  
  render: (delta) ->
    $("#running_time").html @running_time
    $("#score").html "Score: " + @score
    $("#misses").html "Misses: " + @misses
    for id of kids.list
      kid = kids.list[id]
      kids.draw(kid) if !kid.drawn
    @gameOver() if @misses > @game_over
      
  drawClick: (com) ->
    div = $("<div />").addClass("hit").attr("id", "com" + com.id)
    div.css("top", com.y).css("left", com.x)
    $("#play_area").append div
    div.fadeOut(100)
      
  gameOver: ->
    @stop()
    switch target
      when 'android'
        snd = new Media('/android_asset/www/audio/bye.wav').play()
      when 'browser'
        snd = new Audio("audio/bye.wav").play()
    $("#output0").html "GAME OVER!"
    


@kids =
  clean: ->
    coms = []
    while game.user_commands.length > 0
      com = game.user_commands.pop()
      com = 
        x: com.pageX
        y: com.pageY
      coms.push com 
    for id of @list
      kid = @list[id]
      @detectCollisions(kid, coms) if coms.length > 0
      if game.running_time > (kid.started + kid.speed)
        @miss(id)
  
  detectCollisions: (kid, coms) ->
    for com in coms
      game.drawClick(com)
      if kid.x >= (com.x - 60) && kid.x <= (com.x) && kid.y >= (com.y - 170) && kid.y <= (com.y - 100)
        @hit(kid.id)
  
  miss: (id) ->
    kid = @list[id]
    switch game.sound 
      when 'android'
        snd = new Media('/android_asset/www/audio/yes_2.wav').play()
      when 'browser'
        snd = new Audio("audio/yes_2.wav").play()
    @clear(kid) 
    game.misses += 1
  
  
  hit: (id) ->
    kid = @list[id]
    switch target
      when 'android'
        snd = new Media('/android_asset/www/audio/gulp-1.wav').play()
      when 'browser'
        snd = new Audio("audio/gulp-1.wav").play()
    @clear kid 
    game.score += 1
  
  
  clear: (kid) ->
    @active -= 1
    $("#kid"+kid.id).remove()
    delete @list[kid.id]
    
    
  clearAll: ->
    kids.active = 0
    for id of kids.list
      kid = kids.list[id]
      @clear(kid) 
    
  add: ->
    @total += 1
    @active += 1
    kid = 
      id: kids.total
      x: Math.floor(Math.random()*301)
      y: Math.floor(Math.random()*501)
      started: game.running_time
      speed: @speed
      hit: false
    @list[kid.id] = kid
  
  draw: (kid) ->
    div = $("<div />").addClass("kid").attr("id", "kid" + kid.id)
    div.css("margin-top", kid.y).css("margin-left", kid.x)
    $("#play_area").append div
    kid.drawn = true
    
      
