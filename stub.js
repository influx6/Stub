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

      //please note that Stubs.mixin and Stubs.SU.extends careless about wether
      //the arguments passed are objects or pure prototypes,they require you to
      //specify,if its from a prototype to a prototype or they will walk with any
      //object you give them as they are without looking or trying to add to this
      //objects/functions prototype,its done this way to allow more flexibility 
      //when desire to not just mix between prototypes but also between objects or
      //objects constructors
      Stubs.mixin = function(from,to){
         for(var e in from){
            if(e in to) return;
            to[e] = from[e];
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

          makeSplice: function(arr,from,to){
            return ([].splice.call(arr,from,to));
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

         createProperty: function(obj,name,fns,properties){
            if(!("defineProperty" in Object) && Object.__defineGetter__ && Object.__defineSetter__){
               if(fns.get) obj.__defineGetter__(name,fns.get);
               if(fns.set) obj.__defineSetter__(name,fns.set);
               obj.defineProperty(name,properties);

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
            var occurence = [];
            this.forEach(o,function(e,i,b){
                  if(e === value){ occurence.push(i); }
            },this);
            return occurence;
         },

         every: function(o,value,fn){
            this.forEach(o,function(e,i,b){
                  if(e === value){ 
                     if(fn) fn.call(this,e,i,b);
                  }
            },this);
            return;
         },

         delay: function(fn,duration){
            var args = this.makeSplice(arguments,2);
            return setTimeout(function(){
               fn.apply(this,args)
            },duration);
         },

         //destructive splice,changes the giving array instead of returning a new one
         //writing to only work with positive numbers only
         splice: function(o,start,end){
            var i = 0,len = o.length;
            if(!len || len <= 0) return false;
            start = Math.abs(start); end = Math.abs(end);
            if(end > (len - start)){
               end = (len - start);
            }

            for(; i < len; i++){
               o[i] = o[start];
               start +=1;
               if(i >= end) break;
            }

            o.length = end;
            return o;

         },
         
         shift: function(o){
           if(!this.isArray(o) || o.length <= 0) return;
           var data =  o[0];
           delete o[0];
           this.normalizeArray(o);
           return data;
         },

         unShift: function(o,item){
           if(!this.isArray(o)) return;
            var i = (o.length += 1);
            for(; i < 0; i--){
               o[i] = o[i-1];
            }

            o[0]= item;
            return o.length;
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

         has: function(obj,elem,value,fn){
            var self = this,state = false;
            this.any(obj,elem,function(e,i){
               if(value){
                  if(e === value){
                     state = true;
                     if(fn && self.isFunction(fn)) fn.call(e,i,obj);
                     return;
                  }
                  state = false;
                  return;
               }

               state = true;
               if(fn && self.isFunction(fn)) fn.call(e,i,obj);
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

            if(this.any(keys,elem,(value ? fn : null)) && !this.any(constroKeys,elem,(value ? fn : null))) 
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
      normalizeArray: function(a){
         if(!a || !this.isArray(a)) return; 
         
         var i = 0,start = 0,len = a.length;

         for(;i < len; i++){
            if(!this.isUndefined(a[i])){
               a[start]=a[i];
               start += 1;
            }
         }
         
         a.length = start;
         return a;
      }
      
      };
     
      Stubs.Events = {
         
           on:function(es,callback,context,subscriber){
              if(!this.events) this.events = {};
               if(!es || !callback){ return; }

               var e = this.events[es] = (this.events[es] ? this.events[es] : Stubs.Callbacks.create("unique"));
               e.add(callback,context,subscriber);

               return;
            },
         
           off: function(es,callback,context,subscriber){
               if(arguments.length  === 0){
                  
                  return this;
               };
               
               var e = this.events[es];
               if(!e) return;

               if(!callback && !context && !subscriber){ e.flush(); return this; } 

               e.remove(callback,context,subscriber);
               return this;
            
            },

           emit: function(event){
              if(!event || !this.events){ return this; }
              
              var keys = event.split(event_split),
                  args = Stubs.SU.makeSplice(arguments,1),
                  e = this.events[event];

              if(!e) return this;

               e.fire(args);

              return this;
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
         Stub.mixin = Stubs.mixin;
         return Stub;
      };

      //allows a direct extension of the object from its parent directly
      Stubs.extend = function(name,ability){
         return Stubs.create(name,ability,this);
      };

    //added September 10th 2012 - 7:58am
    //idea picked up from jquery source -- best idea ,very useful for a proper
    //callback api ,these gots small improvements in the nature of more custom
    //filtering through results for better use,will be taking over Stubs.events
    //workload,leaving a simple Stubs.events shell with simpler implementation
    //
    //   - FLAGS 
    //         : once => only fires the callback once 
    //         : unique => ensures there are no duplicate numbers
    //         : forceContext => ensures that only supplied context from the fire
    //         function or set to this will be used to fire the Callbacks
    //
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
                  context: context || null,
                  subscriber: subscriber || null
               }
            },
            occursObjArray = function(arr,elem,value,fn){
               var oc = [];
               su.forEach(arr,function(e,i,b){
                  if(e){
                     if((elem in e) && (e[elem] === value)){
                       oc.push(i);
                       if(fn && su.isFunction(fn)) fn.call(null,e,i,arr);
                     }
                  }
               },this);

               return oc;
               
            },
           callback = function(flags){
                var  list = [],
                     fired = false,
                     firing = false,
                     fired = false,
                     fireIndex = 0,
                     fireStart = 0,
                     fireLength = 0,
                     flags = makeFlags(flags) || {},

                     _fixList = function(){
                        if(!firing){
                           su.normalizeArray(list);
                        }
                     },
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
                        firing = true;
                        fired = true;
                        fireIndex = fireStart || 0;
                        for(;fireIndex < fireLength; fireIndex++){
                           if(!su.isUndefined(list[fireIndex]) && !su.isNull(list[fireIndex])){
                              var e = list[fireIndex];
                              if(!e || !e.fn) return;
                              if(flags.forceContext){
                                 e.fn.apply(context,args);
                              }else{
                                 e.fn.apply((e.context ? e.context : context),args);
                              }
                           }
                        }
                        firing = false;

                        // if(list){
                        //    if(flags.once && fired){
                        //       instance.disable();
                        //    }
                        // }else{
                        //    list = [];
                        // }
                       
                        return;
                     },

                     instance =  {
                        
                        add: function(){
                           if(list){
                              if(arguments.length === 1){
                                 if(su.isArray(arguments[0])) _add(arguments[0]);
                                 if(su.isObject(arguments[0])) _add([arguments[0]]);
                                 if(su.isFunction(arguments[0])){
                                    _add([
                                          callbackTemplate(arguments[0],arguments[1],arguments[2])
                                    ]);
                                 }
                              }else{
                                 _add([
                                       callbackTemplate(arguments[0],arguments[1],arguments[2])
                                 ]);
                              }

                              fireLength = list.length;
                           };
                           return this;
                        },

                        fireWith: function(context,args){
                           if(this.fired() && flags.once) return;

                           if(!firing ){
                              _fire(context,args);
                           }
                           return this;
                        },

                        fire: function(){
                           this.fireWith(this,arguments);
                           return this;
                        },

                        remove: function(fn,context,subscriber){
                           if(list){
                              if(fn){
                                 this.occurs('fn',fn,function(e,i,b){
                                    if(context && subscriber && (e.subscriber === subscriber) && (e.context === context)){
                                       delete b[i];
                                       su.normalizeArray(b);
                                       return;
                                    }
                                    if(context && (e.context === context)){
                                       delete b[i];
                                       su.normalizeArray(b);
                                       return;
                                    }
                                    if(subscriber && (e.subscriber === subscriber)){
                                       delete b[i];
                                       su.normalizeArray(b);
                                       return;
                                    }

                                    delete b[i];
                                    su.normalizeArray(b);
                                    return;
                                 });
                                 return this;
                              }

                              if(context){
                                 this.occurs('context',context,function(e,i,b){
                                    if(subscriber && (e.subscriber === subscriber)){
                                       delete b[i];
                                       su.normalizeArray(b);
                                       return;
                                    }

                                    delete b[i];
                                    su.normalizeArray(b);
                                    return;

                                 });
                                 return this;
                              }

                              if(subscriber){
                                 this.occurs('subscriber',subscriber,function(e,i,b){
                                    if(context && (e.context === context)){
                                       delete b[i];
                                       su.normalizeArray(b);
                                       return;
                                    }

                                    delete b[i];
                                    su.normalizeArray(b);
                                    return;
                                 });
                                 return this;
                              }
                           }

                           return this;
                        },

                        flush: function(){
                           su.explode(list);
                           return this;
                        },

                        disable: function(){
                           list = undefined;
                           return this;
                        },

                        disabled: function(){
                           return !list;
                        },

                        show: function(){
                           if(list) return list;
                        },

                        has: function(elem,value){
                          var i=0,len = list.length;
                          for(; i < len; i++){
                              if(su.has(list[i],elem,value)){
                                    return true;
                                    break;
                              }
                          }
                              return false;
                        },

                        occurs: function(elem,value,fn){
                           return occursObjArray.call(this,list,elem,value,fn);
                        },

                        fired: function(){
                           return !!fired;
                        }

                     };

                return instance;
         };

         return {
            create : callback
         };
      })();

      //promise is a state based execution object ,which performs specific calls
      //depending on the result of its target or caller,you wrapp promises or call
      //them from within a object and call them properties depending on its
      //outcome
      Stubs.Promise = (function(){
         
         var s = Stubs,
         su = s.SU,
         promise = function(fn){

            var state = "pending",lists = {
               done : s.Callbacks.create("once forceContext"),
               fail : s.Callbacks.create("once forceContext"),
               always : s.Callbacks.create("forceContext")
            },
            deferred = {},
            memory,
            handler = fn;

            su.extends(deferred, {

                  isRejected: function(){
                     if(state === "rejected" && lists.fail.fired()){
                        return true;
                     }
                     return false;
                  },

                  isResolved: function(){
                     if(state === "resolved" && lists.done.fired()){
                        return true;
                     }
                     return false;
                  },

                  state : function(){
                     return state;
                  },

                  done: function(fn){
                     if(this.isResolved()){
                        su.forEach(su.arranize(arguments),function(e,i){
                           if(!su.isFunction(e)) return;
                           e.apply(memory[0],memory[1]);
                        });
                        return this;
                     }
                     lists.done.add(fn);
                     return this;
                  },

                  fail: function(fn){
                     if(this.isRejected()){
                        su.forEach(su.arranize(arguments),function(e,i){
                           if(!su.isFunction(e)) return;
                           e.apply(memory[0],memory[1]);
                        });
                        return this;
                     }
                     lists.fail.add(fn);
                     return this;
                  },

                  always: function(fn){
                     if(this.isRejected() || this.isResolved()){
                        su.forEach(su.arranize(arguments),function(e,i){
                           if(!su.isFunction(e)) return;
                           e.apply(memory[0],memory[1]);
                        });
                        return this;
                     }
                     lists.always.add(fn);
                     return this;
                  },

                  show: function(){
                     console.log("Deffered Done:",lists.done.show());
                     console.log("Deffered Fail:",lists.fail.show());
                     console.log("Deffered Always:",lists.always.show());
                  },

                  get: function(){
                     //request a specifc value from a specific holding object(like
                     //current handler of the promise and return
                     //a promise/deffered with that value 
                     if(!handler) return;
                  },

                  //to ensure no conflict between Object.call and and CommonJS API
                  //call for promises,call is synonized with ask 
                  //ask calls a given function on the promise target and returns
                  //the result as a promise
                  ask: function(fnName /*, args1,args2,args3...etc */){
                     //as to run a specific function on a specific object(holding
                     //the current promise and return result as promise/deffered
                     if(!handler) return;
                  },

                  then: function(success,fail,always){
                     //adds multiple sets to the current promise/deffered being
                     //called;
                     this.done(success).fail(fail).always(always);
                     return this;
                  },

                  when: function(deffereds){
                     //returns a new defferd/promise
                  },

                  resolveWith: function(ctx,args){
                     if(this.isResolved() || this.isRejected()){ return this;}
                     //fire necessary callbacks;
                     lists.done.fireWith(ctx,args);
                     lists.always.fireWith(ctx,args);
                     //store fired context and arguments for when callbacks are added after resolve/rejection
                     memory = [ctx,args];
                     //disable fail list if resolved
                     lists.fail.disable();
                     //set state to resolve
                     state = "resolved";
                     return this;
                  },

                  rejectWith: function(ctx,args){
                     if(this.isRejected() || this.isResolved()){ return this; }
                     //fire necessary callbacks;
                     lists.fail.fireWith(ctx,args);
                     lists.always.fireWith(ctx,args);
                     //store fired context and arguments for when callbacks are added after resolve/rejection
                     memory = [ctx,args];
                     //disable done/success list;
                     lists.done.disable();
                     //set state to rejected
                     state = "rejected";
                     return this;
                  },

                  resolve: function(){
                     this.resolveWith(this,arguments);
                  },

                  reject: function(){
                     this.rejectWith(this,arguments);
                  },

                  delay: function(ms){
                    var pros = s.Promise.create();
                    setTimeout(pros.resolve,ms);
                    return pros;
                  },

                  promise: function(){
                     var _promise = {};
                     su.extends(_promise,this);
                     delete _promise.resolve;
                     delete _promise.reject;
                     delete _promise.rejectWith;
                     delete _promise.resolveWith;

                     return _promise;
                  }

            });

            return deferred;
         };

         return {
             create: promise
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
  

}).call(this);
