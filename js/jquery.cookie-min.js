!function(a,b,c){function d(a){return a}function e(a){return decodeURIComponent(a.replace(f," "))}var f=/\+/g,g=a.cookie=function(f,h,i){if(window.localStorage)return h===c?window.localStorage[f]:void(window.localStorage[f]=h);if(h!==c){if(i=a.extend({},g.defaults,i),null===h&&(i.expires=-1),"number"==typeof i.expires){var j=i.expires,k=i.expires=new Date;k.setDate(k.getDate()+j)}return h=g.json?JSON.stringify(h):String(h),b.cookie=[encodeURIComponent(f),"=",g.raw?h:encodeURIComponent(h),i.expires?"; expires="+i.expires.toUTCString():"",i.path?"; path="+i.path:"",i.domain?"; domain="+i.domain:"",i.secure?"; secure":""].join("")}for(var l,m=g.raw?d:e,n=b.cookie.split("; "),o=0;l=n[o]&&n[o].split("=");o++)if(m(l.shift())===f){var p=m(l.join("="));return g.json?JSON.parse(p):p}return null};g.defaults={},a.removeCookie=function(b,c){return null!==a.cookie(b)?(a.cookie(b,null,c),!0):!1}}(jQuery,document);