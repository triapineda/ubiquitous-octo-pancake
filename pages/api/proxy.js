<script>
(()=>{ "use strict";
const grid=document.getElementById('grid');
const err=document.getElementById('err');
const API=(new URLSearchParams(location.search).get('endpoint')) || (location.origin + '/api/posts');

function showErr(m){ if(!err) return; err.textContent=m||''; err.style.display=m?'block':'none'; }
function clearErr(){ showErr(''); }
function tileCount(n){ return Math.max(9, Math.ceil(n/3)*3); }

function render(posts){
  grid.setAttribute('aria-busy','true');
  grid.innerHTML='';
  const count=tileCount(posts.length);

  posts.forEach(p=>{
    const t=document.createElement('div');
    t.className='tile';
    const content = p.link ? document.createElement('a') : document.createElement('div');
    if (p.link){ content.href=p.link; content.target='_blank'; content.rel='noopener noreferrer'; }
    const img=document.createElement('img'); img.alt=''; img.loading='lazy';
    img.src = '/api/proxy?src=' + encodeURIComponent(p.image);  // ← proxied
    content.appendChild(img); t.appendChild(content); grid.appendChild(t);
  });

  for(let i=posts.length;i<count;i++){
    const ph=document.createElement('div'); ph.className='tile ph'; grid.appendChild(ph);
  }
  grid.setAttribute('aria-busy','false');
}

async function load(){
  clearErr();
  try{
    const res=await fetch(API, { method:'GET' });
    if(!res.ok) throw new Error('HTTP '+res.status+' from '+API);
    const json=await res.json();
    const posts = Array.isArray(json.posts) ? json.posts.filter(p=>p && p.image) : [];
    render(posts);
  }catch(ex){
    showErr('Failed to load: ' + (ex?.message || ex));
    render([]); // still show placeholders
  }
}
load();
})();
</script>
