var Stubs = function(){};

Stubs.version = "0.0.2";

Stubs.inherit = function(child,parent){
	if(typeof child !== "function"  && typeof child !== "object"){
		throw new Error("first argument given is not an object or function!");
	}
	if(typeof parent !== "function"  && typeof parent !== "object"){
		throw new Error("second argument given is not an object or function!");
	}
	
	var empty = function(){};
	empty.prototype = parent.prototype;
	
	child.prototype = new empty;
	child.prototype.constructor = child;
    child.parent = parent.prototype;

	parent.prototype.construtor = parent;
};

Stubs.share = function(obj,set){
	var client = obj.prototype;
	var server = this.prototype;
	
	for(var i = 0; i < set.length; i++){
		var c = set[i];
		if(!client[c] && server[c]){
			client[c] =  server[c];
		}
	}
	
};

Stubs.slugAbility = function(obj,ability){
	if(typeof ability !== 'object'){
		throw new Error('Argument passed is not an Object!');
    }
    for(var e in ability){
	    obj[e] = ability[e];
    }
    return;
};



Stubs.create = function(classname,ability,parent){
	var Block = function(){
		if(!(this instanceof arguments.callee)){
			var m = new arguments.callee;
			m.init.apply(m,arguments);
			return m;
		}else{
			if(this.init && typeof this.init == "function"){
				this.init.apply(this,arguments);
			}
		}
		
		if(Block.parent){
			Block.parent.constructor.apply(this,arguments);
			this._super = Block.parent;
		}
		
	};
	
	if(parent){ Stubs.inherit(Block,parent); }
	
	Stubs.slugAbility(Block.prototype,Stubs.prototype);
	
	if(!ability.include && !ability.extend){ 
		Stubs.slugAbility(Block.prototype,ability);
	}else{
		if(ability.extend){ Stubs.slubAbility(Block,ability.extend); }
		if(ability.include){ Stubs.slugAbility(Block.prototype,ability.include); }
	}
	
	Block.className = Block.prototype.className = classname;
	Block.fn = Block.prototype;
	Block.events = Block.prototype.events;
	
	return Block;
};

Stubs.prototype = {
	
	
	events : {
		'nameSpace':{},
		'eventSpace':{}
	},
	
	map: function(obj,callback,scope){
	    var result = [];
		if(!scope){ scope = this; }
		
		this.onEach(obj,function(o,b,i){
			var r = callback.call(scope,o,b,i);
			if(r) result.push(r);
		},scope);
		return result;
	},

	each: function(callback){
	    var self = this;
	    for(var e in self){
		callback.call(self,e,self);
	    }
	},
	
	onEach: function(obj,callback,scope){
		var scoped=scope;
		if(!scope){ scoped = this; }
		
	    if('length' in obj || this.isObjectType(obj,"array") || this.isObjectType(obj,"string")){
			for(var i=0; i < obj.length; i++){
		    	callback.call(scoped,obj[i],obj,i);
			}
			return;
	    }

	    if(this.isObjectType(obj,'object') || typeof obj === "object"){
			for(var e in obj){
		    	callback.call(scoped,e,obj);
			}
			return;
	    }
	},
	
	getObjectType: function(obj){
		return ({}).toString.call(obj).match(/\s([\w]+)/)[1].toLowerCase();
	},
	
	objectType: function(){
	    var self = this;
	    return ({}).toString.call(self).match(/\s([\w]+)/)[1].toLowerCase();
	},

	isObjectType: function(obj,type){
	    return ({}).toString.call(obj).match(/\s([\w]+)/)[1].toLowerCase() === type.toLowerCase();
	},
	
	has: function(property,obj){
		var state = false;
		this.onEach(obj,function(o,b,i){
			if(o == property){
				state = true;
			}
		},this);
		
		return state;
	},
	
	initEventList: function(o){
		var list = this.events.eventSpace;
		if(this.isObjectType(o,"array")){
			this.onEach(o, function(e){
				list[e]=[];
			},this);
		}else{
			list[o]=[];
		}
	},
	
	bindEvent: function(namespace,event,fn){
	    var list = this.events;
	    if(!namespace || !event || !fn){
		  throw new Error("Incorrect number of arguments were giving!"); return;}
		
		if(!list.nameSpace[namespace]){ 
				list.nameSpace[namespace]=fn;
				if(!list.eventSpace[event]){
					list.eventSpace[event] = [];
				};
		}else{
			console.error("Namespace already being Used!");
			throw new Error("Namespace already being Used!");
		}
		
		list.eventSpace[event].push(namespace);
	},
	
	unbindEvent: function(event,namespace){
		var list = this.events;
		
		if(!list.nameSpace[namespace]){
			throw new Error("Namespace doesnt exists!");
		}
		
		var e = list.eventSpace[event],match;
		this.onEach(e,function(o,b,i){
			if(o == namespace){
				match=e.splice(i,1);
				delete list.nameSpace[o];
				console.log("Event:",namespace,"removed!");
			}
		},e)
		
	},

	triggerEvent: function(event,arg){
		var list = this.events;
		if(!list.eventSpace[event]) return;
			
		var e = list.eventSpace[event];
		this.onEach(e,function(o,b){
			list.nameSpace[o].apply(this,arg || []);
		},e)
	},

	flushEvents: function(event){
		var list = this.events;
		var e = list.eventSpace[event];
		
		this.onEach(e,function(o,b,i){
			delete list.nameSpace[o];
			e.splice(i,1);
		},e);
		
	},
	
	flushAllEvents: function(){
		var list = this.events;
		list.nameSpace={};
		list.eventSpace ={};
	},
	
	proxy: function(fn){
		var self=this;
		return function(){
			return fn.apply(self,arguments);
		};
	},
	
	trigger: function(method){
		var self = this;
		if(self[method]){
			self[method].apply(this,arguments);
		}
	}
<<<<<<< HEAD
	
    };

    return {
    inherit: inherit,
    map: proto_methods.map,
	getObjectType: proto_methods.getObjectType,
    isObjectType: proto_methods.isObjectType,
	onEach: proto_methods.onEach,
	
	create: function(objectname,ability,parent){
		if(!objectname || typeof objectname !== "string"){ 
			throw new Error("First argument must be the name of the class!")
		};
		
	    function Stub(){
			this.className = objectname;
	    	this.events={
				'nameSpace':{},
				'eventSpace':{}
			};
			
			
			if(Stub.parent){
				Stub.parent.constructor.apply(this,arguments);
				this._super = Stub.parent;
				this.className=objectname;
			}
			
			if(typeof this.initialize == "function"){
		    	this.initialize.apply(this,arguments);
			}
	    };
	    		
		if(parent){
			inherit(Stub,parent);
		};
		
		mixer(Stub,class_methods);
	    mixer(Stub.prototype,proto_methods);

	    Stub.prototype.constructor = Stub;
	    Stub.fn = Stub.prototype;
	    Stub.fn.initialize = function(){};
	
	    
	    if(ability){
			if(ability['extend']){ Stub.extend(ability.extend) };
			if(ability['include']){ Stub.include(ability.include) };
			if(!ability['extend'] && !ability['include']){ Stub.include(ability) };
	    }
		
		Stub.proxy = Stub.fn.proxy;
	    return Stub;
	}
    };
=======
};

Stubs.proxy = Stubs.prototype.proxy;
Stubs.onEach = Stubs.prototype.onEach;
Stubs.map =  Stubs.prototype.map;
Stubs.getObjectType = Stubs.prototype.getObjectType;
Stubs.isObjectType = Stubs.prototype.isObjectType;
>>>>>>> 0.0.2

