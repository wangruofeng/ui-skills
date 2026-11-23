import {readFile,readdir} from 'node:fs/promises';
import {parse} from 'parse5';import assert from 'node:assert/strict';import path from 'node:path';
const origin='https://ui-skills.wangruofeng007.com';const files=[];
async function scan(dir){for(const e of await readdir(dir,{withFileTypes:true})){const f=path.join(dir,e.name);if(e.isDirectory())await scan(f);else files.push(f);}}await scan('dist');
const html=files.filter(f=>f.endsWith('.html'));const routes=new Set(files.map(f=>'/'+path.relative('dist',f).replaceAll(path.sep,'/')));const pages=new Set(html.filter(f=>!f.endsWith('/404.html')).map(f=>'/'+path.relative('dist',f).replaceAll(path.sep,'/').replace(/index\.html$/,'').replace(/\.html$/,'').replace(/\/$/,'')));
const errors=[];let originals=0;function fail(msg){if(errors.length<30)errors.push(msg);}
for(const file of html){const raw=await readFile(file,'utf8');const doc=parse(raw);let lang,canonical,robots,h1=0,alternates=0,redirect=false;
 const route='/'+path.relative('dist',file).replaceAll(path.sep,'/').replace(/index\.html$/,'').replace(/\.html$/,'').replace(/\/$/,'');const en=route.startsWith('/en');
 function visit(n){const attr=Object.fromEntries((n.attrs??[]).map(a=>[a.name,a.value]));if(n.tagName==='meta'&&attr['http-equiv']==='refresh')redirect=true;if(n.tagName==='html')lang=attr.lang;if(n.tagName==='h1')h1++;if(n.tagName==='link'&&attr.rel==='canonical')canonical=attr.href;if(n.tagName==='link'&&attr.hreflang)alternates++;if(n.tagName==='meta'&&attr.name==='robots')robots=attr.content;if('data-original-content'in attr)originals++;
 if(n.tagName==='a'&&attr.href?.startsWith('/')&&!attr.href.startsWith('//')){const target=attr.href.split(/[?#]/)[0].replace(/\/$/,'')||'/';if(!pages.has(target)&&!routes.has(target)&&!/^\/(?:en\/)?(?:agent|jobs|account|library|login|mcp|sponsor)(?:\/|$)/.test(target))fail(`${file}: missing internal ${attr.href}`);}
 for(const c of n.childNodes??[])visit(c);
 }visit(doc);if(lang!==(en?'en':'zh-CN'))fail(`${file}: language ${lang}`);if(!file.endsWith('/404.html')){if(canonical!==origin+(route==='/en'?'/en/':route||'/'))fail(`${file}: canonical ${canonical}`);if(!redirect&&alternates!==3)fail(`${file}: hreflang ${alternates}`);}else if(!robots?.includes('noindex'))fail(`${file}: 404 indexable`);
 if(!h1&&!redirect)fail(`${file}: missing H1`);
}
// The Playbook comparison must show the route's language before React hydrates.
for (const [prefix, labels] of [
  ['', ['弹簧', '缓出']],
  ['en/', ['Spring', 'Ease-out']],
]) {
  const file = `dist/${prefix}playbook/use-ease-not-spring-for-feedback/index.html`;
  const raw = await readFile(file, 'utf8');
  const demo = raw.match(/<astro-island[^>]+component-url="[^"]*demo-router[^"]*"[^>]*>([\s\S]*?)<\/astro-island>/)?.[1];
  for (const label of labels) assert.ok(demo?.includes(`>${label}</button>`), `${file}: missing initial demo label ${label}`);
}
const xml=await readFile('dist/sitemap.xml','utf8');const locs=[...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(x=>x[1]);assert.equal(locs.length,[...pages].filter(x=>!/^\/(?:en\/)?(?:agent|login|library)(?:\/|$)/.test(x)).length);assert.equal(new Set(locs).size,locs.length);assert.ok(!locs.some(x=>x.includes('404')));assert.ok(originals>0);assert.deepEqual(errors,[]);console.log(`Verified ${html.length} HTML pages, ${locs.length} sitemap URLs, ${originals} original-language skill bodies.`);
