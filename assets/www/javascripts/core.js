(function() {
  $(function() {
    return observers.init();
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
      addEventListener("keyup", function(e) {
        return delete keysDown[e.keyCode];
      });
      return $("#play_area").click(function(e) {
        return game.user_commands.push(e);
      });
    }
  };
  this.game = {
    sound: "browser",
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
      return this.running_time = 0;
    },
    start: function() {
      this.init();
      this.running = true;
      this.main_loop_interval = setInterval(game.main, 1);
      this.past = Date.now();
      switch (this.sound) {
        case 'android':
          this.krampus_song = new Media('/android_asset/www/audio/krampus.mp3');
          break;
        case 'browser':
          this.krampus_song = new Audio("audio/krampus.mp3");
      }
      this.krampus_song.play();
      return $("#output0").html("game started");
    },
    stop: function() {
      this.krampus_song.pause();
      this.running = false;
      this.main_loop_interval = window.clearInterval(this.main_loop_interval);
      kids.clearAll();
      return $("#output0").html("game stopped");
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
    gameOver: function() {
      var snd;
      this.stop();
      switch (this.sound) {
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
      var id, kid, _results;
      _results = [];
      for (id in this.list) {
        kid = this.list[id];
        _results.push(game.running_time > (kid.started + kid.speed) ? this.miss(id) : void 0);
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
      switch (this.sound) {
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
      this.list[kid.id] = kid;
      return $("#output0").html("Kid added: " + this.running_time + ", kid y: " + kid.y + ", kid x: " + kid.x);
    },
    draw: function(kid) {
      var div;
      div = $("<button />").addClass("kid").attr("id", "kid" + kid.id);
      div.css("margin-top", kid.y).css("margin-left", kid.x).click(function() {
        return kids.hit(kid.id);
      });
      $("#play_area").append(div);
      return kid.drawn = true;
    }
  };
}).call(this);
