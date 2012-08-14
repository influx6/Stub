(function(){

   //all functions/methods with an '_' starting their names are hidden and are
   //not to be called directly unless you need to test those specific
   //operations directly,please use such a convention for a better modularizing
   //of code

   var root = this;
   

   var previousStubs = root.Stubs;
   var event_split = /\s+/;
   var eventnms = /^([a-zA-Z0-9-_]+):([a-zA-Z0-9-_]+)/;
   var wrd_match = /^\w+/;


   //create local copy common methods
   var _pusher = Array.prototype.push;
   var _slicer = Array.prototype.slice;
   var _splicer = Array.prototype.splice;


   var Stubs;

   if(root.exports !== undefined){
      Stubs = exports;
   }else{
      Stubs = root.Stubs = function(){};
   }

   Stubs.noConflict = function(){
     root.Stubs = previousStubs;
     return this; 
   };

   //the current in use version of Stub
   Stubs.version = "0.3.1";


   //this class level method handles classic-type inheritance,ensure to use it before
   //assigning any properties to the child prototype,incase of using the stub class without
   //using its create method
   Stubs.inherit = function(child,parent){
      
      function empty(){};
      empty.prototype = parent.prototype;
      
      child.prototype = new empty();
      
      child.prototype.constructor = child;
       child.parent = parent.prototype;
      
      parent.prototype.constructor = parent;

   };

   //nice if you want to share some specific features which to other objects like the onEach
   //method or the map method or any method which a non-instanciated method has in its prototype
   Stubs.share = function(obj,set){
      var client = obj, server = this.prototype;
      
      for(var i = 0; i < set.length; i++){
         var c = set[i];
         if(!client[c] && server[c]){
            client[c] =  server[c];
         }
      }
      
   };

   //Stubs.SU (SU = Stub Utility)
   //Stubs utility functions for handling different ops like extend ,custom splice,etc.
   
      // createProperty the Stubs.SU equivalent for Object.defineProperty
      //fns is an object contain the necessary set and get func you wish to set
      //on the object obj, props are properties from emscript5 spec u want to
      //set on the object,its optional

      /*createProxyFunctions does just that,creates a proxy of another objects
      functions onto a different object,basicly releaves you from writing those
      proxy functions all by urself,saves times so it was implementated as
      part of Stubs.SU, main job is to give another object access to
      different method which are not necessary copied to it but rather called 
      in the context of it,not to be mistaken with Jquery proxy which
      executes a function against the origin parent to keep scope to an object
      */
         /* Arguments: from(object to proxy from), to(object to proxy to),
         context(custom context to use,if unspecified it will default to the
          {To} object,since we want to execute them in the context of the to,but 
          feel free to specify it to the {From} object to execute in context of
          the real object being proxied
        */
      
   Stubs.SU = {

      createProxyFunctions: function(from,to,context){
          if(!context) context = to;

          this.onEach(from,function(e,i,b){
             if(!this.matchType(e,"function")) return;
             to[i] = function(){ 
                return b[i].apply(context,arguments);
             }
          },this);
      },

      createProperty: function(obj,name,fns,props){
         if(!("defineProperty" in Object) && Object.__defineGetter__ && Object.__defineSetter__){
            if(fns.get) obj.__defineGetter__(name,fns.get);
            if(fns.set) obj.__defineSetter__(name,fns.set);
            return;
         }

         Object.defineProperty(obj,name,{
            get: fns.get, set: fns.set
         });
         return;
      },

      makeMethodChain: function(methodname,func,scope){
         scope[methodname]=func;
         return this;
         //simple lets u create methods in chains onto an object
         //simple makeMethodChain('thismethod',func).makeMethodChain('anothermethod',func) etc.
      },

      makeChainable: function(methodname,func,scope){
         scope[methodname]= function(){
            func.apply(scope,arguments);
            return scope;
         };
         return this;

         //simple mechanism to add chainable methods to an object, please specify scope to be the object or object's prototype,or just 
         //extend object with this method to use it directly from them
      },

      extends:function(){
         var obj = arguments[0];
         var args = Array.prototype.splice.call(arguments,1,arguments.length);
         
         Stubs.SU.onEach(args,function(o,i,b){
            if(o  !== undefined && typeof o == "object"){
               for(var prop in o){
                     var g = o.__lookupGetter__(prop), s = o.__lookupSetter__(prop);
                     if(g || s){ this.createProperty(obj,prop,{get:g, set:s}); }
                     else{
                        obj[prop]=o[prop];
                  }
               }
            }
         },this);

         //this methods handles all managing of copying methods back and forth between objects,the first arguments
         //is the object to be copied to and the rest the objects to copy from
      },
      
      contains: function(o,value){
         var state = false;
         this.onEach(o,function(e,i,b){
            if(e == value) {
               state = true; 
            }
         },this);

         return state;
      },

      //handles iteration of both of any and anyObject 
      /*  when supply the property always remember to skip the keys,that is the
       *  top level name used to access each inner object,u search for the
       *  property within that property that matches the specific value like eg:
       *  var s = { b:'sucker' ,s:{ k:{ live: true}, v:'a',live: false}, g:{ v:'aa',live:true}}; 
       *  Stubs.SU._anyIterator(s,['k','live'],true);
       */
      _anyIterator: function(o,property,value){

         var keys = this.keys(o);
         for(var i=0,len = keys.length; i < len; i++){
             var item = o[keys[i]];
             if(!property){  
                if(item === value){
                  return keys[i];
                  break;
                } 
             }
             if(property && !this.isArray(property)){
                if(item[property] === value){
                   return keys[i]; 
                   break;
                }
             }
             if(property && this.isArray(property)){
                var tail=item[0],plen = property.length;
                for(var j = 1; j < plen; j++){
                   tail = tail[property[j]];
                }
                console.log(tail);
                if(tail === value){
                   return keys[i];
                   break;
                }
             }
         }
      },
     
      // returns the position of the first item that meets the value
      any: function(o,value){
         for(var i=0,len = o.length; i < len; i++){
            if(value === o[i]){
               return i;
               break;
            }
         }
         return false;
      },

      /* returns the key of the first item that meets the value
      *  @{Params} Object: the object to be checked
      *  @{Params} Property: a value or array of values to check on the object if it has
      *  a inner object or set as null to just check,it will go as deep into
      *  the object as the number of property giving,so know your object and
      *  the level of deepness of each key:object pair
      *  against value
      *  @{params} Value: value to check against in the object
      */
      anyObject: function(o,property,value){
         if(!this.isObject(o)) return;
         
         //returns the attribute or parent object in case of deep level
         //property searches that contains the specific value against the specific 
         //property
         /*
         var find = this._anyIterator(o,property,value);

         console.log(find);
         if(find) return find;
         */
         return false;
      },

      //mainly works wth arrays only
      //flattens an array that contains multiple arrays into a single array
      flatten: function(arrays){
         var flat = [];
         this.onEach(arrays,function(a){

            if(this.isArray(a)){
               this.onEach(a,function(e){
                  flat.push(e);
               },this);
            }else{
               flat.push(a);
            }

         },this);

         return flat;
      },

      filter: function(array,fn,scope){
         var result=[],scope = scope || this;
         this.onEach(array,function(e,i,b){
           if(fn.call(scope,e,i,b)){
              result.push(e);
           }
         },scope);
         return result;
      },

      occurs: function(o,value){
         var occurence = 0;
         this.onEach(o,function(e,i,b){
               if(e == value) occurence += 1; 
         },this);
         return occurence;
      },

      splice: function(o,start,end){
         //dummy function -- still awaiting implementation
         //splice for better gc reduction
         if(!this.isArray(o)){
               return false;
         }
      },
      
      explode: function(){
         if(arguments.length == 1){
            if(this.isArray(arguments[0])) this._explodeArray(arguments[0]);
            if(this.matchType(arguments[0],"object")) this._explodeObject(arguments[0]);
         }
         if(arguments.length > 1){
            this.onEach(arguments,function(e,i,b){
               if(this.isArray(e)) this._explodeArray(e);
               if(this.matchType(e,"object")) this._explodeObject(e);
            });
         }
      },

      _explodeArray: function(o){
         if(this.isArray(o)){
            this.onEach(o,function(e,i,b){
               delete b[i];
            },this);
			o.length = 0;
         };

         return o;
      },
      
      _explodeObject: function(o){
         if(this.matchType(o,"object")){
            this.onEach(o, function(e,i,b){
               delete b[i];
            },this);
            if(o.length) o.length = 0;
         }
         
         return o;
      },
      
      is: function(prop,value){
         return (prop === value);
      },
      
      onEach: function(obj,callback,scope){
         
          if('length' in obj || this.isArray(obj) || this.matchType(obj,"string")){
            for(var i=0; i < obj.length; i++){
               callback.call(scope,obj[i],i,obj);
            }
            return;
          }

          if(this.matchType(obj,'object') || typeof obj === "object"){
            for(var e in obj){
               callback.call(scope,obj[e],e,obj);
            }
            return;
          }
      },
      
      map: function(obj,callback,scope){
          var result = [];
         
         Stubs.SU.onEach(obj,function(o,i,b){
            var r = callback.call(scope,o,i,b);
            if(r) result.push(r);
         },scope);
         return result;
      },

     //you can deep clone a object into another object that doesnt have any
     //refernce to any of the values of the old one,incase u dont want to
     //initialize a vairable for the to simple pass a {} or [] to the to arguments
     //it will be returned once finished eg var b = clone(a,{}); or b=clone(a,[]);

     clone: function(from,to){
           this.onEach(from,function(e,i,b){

                if(this.isArray(e)){
                     if(!to[i]) to[i] = [];
                     this.clone(e,to[i]);
                     return;
                }
                if(this.isObject(e)){
                     if(!to[i]) to[i] = {};
                     this.clone(e,to[i]);
                     return;
                }

                to[i] = e;
           },this);
           return to;
    },
  

      matchType: function(obj,type){
          return ({}).toString.call(obj).match(/\s([\w]+)/)[1].toLowerCase() === type.toLowerCase();
      },
      
      isRegExp: function(expr){
         return this.matchType(expr,"regexp");
      },

      isString: function(o){
         return this.matchType(o,"string");
      },

      isObject: function(o){
         return this.matchType(o,"object");
      },

      isArray: function(o){
         return this.matchType(o,"array");
      },
      
      isFunction: function(o){
         return (this.matchType(o,"function") && (typeof o == "function"));
      },
      
      isNumber: function(o){
         return this.matchType(o,"number");
      },
      has: function(obj,property,callback){
         var state = false;
         
         if(!obj){ obj = this; }
         
         state = (property in obj);
         
         if(state){ 
            if(callback){
               callback.call(this);
            } 
         }
         
         return state;
      },


      proxy: function(scope,fn){
         return function(){
            return fn.apply(scope,arguments);
         };
      },
      
      pusher: function(){
			var slice = [].splice.call(arguments,0),
			focus = slice[0],rem  = slice.splice(1,slice.length);
						
			this.onEach(rem,function(e,i,b){
				_pusher.call(focus,e);
			});
		    return;
			
       },

	 keys: function(o,a){
		var keys = a || [];
		Stubs.SU.onEach(o,function(e,i,b){
			keys.push(i);
		});
		return keys;
	 },
	
	 values: function(o,a){
		var keys = a || [];
		Stubs.SU.onEach(o,function(e,i,b){
			keys.push(e);
		});
		return keys;
	 },
	
	isArgument: function(o){
		return this.matchType(o,"arguments")
	},
	
	//normalizes an array,ensures theres no undefined or empty spaces between arrays
	normArray: function(a){
		if(!a || !this.isArray(a)) return; 
		
		var start = 0, len = a.length;
		for(var i=start;i < len; i++){
			if(a[i] != undefined){
				a[start]=a[i];
				start += 1;
			}
		}
		
		a.length = start;
		return a;
	}
	
   };
  
   Stubs.Events = {

      //the main handle of all queries to the event object, writing to minimize 
      // and pack as much get and put operation as possible without overloading
      //itself, arguments are the key i.e the main event, ns - the type/namespace
      // isGet - boolean indicate a only retrieval operation
      
        withKey: function(key,ns,isGet){
         if(!this.events) this.events = {};
         var that = this,
         event = function(){
            if(!that.events[key] && !isGet){ 
               that.events[key] = that.createRootFragment();
            }
            event = that.events[key];
            return that.events[key];
         }(),ns;
         
         if(!ns){ return event; }
         
         if(!event[ns] && !isGet){
            event[ns] = [];
         }
          //ns.parent = event;
         
         return event[ns];
        },
      
     
      unContext: function(ens,callback,context){
            Stubs.SU.onEach(ens, function(e,i,b){
               if(!callback && context && (e.context === context)){
                  delete b[i]; return;
               }

               if(callback && !context && (e.fn === callback)){
                   delete b[i]; return;
               }

               if(callback && context && ( e.fn === callback) && (e.context === context)){
                   delete b[i]; return;
               }
            });
            
            Stubs.SU.normArray(ens);
      },
      
     createRootFragment: function(){
            return { all:[] };
         },

     createFragment: function(key,callback,context){
                return ({ key:key,fn:callback,context:context });
       },

       _withMultiple: function(es,callback,context,isOn){
            var keys = es.split(event_split),that = this;

            if(keys.length == 1){ 
               if(keys[0].match(eventnms)){
                  keys =  keys[0].match(eventnms);
                  if(!isOn){
                     this._unEvent(keys[1],keys[2],callback,context);
                     return;
                  }
                  this._withEvent(keys[1],keys[2],callback,context);
                  return;
               }

               keys = keys[0];
               if(!isOn){
                  this._unEvent(keys,null,callback,context);
                  return;
               }
               this._withEvent(keys,"all",callback,context);
               return;

            }else{
               Stubs.SU.onEach(keys,function(e,i,n){
                  if(e.match(eventnms)){
                     var ev = e.match(eventnms);
                     if(!isOn){
                        this._unEvent(ev[1],ev[2],callback,context);
                        return;
                     }
                     this._withEvent(ev[1],ev[2],callback,context);
                     return;
                  }
                  if(!isOn){	
                     this._unEvent(e,null,callback,context);
                     return;				
                  }
                  this._withEvent(e,"all",callback,context);
                  return;
               },this);
            }
      },

       _withEvent: function(es,space,callback,context){
            if(!es && !space){ return; }

            var e = this,event;

            event = e.withKey(es,space);
            event.push(e.createFragment(es+":"+space,callback,context));

            return;
       },

       _unEvent: function(es,space,callback,context){
         var e = this,event;

         if(!es && !space && !callback && !context){
            Stubs.SU.explode(e.events);
            return;
         }

         if(!e.withKey(es,null,true) || !e.withKey(es,space,true)){ 
            return; 
         }

         if(es && !space && !callback && !context){
            Stubs.SU.explode(e.withKey(es,null,true));
            return;
         }

         if(es && space && !callback && !context){
            Stubs.SU.explode(e.withKey(es,space,true));
            return;
         }

         if(es && !space && !callback && context){
            Stubs.SU.onEach(e.withKey(es,null,true),function(k,i,b){
               e.unContext(k,null,context);
            });
            return;
         };

         if(es && !space && callback && context){
            Stubs.SU.onEach(e.withKey(es,null,true),function(k,i,b){
               e.unContext(k,callback,context);
            });
            return;
         };
         
         if(es && !space && callback && !context){
            Stubs.SU.onEach(e.withKey(es,null,true),function(k,i,b){
               e.unContext(k,callback,null);
            });
            return;
         };

         if(es && space && callback && context){
            e.unContext(e.withKey(es,space,true),callback,context);
            return;
         }
       },
      
       //due for the need of readability this method is created to encapsulate
        //the true firing operation on all events located within the specific
        //event array
     _withFire: function(o,args){

            var keys,fire = function(array){
               if(array.length == 0) return;
               Stubs.SU.onEach(array,function(e,i,b){
                  if(!Stubs.SU.isObject(e) || !e.fn || !Stubs.SU.isFunction(e.fn)) return;
                  e.fn.apply(e.context ? e.context : this,args);
               },this);
               return;
            }

            if(Stubs.SU.isArray(o)){
               fire(o); return;
            };

            if(Stubs.SU.isObject(o)){
               keys = Stubs.SU.keys(o);
               Stubs.SU.onEach(keys,function(e,i,b){
                   fire(o[e]);
               },this);
              return;
            };

            return;
        },
	
     on:function(es,callback,context){
         if(!es || !callback){ return; }

         var keys;
	

	// .on is specific, it allows events in the form of the following:
		/* 'all' special stack,if called as .on('all') events are added to the 'all'
			special stack,which is fired on all events 
		*/ 
			
		/* 'event:namespace',if called will add the event to the specific event on a
			specific type or namespace of that event 
		*/
			
		/* 'event:all' or 'event', this is the only way that addiction will be made to 
			the specific event all stack i.e events to be fired whatever the name-
			space of the type being fired as far as it falls in the event type or 
			every event created as a special :all stack themselves,where callbacks
			are stored incase only the .on('event') or .on('event:all') is supplied
			the more specific version,the all stack of the event will be fired on 
			every fire of which ever namespace in that event,so add 'all' stack
			if you only need to listen to all types of event or create a namespace
			in that event for better symantics 
		*/
        
			//general case use "change" or "change:name" or "edit:article" etc
			
	         if(es == "all"){ 
                this._withEvent(es,es,callback,context);
                return;
	         }

            //major workhorse here ,handling the real work here 
            this._withMultiple(es,callback,context,true);
            return;
      },
	

	 // off simple unbinds an event from the object
    // {params} es - represent the event you wish to unbind from you can write
    // in colom to specific the specific event eg name:change or just specify
    // the main event eg name ,be left as null
    // {params} callback - incase you specified a non-anonnymouse function,you
    // can pass this to match the function to specifically remove,it can be
    // left as null
    // {params} context - this specify the context of the specific function to
    // be removed,it can be left as null 
     off: function(es,callback,context){
			var keys;
			
			if(!es && !callback && !context){
				this._unEvent(null,null,null,null);
				return;
			};
			
			//special all or *:all event triggers removal of all events 
			// from all event types with their respective various namespace types
			
			if(es == "*:all"){
				keys = Stubs.SU.keys(k.events);
				Stubs.SU.onEach(keys,function(e,i,b){
					this._unEvent(e,"all",callback,context);
				},this);	
				return;			
			};
			
      	//special all or all:all event triggers removal of all events 
			//from the special all stack
			if(es == "all"){
				this._unEvent(es,es,callback,context);
				return;
			};
			
			if(!es && !callback,context){
				keys = Stubs.SU.keys(this.events);
				Stubs.SU.onEach(keys,function(e,i,b){
					this._unEvent(e,null,callback,context);
				},this);	
				return;
			};

			if(!es && callback && !context){
				keys = Stubs.SU.keys(this.events);
				Stubs.SU.onEach(keys,function(e,i,b){
					this._unEvent(e,null,callback,null);
				},this);	
				return;
			};
			
			if(!es && callback && context){
				keys = Stubs.SU.keys(this.events);
				Stubs.SU.onEach(keys,function(e,i,b){
					this._unEvent(e,null,callback,context);
				},this);	
				return;
			};

		 	this._withMultiple(es,callback,context,false);
			return;
		
      },

    

     emit: function(event){
        if(!event){ return; }
        
        var keys = event.split(event_split),
            args = [].splice.call(arguments,1);
         
        if(event == "all"){
            this._withFire(this.withKey("all","all",true),args);
            return;
        };

         this._withFire(this.withKey("all","all",false),args);

			if(keys.length == 1){ 
				if(keys[0].match(eventnms)){
					keys =  keys[0].match(eventnms);
               this._withFire(this.withKey(keys[1],keys[2],true),args);
               this._withFire(this.withKey(keys[1],"all",true),args);
					return;
				}
				
				keys = keys[0];
            this._withFire(this.withKey(keys,null,true),args);
            this._withFire(this.withKey(keys,"all",true),args);
				return;
				
			}else{
            
				Stubs.SU.onEach(keys,function(k,i,n){
					if(k.match(eventnms)){
						var ev = k.match(eventnms);
                  this._withFire(this.withKey(ev[1],ev[2],true),args);
                  this._withFire(this.withKey(ev[1],"all",true),args);
						return;
					}
            
               this._withFire(this.withKey(k,null,true),args);
               this._withFire(this.withKey(k,"all",true),args);
					return;
				},this);
			};

        return;
     }
      
   };
   //the stub create function to create new classes with specific className,
   //ability(just a bunch of functions and attributes you want it to have),
   //and can specific a parent to inherit from 
   //ability can contain a static and instance object within themselves
   //that allow you to specify static properties that the Stub object should have
   //and the instance only properties
   //basic js object to be created and returned with abilitys

   Stubs.create = function(classname,ability,parent){
      
      var Stub = function(){
         
         if(!(this instanceof arguments.callee)){
            return new arguments.callee;
         }
      };
      
      
      if(parent){ Stubs.inherit(Stub,parent)};
      
      Stubs.SU.extends(Stub.prototype,Stubs.prototype,Stubs.Events);
      
      
      if(ability){
         if(!ability.instance && !ability.static){ 
            Stubs.SU.extends(Stub.prototype, ability);
         }
         if(ability.instance){ 
            Stubs.SU.extends(Stub.prototype, ability.instance);
         }
         if(ability.static){ 
            Stubs.SU.extends(Stub,ability.static);
         }
      }
      
      //shortcut to all Stub objects prototype;
      Stub.fn = Stub.prototype;
      //sets the className for both instance and Object level scope
      Stub.ObjectClassName = Stub.fn.ObjectClassName = classname;
      
      Stub.fn.setup = function(){
         if(Stub.parent){
            Stub.parent.constructor.apply(this,arguments);
            this.super = Stub.parent;
            if(this.super.init && typeof this.super.init == 'function'){
               this.super.init.apply(this,arguments);
            }		
         }
        
         if(this.init && typeof this.init == 'function'){
            this.init.apply(this,arguments);
         }
         
         return this;
      };
      
      Stub.extend = Stubs.extend;
      Stub.share = Stubs.share;
      return Stub;
   };

   //allows a direct extension of the object from its parent directly
   Stubs.extend = function(name,ability){
      return Stubs.create(name,ability,this);
   };

   //desired to reduce size of object being created by stubs,removing and modularizing common functions but having to deal with extra namespace call when in need of this specific functions,if there is the desire to use this from objects directly,simple use Stubs.share to grant capability to object,prefer simple grant each instead of onEach,but its left to personal taste.

   //its very ,very,reddiculously fast to copy attributes and functions between prototypes
   //just specific properties that should exists in instance level
   // like eventsStack objects for doing pubsub like event handling within an object,
   //its couple with the objects but this system does still allow the use of mediators
   //between different objects if need be to handle calling the specific eventsStack from
   //between different objects,the mediator is nothing more than a simple function or
   //objects that gets the eventsStack of each objects and passes the appropriate arguments
   //to them

 Stubs.Atom = (function(){

//name usually means what specific object is this atom for,each Contacts, Books
     	var atom  = function(name){
              this.atomClass = "Atom:"+name;
              this.atomName = name;
              this.data = {};
              this.events = {};
              this.mutants = {};
              this.isMutant = false;
        };

      Stubs.SU.extends(atom.prototype,Stubs.Events,{
			 //mutate seems a better word than split 
         mutate: function(name){
             if(!name){ name = this.atomName;}

             var a = new this.constructor("Mutated:"+name); 
             //copying all properties to new object
             a.events = Stubs.SU.clone(this.events,{});
             a.data = Stubs.SU.clone(this.data,{});

             var elist = arguments.length == 2 ? arguments[1] : [].splice.call(arguments,1);

             if(elist === "all") { 
                Stubs.SU.onEach(Stubs.SU.keys(this.data),function(e,i,b){
                  this.on(e+":change",function(){
                      a.set(e,this.get(e));
                  });
                },this);
             }
             
             if(Stubs.SU.isArray(elist) && elist.length > 0 ){ 
                var keys = Stubs.SU.keys(this.data);
                Stubs.SU.onEach(elist,function(e,i,b){
                  if(Stubs.SU.contains(keys,e)){
                     this.on(e+":change",function(){
                         a.set(e,this.get(e));
                     });
                  }
                },this);
             }


             this.isMutant = true;
             this.mutants[name]=a;
             return a;
         },
      
         toString: function(){
               return this.atomName;
         },
      
         _electron: function(value){
            return { value:value, oldvalue:value, hasOnce:false };
         },

         _retrieve: function(k){
            return this.data[k];
         },

         _addDefaultAtomEvents: function(i){
            this.withKey(i,"once");
            this.withKey(i,"change");
            this.withKey(i,"destroy");
         },
         
         onOnce: function(attr,callback,context){
            if(!this._retrieve(attr)) return;
            var item  = this._retrieve(attr);
            this.on(attr+":once",callback,context);
            item.hasOnce = true;
         },
         
         _withSet: function(attr,value){
            if(!this._retrieve(attr)){
               this.data[attr]=this._electron(value);
               this._addDefaultAtomEvents(attr);
            }
            var item = this._retrieve(attr); item.value = value;
            if(item.value != item.oldvalue){
               this.emit(attr+":change");
               if(item.hasOnce){ this.emit(attr+":once"); this.off(attr+":once"); item.hasOnce = false;}
               item.oldvalue = item.value;
            }
         },

         set: function(attr,value){
               if(!Stubs.SU.isObject(attr)){
                  this._withSet(attr,value);
                  return;
               }

               Stubs.SU.onEach(attr, function(e,i,b){
                  this._withSet(i,e);
               },this);
               return;
         },

         get: function(ekey){
            return this._retrieve(ekey).value;
         },

         eject: function(ekey){
            this.emit(ekey+":destroy");
            Stubs.SU.explode(this._retrieve(ekey));
            this.off(ekey);
         },

         destroy: function(withMutants){
            var keys = Stubs.SU.keys(this.data);
            Stubs.SU.onEach(keys,function(e,i,b){
               this.emit(e+":destroy");
            },this);

            Stubs.SU.explode(this.data);
            Stubs.SU.explode(this.events);
            Stubs.SU.explode(this.mutants);
            Stubs.SU.explode(this);
         } 
      });

         return {
            emitAtom: function(name){
                  return new atom(name);
            }
         };
   })();

   Stubs.prototype = {

      setup : function(){
         if(Stubs.parent){
            Stubs.parent.constructor.apply(this,arguments);
            this.super = Stubs.parent;
            if(this.super.init && typeof this.super.init == 'function'){
               this.super.init.apply(this,arguments);
            }
         }
         
         if(this.init && typeof this.init == 'function'){
            this.init.apply(this,arguments);
         }
         
         return this;
      },
      

      isType: function(){
          var self = this;
          return ({}).toString.call(self).match(/\s([\w]+)/)[1].toLowerCase();
      },

      each: function(callback){
          var self = this;
         var index = 0;
         
          for(var e in self){
            callback.call(self,self[e],index,self);
            index +=1;
          }
      },
      

      hasOwn: function(property,callback){
         return (
            (property in this) && Stubs.SU.is(this.constructor.prototype[property],undefined)
         );
      },
      
      proxy: function(fn){
         var self=this;
         return fn.apply(this,arguments);
      },
      
      triggerFunc: function(method,scope){
         var self = this;
         if(self[method]){
            return self[method].apply(scope,arguments);
         };
      },
      
   };

	// yes name is taken from a library called atom on github,but Stub.atom is more specific
	// that is mainly for handling events on changes on attributes,like getting and setting 
	// an attribute which will fire their own events,very good when desiring a finegrain
	//control on attributes with in an object such as Models attributes in the MVC pattern
	
  

}).call(this);
