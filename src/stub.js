(function(r){
      //all functions/methods with an '_' starting their names are hidden and are
      //not to be called directly unless you need to test those specific
      //operations directly,please use such a convention for a better modularizing
      //of code

      var root = r;

      var previousStubs = root.Stubs;

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

      Stubs.ObjectClassName = "Stubs";

      Stubs.noConflict = function(){
        root.Stubs = previousStubs;
        return this; 
      };

      //the current in use version of Stub
      Stubs.version = "0.3.2";

      //config option to decide if stub that are created are to have the
      //Stub.Events available as part of their prototype or not
     // Stubs.useEvents = true;

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

      // //EM = Extension Manager
      // Stubs.EM = (function(root){
      //     root.ext = root.ext || {};

      //     var validate = function(ext){
      //       //basic checks 
      //       if(!matchType(ext,"object")) throw new Error("Extension must be Object or return an object!");

      //       //basic checks 
      //       if(!ext["version"]) throw new Error("Extension has no valid version information");
      //       if(!ext["author"]) throw new Error("Extension has no valid author information");
      //       if(!ext["license"]) throw new Error("Extension has no valid license information");
      //       if(!ext["description"]) throw new Error("Extension has no valid description information");

      //       //intermediate checks
      //       if(!matchType(ext["version"],"string")) throw new Error("Version's value is not a string in extension!");
      //       if(!matchType(ext["author"],"string")) throw new Error("Author's value is not a string in extension!");
      //       if(!matchType(ext["license"],"object")) throw new Error("Licence's value is not a string in extension!");
      //       if(!matchType(ext["description"],"string")) throw new Error("Description's value is not a string in extension!");

      //       //advance checks
      //       if(!(ext["license"]["type"])) throw new Error("License data has no valid licence type field!");

      //       return ext;
      //     },
      //     validateDependency = function(dep){
      //          if(!dep) return [];
      //          var i = 0,len = dep.length,item,obj=[];
      //          for(; i < len; i++){
      //             item = dep[i];
      //             if(!(item in root) && !(item in root.ext)){ 
      //                throw new Error("Dependency is not found: "+item+" in "+ root.__name__);
      //             }
      //             obj[i] = root[item] || root.ext[item];
      //          };
      //          return obj;
      //     },
      //    matchType = function(obj,type){
      //        return ({}).toString.call(obj).match(/\s([\w]+)/)[1].toLowerCase() === type.toLowerCase();
      //    };

      //     return {
      //       
      //       create: function(name,ext,deps,mustOverwright){
      //          var subject = root,extensions = root.ext,dependency;

      //          if(name in extensions) throw new Error("ExtensionName Already Exists!");
      //          if(deps && !matchType(deps,"array")) throw new Error("Dependency list must be an Array!");
      //          if(!matchType(name,"string")) throw new Error("Arguments are not the proper types!");
      //          
      //          //check if it already exits
      //          if(!mustOverwright && (root[name] || root.ext[name])) throw new Error("Extension Already Exist!")

      //          //basics checks for valid extensions,
      //          dependency = validateDependency(deps);

      //          extensions[name] = matchType(ext,"function") ? validate(ext.apply(ext,dependency)) : validate(ext);
      //          extensions[name].signature = "__extensions__";

      //          //leak the extension onto the public handler
      //          subject[name] = subject.ext[name];

      //          return true;
      //       },

      //       remove: function(name){
      //          var extensions = root.ext;
      //          if(!extensions[name]) return;
      //          delete extensions[name];
      //       }
      //       
      //    };

      // })(Stubs);

      Stubs.create = function(classname,ability,parent){
         
         var Stub = function(){
            if(!(this instanceof arguments.callee)){
               return new arguments.callee;
            }
         };
         
         if(parent){ Stubs.inherit(Stub,parent)};

         //if(Stubs.useEvents){
           // Stubs.SU.extends(Stub.prototype,Stubs.prototype,Stubs.Events);	
        // }
         
         
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
      
      matchType : function(obj,type){
             return ({}).toString.call(obj).match(/\s([\w]+)/)[1].toLowerCase() === type.toLowerCase();
      },

      isType: function(){
          var self = this;
          return ({}).toString.call(self).match(/\s([\w]+)/)[1].toLowerCase();
      },

      each: function(callback){
         return Stubs.SU.forEach(this,callback);
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
  
})(this);
