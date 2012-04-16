//simple class system

var Stub=(function(){
    
    var mixer = function(client,server){
	for(var e in server){
	    client[e] = server[e];
	}
    };

    var class_methods = {

	inherit: function(parent){
		if(typeof parent !== "function"  && typeof parent !== "object"){
			throw new Error("argument given is not an object or function!");
		}
		
		if(!this.prototype._super){
	    		var pro = parent.prototype;
	    		var self = this.prototype;
	    		self._super = pro;
	    
	    		for(var e in pro){
				if(!self[e]){    
		    		self[e] = pro[e];
				}
	    		}
	    	return true; 
	    }
	    
	    return false;
	},
	
	extend: function(ability){
	    if(typeof ability !== 'object'){
		throw new Error('Argument passed is not an Object!');
	    }
	    var self = this;
	    for(var e in ability){
		    self[e] = ability[e];
	    }
	    return;
	},
	
	include: function(ability){
	    if(typeof ability !== 'object'){
		throw new Error('Argument passed is not an Object!');
	    }
	    var self = this.prototype;
	    for(var e in ability){
		    self[e] = ability[e];
	    }
	    return;
	},

    };

    var proto_methods = {
	
	map: function(obj,callback){
	    var result = [],self=this;
	    
	    if(!obj.each){
		self.onEach(obj,function(o,b){
		    result.push(callback.call(this,o));
		});
		return result;
	    }else{
	        obj.each(function(){
		     result.push(callback.call(this,o));
		});
		return result;
	    }
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
	    if(this.isObjectType(obj,'array') || this.isObjectType(obj,'string')){
		for(var i=0; i < obj.length; i++){
		    callback.call(scoped,obj[i],obj,i);
		}
		return;
	    }

	    if(this.isObjectType(obj,'object')){
		for(var e in obj){
		    callback.call(scoped,e,obj);
		}
		return;
	    }
	},

	objectType: function(){
	    var self = this;
	    return ({}).toString.call(self).match(/\s([\w]+)/)[1].toLowerCase();
	},

	isObjectType: function(obj,type){
	    return ({}).toString.call(obj).match(/\s([\w]+)/)[1].toLowerCase() === type.toLowerCase();
	},

	has: function(method,obj){
	    if(!method || typeof method != 'string'){
		throw new Error("Argument being passed is not a string!");
	    }
	    var status=false;
	    
	    this.each(function(n,obj){
		if(method === n){
		    status = true;
		    console.log(method,":",typeof obj[method]);
		}
	    });
	    return status;
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

	triggerEvent: function(event,name,arg){
		var list = this.events;
				
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
	
	proxy: function(){}
    };

    return {
    
    map: proto_methods.map,
    isObjectType: proto_methods.isObjectType,
	onEach: proto_methods.onEach,
	
	create: function(ability){
	    
	    function Stub(){
	    	this.events={
				'nameSpace':{},
				'eventSpace':{}
			};
	
		if(this._super){
		    this._super.constructor.call(this);
		}
		if(this.initialize){
		    this.initialize.apply(this,arguments);
		}
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
	
	    return Stub;
	}
    };

})();
