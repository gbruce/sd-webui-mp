/*! For license information please see 916.js.LICENSE.txt */
(self.webpackChunkmp_webgl=self.webpackChunkmp_webgl||[]).push([[916],{19856:function(e,t){var i;void 0===(i=function(){return function(){var e=i;e.Integer={type:"integer"};var t={String:String,Boolean:Boolean,Number:Number,Object:Object,Array:Array,Date:Date};function i(e,t){return i(e,t,{changing:!1})}e.validate=i,e.checkPropertyChange=function(e,t,n){return i(e,t,{changing:n||"property"})};var i=e._validate=function(e,i,n){n||(n={});var a=n.changing;function o(e){return e.type||t[e.name]==e&&e.name.toLowerCase()}var r=[];function s(e,t,i,c){var u;function d(e){r.push({property:i,message:e})}if(i+=i?"number"==typeof c?"["+c+"]":void 0===c?"":"."+c:c,("object"!=typeof t||t instanceof Array)&&(i||"function"!=typeof t)&&(!t||!o(t)))return"function"==typeof t?e instanceof t||d("is not an instance of the class/constructor "+t.name):t&&d("Invalid schema/property definition "+t),null;function p(e,t){if(e){if(!("string"!=typeof e||"any"==e||("null"==e?null===t:typeof t==e)||t instanceof Array&&"array"==e||t instanceof Date&&"date"==e||"integer"==e&&t%1==0))return[{property:i,message:typeof t+" value found, but a "+e+" is required"}];if(e instanceof Array){for(var n=[],a=0;a<e.length&&(n=p(e[a],t)).length;a++);if(n.length)return n}else if("object"==typeof e){var o=r;r=[],s(t,e,i);var l=r;return r=o,l}}return[]}if(a&&t.readonly&&d("is a readonly field, it can not be changed"),t.extends&&s(e,t.extends,i,c),void 0===e)t.required&&d("is missing and it is required");else if(r=r.concat(p(o(t),e)),t.disallow&&!p(t.disallow,e).length&&d(" disallowed value was matched"),null!==e){if(e instanceof Array){if(t.items){var h=t.items instanceof Array,g=t.items;for(c=0,u=e.length;c<u;c+=1)h&&(g=t.items[c]),n.coerce&&(e[c]=n.coerce(e[c],g)),r.concat(s(e[c],g,i,c))}t.minItems&&e.length<t.minItems&&d("There must be a minimum of "+t.minItems+" in the array"),t.maxItems&&e.length>t.maxItems&&d("There must be a maximum of "+t.maxItems+" in the array")}else(t.properties||t.additionalProperties)&&r.concat(l(e,t.properties,i,t.additionalProperties));if(t.pattern&&"string"==typeof e&&!e.match(t.pattern)&&d("does not match the regex pattern "+t.pattern),t.maxLength&&"string"==typeof e&&e.length>t.maxLength&&d("may only be "+t.maxLength+" characters long"),t.minLength&&"string"==typeof e&&e.length<t.minLength&&d("must be at least "+t.minLength+" characters long"),void 0!==typeof t.minimum&&typeof e==typeof t.minimum&&t.minimum>e&&d("must have a minimum value of "+t.minimum),void 0!==typeof t.maximum&&typeof e==typeof t.maximum&&t.maximum<e&&d("must have a maximum value of "+t.maximum),t.enum){var f,m=t.enum;u=m.length;for(var y=0;y<u;y++)if(m[y]===e){f=1;break}f||d("does not have a value in the enumeration "+m.join(", "))}"number"==typeof t.maxDecimal&&e.toString().match(new RegExp("\\.[0-9]{"+(t.maxDecimal+1)+",}"))&&d("may only have "+t.maxDecimal+" digits of decimal places")}return null}function l(e,t,i,o){if("object"==typeof t)for(var l in("object"!=typeof e||e instanceof Array)&&r.push({property:i,message:"an object is required"}),t)if(t.hasOwnProperty(l)){var c=e[l];if(void 0===c&&n.existingOnly)continue;var u=t[l];void 0===c&&u.default&&(c=e[l]=u.default),n.coerce&&l in e&&(c=e[l]=n.coerce(c,u)),s(c,u,i,l)}for(l in e){if(e.hasOwnProperty(l)&&("_"!=l.charAt(0)||"_"!=l.charAt(1))&&t&&!t[l]&&!1===o){if(n.filter){delete e[l];continue}r.push({property:i,message:typeof c+"The property "+l+" is not defined in the schema and the schema does not allow additional properties"})}var d=t&&t[l]&&t[l].requires;d&&!(d in e)&&r.push({property:i,message:"the presence of the property "+l+" requires that "+d+" also be present"}),c=e[l],!o||t&&"object"==typeof t&&l in t||(n.coerce&&(c=e[l]=n.coerce(c,o)),s(c,o,i,l)),!a&&c&&c.$schema&&(r=r.concat(s(c,c.$schema,i,l)))}return r}return i&&s(e,i,"",a||""),!a&&e&&e.$schema&&s(e,e.$schema,"",""),{valid:!r.length,errors:r}};return e.mustBeValid=function(e){if(!e.valid)throw new TypeError(e.errors.map((function(e){return"for property "+e.property+": "+e.message})).join(", \n"))},e}()}.apply(t,[]))||(e.exports=i)},73916:(e,t,i)=>{"use strict";i.r(t),i.d(t,{default:()=>g});var n=i(69170),a=i(48913),o=i(97542),r=i(73339),s=i(54244),l=i(10374),c=i(19663);class u extends c.m{constructor(e,t,i){super(),this.payload={name:e,config:t,configMeta:i}}}var d=i(80361),p=i(19856),h=i(59279);class g extends o.Y{constructor(){super(...arguments),this.name="plugin",this.data=new r.e,this.allowLoad=!1,this.allowInWorkshop=!0,this.onReloadPlugin=async({name:e,config:t,configMeta:i})=>{var n;if(!this.allowInWorkshop)return;const a=(await this.pluginConfigDataModule.getConfiguredPlugins()).find((t=>t.id===e));if(a){const e={properties:i,required:[]};for(const t of Object.keys(e.properties)){(null===(n=e.properties[t].required)||void 0===n?void 0:n.includes(t))&&e.required.push(t)}const o=(0,p.validate)(t,e);if(!o.valid)throw this.log.error(o.errors),new Error("disallowed config values, not reloading.");const r={applicationKey:a.applicationKey,id:a.id};await this.unload(r),await this.load(Object.assign(Object.assign({},a),{config:t}))}},this.debouncedOnReloadPlugin=(0,d.D)(this.onReloadPlugin,500),this.onReloadPluginCommand=async e=>{this.debouncedOnReloadPlugin(e)}}async init(e,t){if(this.allowInWorkshop=!(0,h.eY)("preventWorkshopPluginPreview",!1,"boolean"),[this.ses,this.sdk,this.pluginConfigDataModule]=await Promise.all([t.getModuleBySymbol(n.y.SES),t.getModuleBySymbol(n.y.SDK),t.getModuleBySymbol(n.y.PLUGIN_CONFIG_DATA_MODULE)]),this.allowLoad=e.pluginPolicies.enabled,this.allowLoad){const e=t.subscribe(l.LZ,(async({phase:i,application:n})=>{i===s.nh.PLAYING&&(e.cancel(),this.allowInWorkshop?await this.loadConfigured():(this.log.devInfo("Reached PLAYING stage, checking whether configured plugins need to load to start: ",n),n===s.Mx.SHOWCASE&&await this.loadConfigured(),this.bindings.push(t.subscribe(l.pB,(async e=>{if(this.log.devInfo("Switch in active application detected by plugin system: ",e.application),e.application===s.Mx.WORKSHOP)try{await this.disposeAll()}catch(e){this.log.debugWarn("Entering workshop, one or more plugins failed to dispose properly:",e)}else e.application===s.Mx.SHOWCASE&&await this.loadConfigured()})))))}))}this.bindings.push(t.commandBinder.addBinding(u,this.onReloadPluginCommand)),t.market.register(this,r.e,this.data)}async loadConfigured(){if(this.pluginConfigDataModule.registryLoaded){const e=await this.pluginConfigDataModule.getConfiguredPlugins();if(this.log.debug("Combined configuration with registry data, loading plugins: "+JSON.stringify(e,void 0,2)),this.pluginConfigDataModule.pluginConfigData.disabled)return void this.log.debug("Cannot load plugins! Disabled by URL parameter.");const t=[];for(const i of e)t.push(this.load(i));try{await Promise.all(t)}catch(e){this.log.warn("Issues were encountered loading configured plugins.")}}}async fetchPlugin(e,t,i,n){n&&this.ses.freezeForStrict();const a=await this.ses.makeSecureEnvironment(e+""+(i?"-"+i:""),t,n);if(a){return[a,a.compartment.globalThis.plugin]}return null}async unload(e){const t=e.id&&""!==e.id?e.id:"default",i={applicationKey:e.applicationKey,id:t},n=this.data.get(i);let a=null;if(n){try{a=n.dispose()}catch(e){this.log.warn("An error occurred when disposing a plugin, it may be in a partially disposed state",e)}this.data.delete(i)}return a||Promise.resolve()}async load(e){const{applicationKey:t,src:i,id:n,strict:a}=e;if(!this.allowLoad){const e=i.startsWith("http")?i:`${i.substring(0,16)}...`;return Promise.reject(`Load for plugin <${n}:${e}> requested, but plugin system is not available.`)}const o=void 0===a||a,r=n||"default",s={applicationKey:t,id:r};if(this.data.get(s))return Promise.reject(`Plugin for ${t}-${r} already loaded.`);const[l,c]=await this.fetchPlugin(t,i,r,o)||[];l&&c&&await this.initPlugin(l,c.factory,e)}async initPlugin(e,t,i){const n=t(),{applicationKey:o,id:r,config:s}=i;let l=()=>{};const c=n.onInit||n.init;let u=Promise.resolve();if(c){class e{constructor(e){this.sdk=e}connect(){return this.sdk.connectPlugin(o,r)}cancelConnecting(){}}class t{getFactory(e){return e.messengerFactory}}const i=await a.tK.connect(new e(this.sdk),new t,window);u=c.call(n,i,s),l=()=>i.disconnect()}async function d(){const t=n.onDestroy||n.dispose;return((null==t?void 0:t.call(n))||Promise.resolve()).finally((()=>{l(),e.dispose()}))}const p={applicationKey:o,id:r};try{return await u,this.data.set(p,n,d),Promise.resolve()}catch(e){this.log.warn("Plugin initialization failed: ",e),this.log.debugWarn("Attemptying dispose for clean up...");try{await d()}catch(e){this.log.warn("Auto-cleanup of plugin had errors: ",e)}return Promise.reject(e)}}dispose(e){super.dispose(e),this.disposeAll().catch((e=>{this.log.warn("One or more plugins failed to dispose properly.",e)}))}disposeAll(){const e=[];for(const[t,i]of this.data.plugins.entries())e.push(i.dispose());return this.data.plugins.clear(),Promise.all(e)}}}}]);