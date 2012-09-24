var SU = (function(EM){
	
   EM.create("SU",(function(){
	
            return {
	
				//meta_data
		        name:"Stubs.Utilities",
		        description: "a set of common,well used functions for the everyday developer,with cross-browser shims",
		        licenses:[ { type: "mit", url: "http://mths.be/mit" }],
		        author: "Alexander Adeniyi Ewetumo",
		        version: "0.3.0",
				 
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

		        iterable: function(collection,eachfunc,finish){
		           if(!collection || !eachfunc) return;
		           //handles management of next call for collection,be it arrays or objects
		           var len,keys,self = this,isArray = false;
		           if(this.isObject(collection)){ keys = this.keys(collection); len = keys.length; }
		           if(this.isArray(collection)){ isArray = true; len = collection.length;}

		           eachfunc.collection = collection;
		           eachfunc.size = len;
		           eachfunc.__ri__ = len - 1;
		           eachfunc.pos = 0;
		           eachfunc.finish = finish;
		           eachfunc.item = null;
		           eachfunc.next = function(){
		              var item,key;
		              if(!isArray) key = keys[eachfunc.pos]; item = eachfunc.collection[key];
		              if(isArray) key = eachfunc.pos; item = eachfunc.collection[key];

		              if(eachfunc.pos >= eachfunc.size){ 
		                 if(eachfunc.finish) eachfunc.finish(eachfunc.item,key,eachfunc.collection);
		                 return false;
		              }

		              eachfunc.pos++;
		              if(!item) return false;

		              eachfunc.item = item;
		              eachfunc(item,key,eachfunc.collection);
		              return item;
		           };

		           return eachfunc;
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
		                 this.flatten(a,flat);
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

		        isPrimitive: function(o){
		           if(!this.isObject(o) && !this.isFunction(o) && !this.isArray(o) && !this.isUndefined(o) && !this.isNull(o)) return true;
		           return false;
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
		           if(!this.isUndefined(a[i]) && !this.isNull(a[i])){
		              a[start]=a[i];
		              start += 1;
		           }
		        }

		        a.length = start;
		        return a;
		     }
	
		};
			
   }),null,true)

});

if(module.exports) module.exports = SU;
