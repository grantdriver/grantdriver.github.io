(function(){var q=document.getElementById('q');if(!q)return;var items=[].slice.call(document.querySelectorAll('.item'));
var cats=[].slice.call(document.querySelectorAll('section.cat'));var none=document.getElementById('none'),qn=document.getElementById('qn');
function run(){var t=q.value.trim().toLowerCase().split(/\s+/).filter(Boolean),shown=0;
items.forEach(function(el){var s=el.getAttribute('data-q')||'';var ok=t.every(function(w){return s.indexOf(w)>-1});el.hidden=!ok;if(ok)shown++;});
cats.forEach(function(c){var v=c.querySelectorAll('.item:not([hidden])').length;c.hidden=t.length>0&&v===0;});
if(none)none.hidden=!(t.length&&shown===0);if(qn)qn.textContent=t.length?shown+' found':'';}
q.addEventListener('input',run);})();
