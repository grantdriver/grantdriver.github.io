(function(){var q=document.getElementById('q');if(!q)return;var items=[].slice.call(document.querySelectorAll('.item'));
var cats=[].slice.call(document.querySelectorAll('section.cat, .lesson'));var none=document.getElementById('none'),qn=document.getElementById('qn');
function run(){var t=q.value.trim().toLowerCase().split(/\s+/).filter(Boolean),shown=0;
items.forEach(function(el){var s=el.getAttribute('data-q')||'';var ok=t.every(function(w){return s.indexOf(w)>-1});el.hidden=!ok;if(ok)shown++;});
function lvok(el){var g=el.closest?el.closest('.lvonly'):null;return !g||getComputedStyle(g).display!=='none';}
cats.forEach(function(c){var v=[].filter.call(c.querySelectorAll('.item:not([hidden])'),lvok).length;c.hidden=t.length>0&&v===0;});
shown=items.filter(function(el){return !el.hidden&&lvok(el);}).length;
if(none)none.hidden=!(t.length&&shown===0);if(qn)qn.textContent=t.length?shown+' found':'';}
q.addEventListener('input',run);})();

(function(){var r=document.documentElement,G=[].slice.call(document.querySelectorAll('.utabgroup'));if(!G.length)return;r.classList.add('tabs-on');
function has(g,n){return !!g.querySelector('.unitpane[data-unit="'+n+'"]')}
function show(g,n){if(!n||!has(g,n))n=g.getAttribute('data-default');var i,p=g.querySelectorAll('.unitpane'),t=g.querySelectorAll('.utab[data-unit]');
for(i=0;i<p.length;i++){if(p[i].getAttribute('data-unit')===n)p[i].classList.add('on');else p[i].classList.remove('on')}
for(i=0;i<t.length;i++){var on=t[i].getAttribute('data-unit')===n;t[i].setAttribute('aria-selected',on?'true':'false');if(on)t[i].classList.add('on');else t[i].classList.remove('on')}}
function hu(){var h=location.hash,m=/^#unit-(\d+)$/.exec(h)||/^#u(\d+)(-l\d)?$/.exec(h);return m?m[1]:null}
function apply(n){G.forEach(function(g){show(g,n)})}
function jump(){var h=location.hash;if(!h)return;var el=document.getElementById(h.slice(1));if(el&&el.offsetParent!==null)el.scrollIntoView()}
apply(hu());if(hu())setTimeout(jump,0);
document.addEventListener('click',function(e){var a=e.target.closest?e.target.closest('.utab[data-unit]'):null;if(!a)return;e.preventDefault();var n=a.getAttribute('data-unit');
try{history.pushState(null,'','#unit-'+n)}catch(x){location.hash='unit-'+n}apply(n);var g=a.closest('.utabgroup'),b=g&&g.querySelector('.utabs');if(b&&b.getBoundingClientRect().top<0)b.scrollIntoView()});
window.addEventListener('hashchange',function(){var n=hu();if(n){apply(n);jump()}});window.addEventListener('popstate',function(){apply(hu())});
var q=document.getElementById('q');if(q)q.addEventListener('input',function(){if(q.value.trim())r.classList.add('searching');else r.classList.remove('searching')});})();