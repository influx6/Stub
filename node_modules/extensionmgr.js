//basic extension management system
var ExtensionManager = (function(root){
   //check the root files
      var root = root;
      if(root) root.ext = (root['ext'] || root["extensions"] || {});

      var validate = function(ext){
         //basic checks 
         if(!matchType(ext,"object")) throw new Error("Extension must be Object or return an object!");

         //basic checks 
         if(!ext["version"]) throw new Error("Extension has no valid version information");
         if(!ext["author"]) throw new Error("Extension has no valid author information");
         if(!ext["licenses"]) throw new Error("Extension has no valid licenses information");
         if(!ext["description"]) throw new Error("Extension has no valid description information");

         //intermediate checks
         if(!matchType(ext["version"],"string")) throw new Error("Version's value is not a string in extension!");
         if(!matchType(ext["author"],"string")) throw new Error("Author's value is not a string in extension!");
         if(!matchType(ext["licenses"],"array")) throw new Error("Licence's must be an array of objects in extension  licenses:[ { type: mit, url: http://mths.be/mit }],!");
         if(!matchType(ext["description"],"string")) throw new Error("Description's value is not a string in extension!");

         //advance checks
         //if(!(ext["licenses"]["type"])) throw new Error("License data has no valid licence type field!");

         return ext;
       },

       validateDependency = function(e,dep){
            if(!dep) return [];
            var i = 0,len = dep.length,item,obj= {};
            for(; i < len; i++){
               item = dep[i];
               if(!(item in e) && !(item in e.ext)){ 
                  throw new Error("Dependency is not found: "+item+" in "+ (e.name || e.__name__ || e.extensionName));
               }
               obj[item] = e[item] || e.ext[item];
            };
            return obj;
       },

      checkExtensions = function(subject){
         if('plugins' in subject || 'extensions' in subject){
            extensions = subject["plugins"] || subject["extensions"];
         }
         return false;
      },
      
      matchType = function(obj,type){
             return ({}).toString.call(obj).match(/\s([\w]+)/)[1].toLowerCase() === type.toLowerCase();
      },

     iterable = function(collection,eachfunc,finish){
            if(!collection || !eachfunc) return;
            //handles management of next call for collection,be it arrays or objects
            var len,keys,self = this,isArray = false;
            if(matchType(collection,"object")){ keys = getAttr(collection,true); len = keys.length; }
            if(matchType(collection,"array")){ isArray = true; len = collection.length;}

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
               return true;
            };
            
            return eachfunc;
      }, 

      getAttr = function(o,wantKey){
	    var i=0,res=[];
	    for(var j in o){
           if(wantKey){ res[i] = j; i++;
           }else{ res[i] = o[j]; i++; }
        };
        return res;
	  },


     ExtensionMgr =  {
        __ext__: { ext:{} },

         create: function(name,ext,deps,mustOverwright){
            var subject = this.__ext__,extensions = subject.ext,
            //basics checks for valid extensions,
            finalize = function (s,t,d){
                   var _ext,
                   dependency = validateDependency(s,d);

               if(matchType(t,"function")) _ext = validate(t.apply(t,getAttr(dependency)));
               if(matchType(t,"object")){
                  t.depends = dependency; _ext = t;
               }
            
               s.ext[name] = validate(_ext);
               s.ext[name].extensionName = name;
               s.ext[name].signature = "__extensions__";

               //leak the extension onto the public handler
               s[name] = s.ext[name];
            };

            if(!mustOverwright && (subject[name] || extensions[name])) throw new Error("Extension Already Exist!");
            if(deps && !matchType(deps,"array")) throw new Error("Dependency list must be an Array!");
            if(!matchType(name,"string")) throw new Error("Arguments are not the proper types!");
            

            if(!root){
               finalize(subject,ext,deps);
               //if(root) this.give(mustOverwright,root,name);
               return this;
            }

            finalize(root,ext,deps);
            return root;
         },

         remove: function(name){
            var e;
            if(this instanceof arguments.callee){
               e = this.__ext__;
               if(e[name]) delete e[name];
               if(root){
                  if(root[name]) delete root[name];
                  if(root.ext && root.ext[name]) delete root.ext[name];
               }
               return;
            };

            e = root.ext;
            if(!e[name]) return;
            delete e[name];
            return true;
         },

         give: function(overwritable,obj/*,list of all extensions you want, if all,then all will be added*/){
            if(!obj) return false;

            if(!obj.ext) obj.ext={};
            var i = 0,e = this.__ext__,iterator,clean = false;
            if(arguments.length === 2){ clean = true; /*obj.ext = Object(e.ext);*/} 
            
            if(!clean){
               var args = [].splice.call(arguments,2);
               iterator = iterable(args,function(r,i,b){
                     if(!overwritable && (obj[r] || obj.ext[r])) return;
                        obj.ext[r] = e.ext[r];
                        obj[r] = obj.ext[r];
               });

            }else{
               iterator = iterable(e,function(r,i){
                     if(!overwritable && (obj[i] || obj.ext[i])) return;
                        obj.ext[i] = e.ext[i];
                        obj[i] = obj.ext[i];
                        return;
               });
            }

            while(iterator.next());

            return obj;
         },

      };

      return ExtensionMgr;
});

var root = this;
if(root.exports !== undefined){
   root.exports = ExtensionManager;
}
else{
    root.ExtensionManager = ExtensionManager;
 }

