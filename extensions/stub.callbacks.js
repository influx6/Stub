var Callbacks = (function(EM){

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

   EM.create("Callbacks",function(SU){

      var flagsCache = {},
         su = SU,
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
        create : callback,
        name:"Stubs.Callbacks",
        description: "Callback API with the pub-sub pattern implementation(the heart of Promise and Events)",
        licenses:[ { type: "mit", url: "http://mths.be/mit" }],
        author: "Alexander Adeniyi Ewetumo",
        version: "0.3.0",
      };

   },["SU",{'n':"m"}],true);


});

if(module.exports) module.exports = Callbacks;
