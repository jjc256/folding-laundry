const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/OrbitControls-B7kpGNWY.js","assets/three.module-CLHXJyXt.js","assets/ParametricGeometry-D9exulAb.js"])))=>i.map(i=>d[i]);
(function(){const s=document.createElement("link").relList;if(s&&s.supports&&s.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))e(i);new MutationObserver(i=>{for(const o of i)if(o.type==="childList")for(const n of o.addedNodes)n.tagName==="LINK"&&n.rel==="modulepreload"&&e(n)}).observe(document,{childList:!0,subtree:!0});function t(i){const o={};return i.integrity&&(o.integrity=i.integrity),i.referrerPolicy&&(o.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?o.credentials="include":i.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function e(i){if(i.ep)return;i.ep=!0;const o=t(i);fetch(i.href,o)}})();const O="modulepreload",I=function(p){return"/folding-laundry/"+p},v={},u=function(s,t,e){let i=Promise.resolve();if(t&&t.length>0){document.getElementsByTagName("link");const n=document.querySelector("meta[property=csp-nonce]"),c=(n==null?void 0:n.nonce)||(n==null?void 0:n.getAttribute("nonce"));i=Promise.allSettled(t.map(a=>{if(a=I(a),a in v)return;v[a]=!0;const d=a.endsWith(".css"),f=d?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${a}"]${f}`))return;const h=document.createElement("link");if(h.rel=d?"stylesheet":O,d||(h.as="script"),h.crossOrigin="",h.href=a,c&&h.setAttribute("nonce",c),document.head.appendChild(h),d)return new Promise((P,L)=>{h.addEventListener("load",P),h.addEventListener("error",()=>L(new Error(`Unable to preload CSS for ${a}`)))})}))}function o(n){const c=new Event("vite:preloadError",{cancelable:!0});if(c.payload=n,window.dispatchEvent(c),!c.defaultPrevented)throw n}return i.then(n=>{for(const c of n||[])c.status==="rejected"&&o(c.reason);return s().catch(o)})};let r,E,g,S;async function A(){try{r=await u(()=>import("./three.module-CLHXJyXt.js"),[]);const p=await u(()=>import("./OrbitControls-B7kpGNWY.js"),__vite__mapDeps([0,1])),s=await u(()=>import("./ParametricGeometry-D9exulAb.js"),__vite__mapDeps([2,1])),t=await u(()=>import("./stats.module-BL02l9NC.js"),[]);E=p.OrbitControls,g=s.ParametricGeometry,S=t.default}catch{r=await u(()=>import("https://cdn.jsdelivr.net/npm/three@0.174.1/build/three.module.js"),[]);const s=await u(()=>import("https://cdn.jsdelivr.net/npm/three@0.174.1/examples/jsm/controls/OrbitControls.js"),[]),t=await u(()=>import("https://cdn.jsdelivr.net/npm/three@0.174.1/examples/jsm/geometries/ParametricGeometry.js"),[]),e=await u(()=>import("https://cdn.jsdelivr.net/npm/three@0.174.1/examples/jsm/libs/stats.module.js"),[]);E=s.OrbitControls,g=t.ParametricGeometry,S=e.default}new F}A();const M=.03,V=1-M,b=.1,C=18/1e3,D=C*C,l=30,m=30,y=10,w=-100,R=300,x=300,T=.8,G=.1,H=3,N=.75,_=20,z=1e3,W=500,q=1;class B{constructor(s,t,e,i){this.position=new r.Vector3,this.previous=new r.Vector3,this.original=new r.Vector3,this.a=new r.Vector3(0,0,0),this.mass=i,this.invMass=1/i,this.tmp=new r.Vector3,this.tmp2=new r.Vector3,this.position.set(s,t,e),this.previous.copy(this.position),this.original.copy(this.position)}addForce(s){this.a.add(this.tmp2.copy(s).multiplyScalar(this.invMass))}integrate(s){const t=this.tmp.subVectors(this.position,this.previous);t.multiplyScalar(V).add(this.position),t.add(this.a.multiplyScalar(s)),this.tmp=this.previous,this.previous=this.position,this.position=t,this.a.set(0,0,0)}}class F{constructor(){this.scene=new r.Scene,this.setupCamera(),this.setupLights(),this.setupRenderer(),this.setupCloth(),this.setupTable(),this.setupControls(),this.startTime=Date.now(),this.isPinned=!0,this.animate=this.animate.bind(this),requestAnimationFrame(this.animate)}setupCamera(){this.camera=new r.PerspectiveCamera(45,window.innerWidth/window.innerHeight,1,1e4),this.camera.position.set(0,500,1e3),this.camera.lookAt(0,0,0)}setupLights(){const s=new r.AmbientLight(6710886);this.scene.add(s);const t=new r.DirectionalLight(16777215,1);t.position.set(50,200,100),t.castShadow=!0,this.scene.add(t)}setupRenderer(){this.renderer=new r.WebGLRenderer({antialias:!0}),this.renderer.setSize(window.innerWidth,window.innerHeight),this.renderer.shadowMap.enabled=!0,document.body.appendChild(this.renderer.domElement)}setupCloth(){const e=300/l,i=200/m;this.particles=[];for(let c=0;c<=m;c++)for(let a=0;a<=l;a++){const d=(a-l/2)*e,f=200,h=(c-m/2)*i;this.particles.push(new B(d,f,h,b))}this.constraints=[],this.createConstraints();const o=new g((c,a,d)=>{const f=c*300-150,h=a*200;d.set(f,h,0)},l,m),n=new r.MeshPhongMaterial({color:4473924,side:r.DoubleSide,wireframe:!1});this.clothMesh=new r.Mesh(o,n),this.clothMesh.castShadow=!0,this.clothMesh.receiveShadow=!0,this.scene.add(this.clothMesh)}setupTable(){const s=new r.BoxGeometry(R,20,x),t=new r.MeshPhongMaterial({color:8939059});this.table=new r.Mesh(s,t),this.table.position.y=w,this.table.receiveShadow=!0,this.scene.add(this.table)}setupControls(){this.controls=new E(this.camera,this.renderer.domElement),this.stats=new S,document.body.appendChild(this.stats.dom)}createConstraints(){for(let t=0;t<m;t++)for(let e=0;e<l;e++){const i=this.particles[t*(l+1)+e],o=this.particles[t*(l+1)+(e+1)],n=this.particles[(t+1)*(l+1)+e];this.constraints.push([i,o,y]),this.constraints.push([i,n,y])}const s=Math.sqrt(y*y*2);for(let t=0;t<m;t++)for(let e=0;e<l;e++){const i=this.particles[t*(l+1)+e],o=this.particles[(t+1)*(l+1)+(e+1)],n=this.particles[t*(l+1)+(e+1)],c=this.particles[(t+1)*(l+1)+e];this.constraints.push([i,o,s]),this.constraints.push([n,c,s])}}simulate(){this.isPinned&&Date.now()-this.startTime>z&&(this.isPinned=!1);const s=new r.Vector3(0,-1373.3999999999999,0).multiplyScalar(b);for(const t of this.particles)t.addForce(s),t.integrate(D);if(this.isPinned){const t=Math.floor(this.particles.length/2),e=this.particles[t];e.position.set(0,W,0),e.previous.copy(e.position)}for(let t=0;t<H;t++){for(const[e,i,o]of this.constraints)this.satisfyConstraint(e,i,o);this.handleCollisions()}}handleCollisions(){const s=w+_/2,t=this.calculateCenterOfMass();for(const e of this.particles)if(e.position.y<s){const i=s-e.position.y,o=new r.Vector3().subVectors(e.position,e.previous);if(new r.Vector3().subVectors(e.position,t),e.position.y=s,o.length()<G)e.previous.copy(e.position);else{const n=new r.Vector3(o.x,0,o.z);n.multiplyScalar(q),e.previous.x=e.position.x-n.x*(1-T),e.previous.z=e.position.z-n.z*(1-T),e.previous.y=e.position.y-o.y*N}this.propagateCollision(e,i*.5)}}calculateCenterOfMass(){const s=new r.Vector3;for(const t of this.particles)s.add(t.position);return s.divideScalar(this.particles.length)}propagateCollision(s,t){for(const[e,i]of this.constraints)e===s&&i.position.y<w+_?i.position.y+=t:i===s&&e.position.y<w+_&&(e.position.y+=t)}satisfyConstraint(s,t,e){const i=new r.Vector3().subVectors(t.position,s.position),o=i.length();if(o===0)return;const c=i.multiplyScalar(1-e/o).multiplyScalar(.5);s.position.add(c),t.position.sub(c)}updateClothGeometry(){const s=this.clothMesh.geometry.attributes.position;for(let t=0;t<this.particles.length;t++){const e=this.particles[t];s.setXYZ(t,e.position.x,e.position.y,e.position.z)}s.needsUpdate=!0,this.clothMesh.geometry.computeVertexNormals()}animate(){requestAnimationFrame(this.animate),this.simulate(),this.updateClothGeometry(),this.renderer.render(this.scene,this.camera),this.stats.update()}}
