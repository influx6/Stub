//basic extension management system
var ExtensionManager = (function(root){
   //check the root files
      var root = root,
            emptyCr = /^\W+$/,
            signature = "__extensions__";
            

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
         if(!matchType(ext["licenses"],"array")) throw new Error("Licenses must be an array e.g [{type: mit,url:http://mths.be/mit }]!");
         if(!matchType(ext["description"],"string")) throw new Error("Description's value is not a string in extension!");

         //advance checks
         if(ext["author"].match(emptyCr)) throw new Error("Author must contain letters not just empty spaces or symbols");
         if(ext["version"].match(emptyCr) && !!parseFloat(ext["version"])) throw new Error("Version must not be empty and must be numbers!");
         if(ext["description"].match(emptyCr)) throw new Error("Description can not be empty spaces or symbols");

         return ext;
       },

      matchType = function(obj,type){
             return ({}).toString.call(obj).match(/\s([\w]+)/)[1].toLowerCase() === type.toLowerCase();
      },

      getAttr = function(o,wantKey){
          var i,item,cnt = 0,res=[];
          for(i in o){
            item = o[i];
            if(item && item.signature === signature){
               if(wantKey){
                  res[cnt] = i;
               }else{
                  res[cnt] = item;
               }
               cnt++;
            };
          }
          return res;
	  },

     iterators = function(collection,eachfunc,finish){
            if(!collection || !eachfunc) return;
            //handles management of next call for collection,be it arrays or objects
            var len,keys,self = this,isArray = false;
            console.log("tests",getAttr(collection,true));

            if(matchType(collection,"array")){ isArray = true; len = collection.length;}
            keys = getAttr(collection,true);
            if(matchType(collection,"object")) len = keys.length; 

            console.log(keys,isArray);

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

      validateDependency = function(e,dep){
           if(!e || dep.length <= 0) return [];

            var res = [], len = dep.length,i=0,item;
            //we first check if the result is a string,if it is,we check if
            //it Already exists on the extensionmanager or root represented
            //by e,if its a object,we assume,its a portable dependency and
            //there for use it as it is 
            for(; i < len; i++){
               item = dep[i];
               if(matchType(item,"string") && !e[item]) throw new Error("Dependency"+item+"does not exist on object"+ (e.name || e.extensionName));
               if(matchType(item,"object")) res[i] = item;
               if(matchType(item,"string") && e[item]) res[i] = e[item];
            };

            return res;
      },



     ExtensionMgr =  {

        ext: {  },

         create: function(name,ext,deps,mustOverwright){
            if(!matchType(ext,"function")) throw new Error("Second argument/Extension must be a function that returns an object");
            if(!deps) deps = [];
            var subject = this.ext,
            //basics checks for valid extensions,
            finalize = function (s,t,d){
                   var _ext,
                   dependency = validateDependency(s,d);
               
               if(matchType(t,"function")) _ext = validate(t.apply(t,dependency));
            
               s[name] = validate(_ext);
               s[name].extensionName = name;
               s[name].signature = signature;
               s[name].depends = deps;

               //leak the extension onto the public handler
               //s[name] = s.ext[name];
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
            if(!root){
               e = this.ext;
               if(e[name] && e[name].signature === signature) delete e[name];
               return;
            };

            e = root;
            if(e[name] && e[name].signature === signature) delete e[name];

            return true;
         },

         give: function(overwritable,obj/*,list of all extensions you want, if all,then all will be added*/){
            if(!obj) return false;

            var i = 0,e = root ? root : this.ext,iterator,clean = false,
                handleDependency=function(owner,depends){
                   if(!matchType(depends,"array")) return;
                  var it = iterators(depends,function(f,i,g){
                      if(matchType(f,"string") && e[f]){
                        owner[f] = e[f];
                      }
                  });

                  while(it.next());
            };

            if(arguments.length === 2){ clean = true; } 
            
            if(!clean){
               var args = [].splice.call(arguments,2);
               iterator = iterators(args,function(r,i,b){
                     if(!overwritable && obj[r] && obj[r].signature === signature ) return;
                        if(e[r].depends){
                           handleDependency(obj,e[r].depends);
                        }
                        obj[r] = e[r];
                        
               });

            }else{
               iterator = iterators(e,function(r,i){
                     if(!overwritable && obj[i] && obj[i].signature === signature) return;
                        obj[i] = r;
                        return;
               });
            }

            while(iterator.next());

            return obj;
         },

      };

      return ExtensionMgr;
});

if(module.exports) module.exports = ExtensionManager;
