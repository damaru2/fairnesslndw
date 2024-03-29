function Connection(scene){
	
	var self = this;

	// Connection properties
	self.from = null;
	self.to = null;
	self.capacity = null;
	self.speed = 3.5;

	// Strength
	self.strength = 1;
	self.strengthEased = 0;

	// Pulses
	self.pulses = [];
	self.pulse = function(signal){
		// Only send down the signal if the strength is actually good!
		if(self.isConnected()){
			signal.distance = 0; // reset signal's distance!
			self.pulses.push(signal);
		}

	};

	// Connect
	self.connect = function(from,to,capacity){
		self.from = from;
		self.to = to;
		self.capacity = capacity;
		from.senders.set(to.id.toString(), self);
		//to.receivers.push(self);

		// For special-colored neurons
		if(from.connectionStrokeStyle){
			self.strokeStyle = from.connectionStrokeStyle;
		}

	};

    /*
	// Disconnect
	self.disconnect = function(){
		self.dead = true;
		self.from.senders.splice(self.from.senders.indexOf(self),1);
		self.to.receivers.splice(self.to.receivers.indexOf(self),1);
	};

	// Strengthen
	self.strengthen = function(){
		self.strength += 1;
		if(self.strength>1) self.strength=1;
	};

	// Weaken
	self.weaken = function(){
		self.strength -= 0.05;
		//self.strength -= 1;
		if(!self.isConnected()) self.strength=0;
	};
    */

	// Am I Connected?
	self.isConnected = function(){
		return(self.strength>=0.94);
	};

	// UPDATE
	self.update = function(timer, scene, initial){

		// Pythagorean Distance
		var dx = self.from.nx-self.to.nx;
		var dy = self.from.ny-self.to.ny;
		var distance = Math.sqrt(dx*dx+dy*dy);

		// Have all signals go down the wire
		// at a constant "actual length" rate
		for(var i=0;i<self.pulses.length;i++){
			var pulse = self.pulses[i];
			pulse.distance += self.speed;
            if(scene.flow_changed){
                pulse.flow = scene.flows[pulse.type].get(self.from.id.toString())[self.to.id.toString()];
            }

			// Oh, you've reached the end?
			if(pulse.distance>=distance){
				self.to.pulse(pulse); 

				// Remove this pulse from the wire
				self.pulses.splice(i,1);
				i--;

			}
		}

		// Animation
		self.lineWidth = self.fullLineWidth * (self.capacity/100);
		//self.lineWidth = (self.strength<1) ? self.fullLineWidth/2 : self.fullLineWidth;
        self.strengthEased = self.strengthEased*0.9 + self.strength*0.1;
        if(!initial){
            self.easedLineWidth = self.easedLineWidth*0.9 + self.lineWidth*0.1;
        }
	};

	self.strokeStyle = "#aaaaaa";
	self.strokeStyleSaturated = "#ffaaaa";
	self.fullLineWidth = 45;
	self.lineWidth = self.fullLineWidth * (self.capacity/100);
	self.easedLineWidth = self.lineWidth;
	self.pulseRadius = 8;
	//self.endDistance = 35;
	self.endDistance = 0;

	self.draw = function(ctx){

		// save
		ctx.save();

		// translate & rotate so it's from LEFT TO RIGHT
		var from = self.from;
		var to = self.to;
		var dx = from.nx-to.nx;
		var dy = from.ny-to.ny;
		var distance = Math.sqrt(dx*dx+dy*dy);
		var angle = Math.atan2(dy,dx);
		ctx.translate(from.nx,from.ny);
		ctx.rotate(angle+Math.PI);

		// Draw connection at all?!
		//var endX = (distance*self.strengthEased)-self.endDistance;
        var endX = distance
		if(endX>0){
            capacity = self.capacity;
            for(var i=0;i<self.scene.flows.length;i++){
                from = self.from.id.toString();
                to = self.to.id;
                if(self.scene.flows[i].get(from) && self.scene.flows[i].get(from)[to])// If the edge exists, decrease  
                    capacity -= self.scene.flows[i].get(from)[to];
            }
            // TODO have the eps variable be accesible from here and substitute 0.2 by eps/2 or so 
            ctx.strokeStyle = capacity > window.Narrator._GLOBAL_.eps / 2 ? self.strokeStyle : self.strokeStyleSaturated;

			// draw a line
			var offsetY = 0;
			ctx.lineWidth = self.easedLineWidth;
			ctx.lineCap = 'butt';
			ctx.beginPath();
			ctx.moveTo(0, offsetY);
			ctx.lineTo(endX, offsetY);
			//ctx.lineTo(endX+self.pulseRadius, offsetY-self.pulseRadius);
			//ctx.moveTo(endX, offsetY);
			//ctx.lineTo(endX+self.pulseRadius, offsetY+self.pulseRadius);
			ctx.stroke();

		}

		// draw all pulses
		for(var i=0;i<self.pulses.length;i++){
			var pulse = self.pulses[i];
            colors = ['#f00', '#0f0', '#00f', '#ff0','#f0f','#0ff','#fff' ];
            //colors = ['#ea0', '#0a7', '#5be', '#fe4','#f0f','#0ff','#fff' ];
            fillStyle = colors[pulse.type];
			ctx.fillStyle = fillStyle; // DAVID TODO use a dictionary that should be in the info that we serialize
			ctx.beginPath();
			ctx.arc(pulse.distance, offsetY, self.fullLineWidth*pulse.flow/100 /2, 0, 2*Math.PI, false);
			ctx.fill();
		}

		// restore
		ctx.restore();

	};

};

Connection.add = function(from,to,capacity,scene){
	
	scene = scene || Interactive.scene;

	// Create the connection
	var connection = new Connection();
	connection.connect(from,to,capacity);

	// Add it
	var connections = scene.connections;
	connections.push(connection);

    connection.scene = scene; // TODO recheck if I want to have a reference to the scene for every connection. Right now I'm using it for the color of the saturated connections

	// Return
	return connection;

};
