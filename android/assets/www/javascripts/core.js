(function() {
  $(function() {
    window.target = "android";
    if (target === "browser") {
      return observers.init();
    } else {
      return document.addEventListener("deviceready", function() {
        return observers.init();
      });
    }
  });
  this.keysDown = {};
  this.observers = {
    init: function() {
      $("button#game_start").click(function() {
        return game.start();
      });
      $("button#game_stop").click(function() {
        return game.stop();
      });
      addEventListener("keydown", function(e) {
        return keysDown[e.keyCode] = true;
      });
      return addEventListener("keyup", function(e) {
        return delete keysDown[e.keyCode];
      });
    }
  };
  this.game = {
    running: false,
    running_time: 0,
    user_commands: [],
    game_over: 10,
    init: function() {
      this.krampus_song = null;
      kids.clearAll();
      $("#output0").html("Initializing Game");
      $("#output1").html("0");
      this.score = 0;
      this.misses = 0;
      kids.total = 0;
      kids.active = 0;
      kids.count = 1;
      kids.list = [];
      kids.speed = 2000;
      this.user_commands = [];
      this.running_time = 0;
      switch (target) {
        case 'android':
          return document.addEventListener("touchstart", function(e) {
            return game.user_commands.push(e.changedTouches[0]);
          });
        case 'browser':
          return $("body").bind("click", function(e) {
            return game.user_commands.push(e);
          });
      }
    },
    start: function() {
      this.init();
      this.running = true;
      this.main_loop_interval = setInterval(game.main, 1);
      this.past = Date.now();
      switch (target) {
        case 'android':
          this.krampus_song = new Media('/android_asset/www/audio/krampus.mp3');
          break;
        case 'browser':
          this.krampus_song = new Audio("audio/krampus.mp3");
      }
      this.krampus_song.play();
      return $("#output0").html("Game Started");
    },
    stop: function() {
      this.krampus_song.pause();
      this.running = false;
      this.main_loop_interval = window.clearInterval(this.main_loop_interval);
      kids.clearAll();
      return $("#output0").html("Game Stopped");
    },
    main: function() {
      var delta, now;
      if (game.running) {
        now = Date.now();
        delta = now - game.past;
        game.running_time += delta;
        game.update(delta / 1000);
        game.render(delta);
        return game.past = now;
      }
    },
    update: function(modifier) {
      kids.clean();
      kids.speed = Math.floor(this.running_time / 10000) + 3000;
      kids.count = Math.floor(this.running_time / 10000) + 1;
      if (kids.count > kids.active) {
        return kids.add();
      }
    },
    render: function(delta) {
      var id, kid;
      $("#running_time").html(this.running_time);
      $("#score").html("Score: " + this.score);
      $("#misses").html("Misses: " + this.misses);
      for (id in kids.list) {
        kid = kids.list[id];
        if (!kid.drawn) {
          kids.draw(kid);
        }
      }
      if (this.misses > this.game_over) {
        return this.gameOver();
      }
    },
    drawClick: function(com) {
      var div;
      div = $("<div />").addClass("hit").attr("id", "com" + com.id);
      div.css("top", com.y).css("left", com.x);
      $("#play_area").append(div);
      return div.fadeOut(100);
    },
    gameOver: function() {
      var snd;
      this.stop();
      switch (target) {
        case 'android':
          snd = new Media('/android_asset/www/audio/bye.wav').play();
          break;
        case 'browser':
          snd = new Audio("audio/bye.wav").play();
      }
      return $("#output0").html("GAME OVER!");
    }
  };
  this.kids = {
    clean: function() {
      var com, coms, id, kid, _results;
      coms = [];
      while (game.user_commands.length > 0) {
        com = game.user_commands.pop();
        com = {
          x: com.pageX,
          y: com.pageY
        };
        coms.push(com);
      }
      _results = [];
      for (id in this.list) {
        kid = this.list[id];
        if (coms.length > 0) {
          this.detectCollisions(kid, coms);
        }
        _results.push(game.running_time > (kid.started + kid.speed) ? this.miss(id) : void 0);
      }
      return _results;
    },
    detectCollisions: function(kid, coms) {
      var com, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = coms.length; _i < _len; _i++) {
        com = coms[_i];
        game.drawClick(com);
        _results.push(kid.x >= (com.x - 60) && kid.x <= com.x && kid.y >= (com.y - 170) && kid.y <= (com.y - 100) ? this.hit(kid.id) : void 0);
      }
      return _results;
    },
    miss: function(id) {
      var kid, snd;
      kid = this.list[id];
      switch (game.sound) {
        case 'android':
          snd = new Media('/android_asset/www/audio/yes_2.wav').play();
          break;
        case 'browser':
          snd = new Audio("audio/yes_2.wav").play();
      }
      this.clear(kid);
      return game.misses += 1;
    },
    hit: function(id) {
      var kid, snd;
      kid = this.list[id];
      switch (target) {
        case 'android':
          snd = new Media('/android_asset/www/audio/gulp-1.wav').play();
          break;
        case 'browser':
          snd = new Audio("audio/gulp-1.wav").play();
      }
      this.clear(kid);
      return game.score += 1;
    },
    clear: function(kid) {
      this.active -= 1;
      $("#kid" + kid.id).remove();
      return delete this.list[kid.id];
    },
    clearAll: function() {
      var id, kid, _results;
      kids.active = 0;
      _results = [];
      for (id in kids.list) {
        kid = kids.list[id];
        _results.push(this.clear(kid));
      }
      return _results;
    },
    add: function() {
      var kid;
      this.total += 1;
      this.active += 1;
      kid = {
        id: kids.total,
        x: Math.floor(Math.random() * 301),
        y: Math.floor(Math.random() * 501),
        started: game.running_time,
        speed: this.speed,
        hit: false
      };
      return this.list[kid.id] = kid;
    },
    draw: function(kid) {
      var div;
      div = $("<div />").addClass("kid").attr("id", "kid" + kid.id);
      div.css("margin-top", kid.y).css("margin-left", kid.x);
      $("#play_area").append(div);
      return kid.drawn = true;
    }
  };
}).call(this);
