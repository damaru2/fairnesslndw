/***

A very very very very bare bones Scene Manager

***/
window.Interactive = new (function(){

	var self = this;

	// Scene
	self.scene = null;
	self.transitionCallback = null;
	self.transitionToScene = null;
	self.level_map = null;

	// Init, Goto, Update, Render
	self.init = function(){
		subscribe("/update",self.update);
		subscribe("/render",self.render);
	};
	self.goto = function(SceneClass){
		if(self.scene && self.scene.kill) self.scene.kill(); // kill last scene.
		self.scene = new SceneClass(self.level_map);
		if(self.scene.transitionIn) self.scene.transitionIn(self.scene);
	};
	self.update = function(){
		canvas.style.cursor = "default";

		// Is Paused? Do nothing.
		if(!self.PLAYING){
			self.pause();
			return;
		}

		if(self.scene) self.scene.update();

		// Narrator update
		Narrator.update();

		// If Scene Transition is done, go to that.
		if(self.transitionCallback && self.transitionCallback()){
			self.goto(self.transitionToScene, self.level_map);
			self.transitionCallback = null;
			self.transitionToScene = null;
			self.level_map = null;
		}

	};
	self.render = function(){

		// Is Paused? Do nothing.
		if(!self.PLAYING) return;

		// Then actually draw it.
		ctx.clearRect(0,0,canvas.width,canvas.height);
		if(self.scene) self.scene.render(ctx);
		
	};

	// Scene Transitions
	self.transitionTo = function(SceneClass, level_map){
        self.level_map = level_map;

		if(self.scene && self.scene.transitionOut){
			self.transitionCallback = self.scene.transitionOut();
			self.transitionToScene = SceneClass;
		}else{
			self.goto(SceneClass);
		}

	}

	// Pause & Play
	self.PLAYING = true;
	self.pause = function(){
		//self.PLAYING = false;
		//Narrator.pause();
	};
	self.play = function(){
		self.PLAYING = true;
		//Narrator.play();
	};

})();
