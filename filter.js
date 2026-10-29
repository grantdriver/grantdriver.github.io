(function(){var q=document.getElementById('q');if(!q)return;var items=[].slice.call(document.querySelectorAll('.item'));
var cats=[].slice.call(document.querySelectorAll('section.cat'));var none=document.getElementById('none'),qn=document.getElementById('qn');
function run(){var t=q.value.trim().toLowerCase().split(/\s+/).filter(Boolean),shown=0;
items.forEach(function(el){var s=el.getAttribute('data-q')||'';var ok=t.every(function(w){return s.indexOf(w)>-1});el.hidden=!ok;if(ok)shown++;});
function lvok(el){var g=el.closest?el.closest('.lvonly'):null;return !g||getComputedStyle(g).display!=='none';}
cats.forEach(function(c){var v=[].filter.call(c.querySelectorAll('.item:not([hidden])'),lvok).length;c.hidden=t.length>0&&v===0;});
shown=items.filter(function(el){return !el.hidden&&lvok(el);}).length;
if(none)none.hidden=!(t.length&&shown===0);if(qn)qn.textContent=t.length?shown+' found':'';}
q.addEventListener('input',run);})();
