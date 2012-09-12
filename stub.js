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
      root.exports = Stubs;
   }else{
      Stubs = root.Stubs = function(){};
   }

   Stubs.noConflict = function(){
     root.Stubs = previousStubs;
     return this; 
   };

   //the current in use version of Stub
   Stubs.version = "0.3.2";

   //config option to decide if stub that are created are to have the
   //Stub.Events available as part of their prototype or not
   Stubs.useEvents = true;

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
 
      //use to match arrays to arrays to ensure values are equal to each other,
      //useStrict when set to true,ensures the size of properties of both
      //arrays are the same
      matchArrays: function(a,b,beStrict){
         if(this.isArray(a) && this.isArray(b)){
            var alen = a.length, i = 0;
            if(beStrict){
               if(alen !== (b).length){ return false; }
            }

            for(; i < alen; i++){
               if(a[i] === undefined || b[i] === undefined) break;
               if(b[i] !== a[i]){
                  return false;
                  break;
               }
            }
            return true;
         }
      },

      //alternative when matching objects to objects,beStrict criteria here is
      //to check if the object to be matched and the object to use to match
      //have the same properties
      matchObjects: function(a,b,beStrict){
         if(this.isObject(a) && this.isObject(b)){

            var alen = this.keys(a).length, i;
            for(i in a){
               if(beStrict){
                  if(!(i in b)){
                     return false;
                     break;
                  }
               }
               if((i in b)){
                  if(b[i] !== a[i]){
                     return false;
                     break;
                  }
               }
            }
            return true;
         }
      },

      memoizedFunction : function(fn){
         var _selfCache = {},self = this;
         return function(){
            var memory = self.clone(arguments,[]),
                args = ([].splice.call(arguments,0)).join(",");
            if(!_selfCache[args]){
               var result = fn.apply(this,memory);
               _selfCache[args] = result;
               return result;
            }
            return _selfCache[args];
         };
      },

      createChainable: function(fn){
         return function(){
            fn.apply(this,arguments);
            return this;
         }
      },

      //takes a single supplied value and turns it into an array,if its an
      //object returns an array containing two subarrays of keys and values in
      //the return array,if a single variable,simple wraps it in an array,
      arranize: function(args){
         if(this.isObject(args)){
            return [this.keys(args),this.values(args)];
         }
         if(this.isArgument(args)){
             return [].splice.call(args,0);
         }
         if(!this.isArray(args) && !this.isObject(args)){
            return [args];
         }
      },

      //simple function to generate random numbers of 4 lengths
       genRandomNumber: function () { 
          var val = (1 + (Math.random() * (30000)) | 3); 
          if(!(val >= 10000)){
              val += (10000 * Math.floor(Math.random * 9));
          } 
          return val;
      },

       makeArray: function(){
         return ([].splice.call(arguments,0));
       },

      //for string just iterates a single as specificed in the first arguments 
       forString : function(i,value){
         if(!value) return;
         var i = i || 1,message = "";
         while(true){
            message += value;
            if((--i) <= 0) break;
         }

         return message;
      },

      isEmpty: function(o){
         if(this.isString(o)){
            if(o.length === 0) return true;
            if(o.match(/^\W+$/)) return true;
         }
         if(this.isArray(o)){
            if(o.length === 0){ return true; }
         }
         if(this.isObject(o)){
            if(this.keys(o).length === 0){ return true; }
         }

         return false;
      },

      makeString : function(split){
         var split = split || "",
         args = this.makeArray.apply(null,arguments);
         return args.splice(1,args.length).join(split);
      },

      createProxyFunctions: function(from,to,context){
          if(!context) context = to;

          this.forEach(from,function(e,i,b){
             if(!this.matchType(e,"function")) return;
             to[i] = function(){ 
                return b[i].apply(context,arguments);
             }
          },this);
      },

      createProperty: function(obj,name,fns){
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

      extends:function(){
         var obj = arguments[0];
         var args = Array.prototype.splice.call(arguments,1,arguments.length);
         
         Stubs.SU.forEach(args,function(o,i,b){
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

      },
      
      contains: function(o,value){
         var state = false;
         this.forEach(o,function(e,i,b){
            if(e === value) {
               state = true; 
            }
         },this);

         return state;
      },

      // //handles iteration of both of any and anyObject 
      // /*  when supply the property always remember to skip the keys,that is the
      //  *  top level name used to access each inner object,u search for the
      //  *  property within that property that matches the specific value like eg:
      //  *  var s = { b:'sucker' ,s:{ k:{ live: true}, v:'a',live: false}, g:{ v:'aa',live:true}}; 
      //  *  Stubs.SU._anyIterator(s,['k','live'],true);
      //  */
      // _anyIterator: function(o,property,value){

      //    var keys = this.keys(o);
      //    for(var i=0,len = keys.length; i < len; i++){
      //        var item = o[keys[i]];
      //        if(!property){  
      //           if(item === value){
      //             return keys[i];
      //             break;
      //           } 
      //        }
      //        if(property && !this.isArray(property)){
      //           if(item[property] === value){
      //              return keys[i]; 
      //              break;
      //           }
      //        }
      //        if(property && this.isArray(property)){
      //           var tail=item[0],plen = property.length;
      //           for(var j = 1; j < plen; j++){
      //              tail = tail[property[j]];
      //           }
      //           console.log(tail);
      //           if(tail === value){
      //              return keys[i];
      //              break;
      //           }
      //        }
      //    }
      // },
     
      // returns the position of the first item that meets the value in an array
      any: function(o,value,fn){
         if(this.isArray(o)){
            return this._anyArray(o,value,fn);
         }
         if(this.isObject(o)){
            return this._anyObject(o,value,fn);
         }
      },

      _anyArray: function(o,value,fn){
         for(var i=0,len = o.length; i < len; i++){
            if(value === o[i]){
               if(fn) fn.call(this,o[i],i,o);
               return true;
               break;
            }
         }
         return false;
      },

      _anyObject: function(o,value,fn){
         for(var i in o){
            if(value === i){
               if(fn) fn.call(this,o[i],i,o);
               return true;
               break;
            }
         }
         return false;
      },

      //mainly works wth arrays only
      //flattens an array that contains multiple arrays into a single array
      flatten: function(arrays,result){
         var flat = result || [];
         this.forEach(arrays,function(a){

            if(this.isArray(a)){
               flatten(a,flat);
            }else{
               flat.push(a);
            }

         },this);

         return flat;
      },

      filter: function(array,fn,scope,breaker){
         if(!array) return false;
         var result=[],scope = scope || this;
         this.forEach(array,function(e,i,b){
           if(fn.call(scope,e,i,b)){
              result.push(e);
           }
         },scope,breaker);
         return result;
      },

      occurs: function(o,value){
         var occurence = 0;
         this.forEach(o,function(e,i,b){
               if(e === value) occurence += 1; 
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
            this.forEach(arguments,function(e,i,b){
               if(this.isArray(e)) this._explodeArray(e);
               if(this.matchType(e,"object")) this._explodeObject(e);
            },this);
         }
      },

      _explodeArray: function(o){
         if(this.isArray(o)){
            this.forEach(o,function(e,i,b){
               delete b[i];
            },this);
			o.length = 0;
         };

         return o;
      },
      
      _explodeObject: function(o){
         if(this.matchType(o,"object")){
            this.forEach(o, function(e,i,b){
               delete b[i];
            },this);
            if(o.length) o.length = 0;
         }
         
         return o;
      },
      
      is: function(prop,value){
         return (prop === value) ? true : false;
      },
      
      //forEach: Improved forEach allows abit more interesting control of that
      //allows breaker the loop in its state by passing an addition function
      //which must return true based on the condition specified within it,it
      //recieves the same arguments as the main callback,but very good for
      //handler errors or breaking from the loop for specific reasons
      //{params obj} - the object to be looped through
      //{params callback} - the callback function
      //{params scope} - the optional object to be to call the callback from,that is the
      //callbacks context
      //{params breakerFunc} - the optional function to return true to initiate breaking
      //the loop
      forEach: function(obj,callback,scope,breakerfunc){
          if(!obj || !callback) return false;
          if(('length' in obj && !this.isFunction(obj)) || this.isArray(obj) || this.isString(obj)){
            for(var i=0; i < obj.length; i++){
               callback.call(scope || this,obj[i],i,obj);
               if(breakerfunc && (breakerfunc.call(scope,obj[i],i,obj))){
                  break;
               }
            }
            return true;
          }

          if(this.isObject(obj) || this.isFunction(obj)){
            for(var e in obj){
               callback.call(scope || this,obj[e],e,obj);
               if(breakerfunc && (breakerfunc.call(scope,obj[i],i,obj))){
                  break;
               }
            }
            return true;
          }
      },
      
      map: function(obj,callback,scope,breaker){
         if(!object || !callback) return false;
          var result = [];
         
         Stubs.SU.forEach(obj,function(o,i,b){
            var r = callback.call(scope,o,i,b);
            if(r) result.push(r);
         },scope || this,breaker);
         return result;
      },

     //you can deep clone a object into another object that doesnt have any
     //refernce to any of the values of the old one,incase u dont want to
     //initialize a vairable for the to simple pass a {} or [] to the to arguments
     //it will be returned once finished eg var b = clone(a,{}); or b=clone(a,[]);

     clone: function(from,type){
            var to = null;
            if(this.isArray(from)) to = [];
            if(this.isObject(from)) to = {};
            if(type) to = type;

           this.forEach(from,function(e,i,b){
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
  
      isType: function(o){
          return ({}).toString.call(o).match(/\s([\w]+)/)[1].toLowerCase();
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

      isUndefined: function(o){
         return (o === undefined && this.matchType(o,'undefined'));
      },

      isNull: function(o){
         return (o === null && this.matchType(o,'null'));
      },
      
      isNumber: function(o){
         return this.matchType(o,"number");
      },

      isArgument: function(o){
         return this.matchType(o,"arguments");
      },

      has: function(obj,elem,value){
         var self = this,state = false;
         this.any(obj,elem,function(e,i){
            if(value){
               state = (e === value) ? true : false;
               return;
            }
            state = true;
         });

         return state;
      },

      hasOwn: function(obj,elem,value){
         if(Object.hasOwnProperty){
            //return Object.hasOwnProperty.call(obj,elem);
         }

         var keys,constroKeys,protoKeys,state = false,fn = function(e,i){
            if(value){
               state = (e === value) ? true : false;
               return;
            }
            state = true;
         };

         if(!this.isFunction(obj)){
            /* when dealing pure instance objects(already instantiated
             * functions when the new keyword was used,all object literals
             * we only will be checking the object itself since its points to
             * its prototype against its constructors.prototype
             * constroKeys = this.keys(obj.constructor);
             */

            keys = this.keys(obj);
            //ensures we are not dealing with same object re-referening,if
            //so,switch to constructor.constructor call to get real parent
            protoKeys = this.keys(
               ((obj === obj.constructor.prototype) ? obj.constructor.constructor.prototype : obj.constructor.prototype)
            );

            if(this.any(keys,elem,(value ? fn : null)) && !this.any(protoKeys,elem,(value ? fn : null))) 
            return state;
         }
         
         /* when dealing with functions we are only going to be checking the
         * object itself vs the objects.constructor ,where the
         * objects.constructor points to its parent if there was any
         */ 
         //protoKeys = this.keys(obj.prototype);
         keys = this.keys(obj);
         constroKeys = this.keys(obj.constructor);

         if(this.any(keys,elem) && !this.any(constroKeys,elem)) 
         return state;
      },

      proxy: function(fn,scope){
         scope = scope || this;
         return function(){
            return fn.apply(scope,arguments);
         };
      },
      
      //allows you to do mass assignment into an array or array-like object
      //({}),the first argument is the object to insert into and the rest are
      //the values to be inserted
      pusher: function(){
			var slice = [].splice.call(arguments,0),
			focus = slice[0],rem  = slice.splice(1,slice.length);
						
			this.forEach(rem,function(e,i,b){
				_pusher.call(focus,e);
			});
		    return;
       },

	 keys: function(o,a){
		var keys = a || [];
		Stubs.SU.forEach(o,function(e,i,b){
			keys.push(i);
		});
		return keys;
	 },
	
	 values: function(o,a){
		var keys = a || [];
		Stubs.SU.forEach(o,function(e,i,b){
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
      
     
      unContext: function(ens,callback,context,subscriber){
            Stubs.SU.forEach(ens, function(e,i,b){
               if(!callback && context && !subscriber && (e.context === context)){
                  delete b[i]; return;
               }

               if(!callback && !context && subscriber && (e.subscriber === subscriber)){
                  delete b[i]; return;
               }

               if(!callback && context && subscriber && (e.subscriber === subscriber) && (e.context === context)){
                  delete b[i]; return;
               }

               if(callback && !context  && !subscriber && (e.fn === callback)){
                   delete b[i]; return;
               }

               if(callback && context && !subscriber && (e.fn === callback) && (e.context === context)){
                  delete b[i]; return;
               }

               if(callback && !context && subscriber && (e.fn === callback) && (e.subscriber === subscriber)){
                  delete b[i]; return;
               }

               if(callback && context && subscriber && ( e.fn === callback) 
                  && (e.context === context) && (e.subscriber === subscriber)){
                   delete b[i]; return;
               }
            });
            
            Stubs.SU.normArray(ens);
      },
      
     createRootFragment: function(){
            return { all:[] };
         },

     createFragment: function(callback,context,subscriber){
                return ({fn:callback,context:context,subscriber:subscriber});
       },

       _withMultiple: function(es,callback,context,subscriber,isOn){
            var keys = es.split(event_split),that = this;

            if(keys.length == 1){ 
               if(keys[0].match(eventnms)){
                  keys =  keys[0].match(eventnms);
                  if(!isOn){
                     this._unEvent(keys[1],keys[2],callback,context,subscriber);
                     return;
                  }
                  this._withEvent(keys[1],keys[2],callback,context,subscriber);
                  return;
               }

               keys = keys[0];
               if(!isOn){
                  this._unEvent(keys,null,callback,context,subscriber);
                  return;
               }
               this._withEvent(keys,"all",callback,context,subscriber);
               return;

            }else{
               Stubs.SU.forEach(keys,function(e,i,n){
                  if(e.match(eventnms)){
                     var ev = e.match(eventnms);
                     if(!isOn){
                        this._unEvent(ev[1],ev[2],callback,context,subscriber);
                        return;
                     }
                     this._withEvent(ev[1],ev[2],callback,context,subscriber);
                     return;
                  }
                  if(!isOn){	
                     this._unEvent(e,null,callback,context,subscriber);
                     return;				
                  }
                  this._withEvent(e,"all",callback,context,subscriber);
                  return;
               },this);
            }
      },

       _withEvent: function(es,space,callback,context,subscriber){
            if(!es && !space){ return; }

            var e = this,event;

            event = e.withKey(es,space);
            event.push(e.createFragment(callback,context,subscriber));

            return;
       },

       _unEvent: function(es,space,callback,context,subscriber){
         var e = this,event;

         if(arguments.length === 0){
            Stubs.SU.explode(e.events);
            return;
         }

         if(!e.withKey(es,null,true) || !e.withKey(es,space,true)){ 
            return; 
         }

         if(es && !space && !callback && !context && !subscriber){
            Stubs.SU.explode(e.withKey(es,null,true));
            return;
         }

         if(es && space && !callback && !context && !subscriber){
            Stubs.SU.explode(e.withKey(es,space,true));
            return;
         }

         if(es && space && callback && context && subscriber){
            e.unContext(e.withKey(es,space,true),callback,context,subscriber);
            return;
         }

         Stubs.SU.forEach(e.withKey(es,null,true),function(k,i,b){
            e.unContext(k,callback,context,subscriber);
         });

         return;
       },
      
       //due for the need of readability this method is created to encapsulate
        //the true firing operation on all events located within the specific
        //event array
     _withFire: function(o,args){
            var keys,fire = function(array){
               if(array.length === 0) return;
               Stubs.SU.forEach(array,function(e,i,b){
                  if(!Stubs.SU.isObject(e) || !e.fn || !Stubs.SU.isFunction(e.fn)) return;
                  e.fn.apply(e.context ? e.context : ({}),args);
               },this);
               return;
            }

            if(Stubs.SU.isArray(o)){
               fire(o); return;
            };

            if(Stubs.SU.isObject(o)){
               keys = Stubs.SU.keys(o);
               Stubs.SU.forEach(keys,function(e,i,b){
                   fire(o[e]);
               },this);
              return;
            };

            return;
        },
	
     on:function(es,callback,context,subscriber){
	     if(!this.events) this.events = {};
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
			
	         if(es === "all"){ 
                this._withEvent(es,es,callback,context,subscriber);
                return;
	         }

            //major workhorse here ,handling the real work here 
            this._withMultiple(es,callback,context,subscriber,true);
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
     off: function(es,callback,context,subscriber){
    
			if(arguments.length  === 0){
				this._unEvent();
				return;
			};
			
			//special all or *:all event triggers removal of all events 
			// from all event types with their respective various namespace types
         var keys = Stubs.SU.keys(this.events);
			
			if(es == "*:all"){
				Stubs.SU.forEach(keys,function(e,i,b){
					this._unEvent(e,"all",callback,context,subscriber);
				},this);	
				return;			
			};
			
      	//special all or all:all event triggers removal of all events 
			//from the special all stack
			if(es == "all"){
				this._unEvent(es,es,callback,context,subscriber);
				return;
			};
			
			if(!es || callback || context){
				Stubs.SU.forEach(keys,function(e,i,b){
					this._unEvent(e,null,callback,context,subscriber);
				},this);	
				return;
			};

		 	this._withMultiple(es,callback,context,subscriber,false);
			return;
		
      },

    

     emit: function(event){
    
        if(!event){ return; }
        
        var keys = event.split(event_split),
            args = [].splice.call(arguments,1);
         
        if(event === "all"){
            this._withFire(this.withKey("all","all",true),args);
            return;
        };

         this._withFire(this.withKey("all","all",false),args);

			if(keys.length === 1){ 
				if(keys[0].match(eventnms)){
					keys =  keys[0].match(eventnms);
               this._withFire(this.withKey(keys[1],keys[2],true),args);
               if(keys[1] !== "all"){
                  this._withFire(this.withKey(keys[1],"all",true),args);
               }
					return;
				}
				
				keys = keys[0];
            this._withFire(this.withKey(keys,null,true),args);
				return;
				
			}else{
            
				Stubs.SU.forEach(keys,function(k,i,n){
					if(k.match(eventnms)){
						var ev = k.match(eventnms);
                  this._withFire(this.withKey(ev[1],ev[2],true),args);
                  if(ev[2] !== "all"){
                     this._withFire(this.withKey(ev[1],"all",true),args);
                  }
						return;
					}
            
               this._withFire(this.withKey(k,null,true),args);
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
   //{params classname} the name for the object,allows classification
   //{params ability} the object containing functions to include in the objects,this can take an option static and instance object within it for more flexibility between instance and object level methods
  //{params parent} an object to inherit from,a non instantiated object
  //{params noEvent} to specify if you prefer to not include Stub.Events,is option,requires a true value

   Stubs.create = function(classname,ability,parent){
      
      var Stub = function(){
         if(!(this instanceof arguments.callee)){
            return new arguments.callee;
         }
      };
      
      
      if(parent){ Stubs.inherit(Stub,parent)};

      if(Stubs.useEvents){
	      Stubs.SU.extends(Stub.prototype,Stubs.prototype,Stubs.Events);	
		}
      
      
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
            if(this.super.init && typeof this.super.init === 'function'){
               this.super.init.apply(this,arguments);
            }		
         }
        
         if(this.init && typeof this.init === 'function'){
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

   //desired to reduce size of object being created by stubs,removing and modularizing common functions but having to deal with extra namespace call when in need of this specific functions,if there is the desire to use this from objects directly,simple use Stubs.share to grant capability to object,prefer simple grant each instead of forEach,but its left to personal taste.

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

             var elist = arguments.length === 2 ? arguments[1] : [].splice.call(arguments,1);

             if(elist === "all") { 
                Stubs.SU.forEach(Stubs.SU.keys(this.data),function(e,i,b){
                  this.on(e+":change",function(){
                      a.set(e,this.get(e));
                  });
                },this);
             }
             
             if(Stubs.SU.isArray(elist) && elist.length > 0 ){ 
                var keys = Stubs.SU.keys(this.data);
                Stubs.SU.forEach(elist,function(e,i,b){
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
            if(item.value !== item.oldvalue){
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

               Stubs.SU.forEach(attr, function(e,i,b){
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
            Stubs.SU.forEach(keys,function(e,i,b){
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


 //added September 10th 2012 - 7:58am
 //idea picked up from jquery source -- best idea ,very useful for a proper
 //callback api ,these gots small improvements in the nature of more custom
 //filtering through results for better use,will be taking over Stubs.events
 //workload,leaving a simple Stubs.events shell with simpler implementation
   Stubs.Callbacks = (function(){

      var flagsCache = {},
         su = Stubs.SU,
         makeFlags = function(flags){
            if(!flags || su.isEmpty(flags)) return;
            if(flagsCache[flags]) return flagsCache[flags];

            var object = flagsCache[flags] = {};
            su.forEach(flags.split(/\s+/),function(e){
                  object[e] = true;
            });

            return object;
         },
         callbackTemplate = function(fn,context,subscriber){
            return {
               fn:fn,
               context: context || this,
               subscriber: subscriber 
            }
         },
        callback = function(flags){
             var  list = [],
                  stack = [],
                  fired = false,
                  firing = false,
                  fired = false,
                  fireIndex = 0,
                  fireStart = 0,
                  fireLength = 0,
                  flags = makeFlags(flags),
                  memory,

                  _add = function(args){
                     su.forEach(args,function(e,i){
                        if(su.isArray(e)) _add(e);
                        if(su.isObject(e)){
                           if(!e.fn || (e.fn && !su.isFunction(e.fn))){ return;}
                           if(!su.isNull(e.context) && !su.isUndefined(e.context) && !su.isObject(e.context)){ return; }
                           if(flags.unique && instance.has('fn',e.fn)){ return; }
                           list.push(e);
                        }
                     });
                  },

                  _fire = function(context,args){
                     if(flags.once && fired) return;
                     if(!fired){
                        su.forEach(list,function(e,i,b){
                        
                        });
                     }
                  },

                  instance =  {
                     
                     add: function(){
                        if(list){
                           fireLength = list.length;
                           if(arguments.length === 1){
                              if(su.isArray(arguments[0])) _add(arguments[0]);
                              if(su.isObject(arguments[0])) _add([arguments[0]]);
                           }else{
                              _add([
                                    callbackTemplate(arguments[0],arguments[1],arguments[2])
                              ]);
                           }
                        };
                     },

                     remove: function(){},

                     lock: function(){},

                     disable: function(){},

                     _display: function(){
                        if(list) return list;
                     },

                     has: function(elem,value){
                       var len = list.length;
                       for(var i = 0; i < len; i++){
                           if(su.has(list[i],elem,value)){
                                 return true;
                                 break;
                           }
                       }
                           return false;
                     },

                  };

             return instance;
      };

      return {
         init : function(){
            return callback.apply(this,arguments);
         }
      };
   })();

   Stubs.Promise = (function(){
   
      var promise = function(){
         this._failure = [];
         this._done = [];
         this._always = [];
      },
      su = Stubs.SU;

      var fn = promise.prototype;

      fn.done = su.createChainable(function(fn){
         
      });

      fn.fail = su.createChainable(function(fn){
      
      });

      fn.always = su.createChainable(function(fn){
      
      });

      fn.resolve = function(){};

      fn.reject = function(){};

      fn.state = function(){};

      fn.then = function(done,failed,always){
         
      };

      fn.pipe = function(){};

      return {
          deferred: function(){}
      }
   })();

   Stubs.prototype = {

      setup : function(){
         if(Stubs.parent){
            Stubs.parent.constructor.apply(this,arguments);
            this.super = Stubs.parent;
            if(this.super.init && typeof this.super.init === 'function'){
               this.super.init.apply(this,arguments);
            }
         }
         
         if(this.init && typeof this.init === 'function'){
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
