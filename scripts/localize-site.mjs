import {createHash} from 'node:crypto';
import {readFile,writeFile,readdir,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {parse,serialize} from 'parse5';
const origin='https://ui-skills.wangruofeng007.com';
import {translateText} from '../src/lib/i18n-core.mjs';
const translations=await readFile('public/i18n/zh-CN.json','utf8');
const dictionary=JSON.parse(translations);
const contentVersion=value=>createHash('sha256').update(value).digest('hex').slice(0,16);
const translationVersion=contentVersion(translations);
const searchIndexVersion=contentVersion(await readFile('dist/data/search-index.json'));
const text=value=>translateText(value,dictionary);
const files=[];async function walk(dir){for(const e of await readdir(dir,{withFileTypes:true})){if(e.name==='en')continue;const f=path.join(dir,e.name);if(e.isDirectory())await walk(f);else if(f.endsWith('.html'))files.push(f);}}await walk('dist');
const pages=new Set(files.filter(f=>!f.endsWith('/404.html')&&!f.startsWith('dist/agent/')&&!/^dist\/(?:login|library)(?:\/|\.)/.test(f)).map(f=>{let x='/'+path.relative('dist',f).replaceAll(path.sep,'/').replace(/index\.html$/,'').replace(/\.html$/,'');return x==='/'?'/':x.replace(/\/$/,'');}));
const service=/^\/(?:jobs|sponsor|oauth)(?:\/|$)/;
function localizedLink(v,en){if(!v.startsWith('/')||v.startsWith('//'))return v;const [route]=v.split(/[?#]/);if(service.test(route))return 'https://www.ui-skills.com'+v;if(en&&(pages.has(route.replace(/\/$/,'')||'/')||/^\/(?:login|library)(?:\/|$)/.test(route)))return '/en'+v;return v;}
for(const file of files){
 const original=await readFile(file,'utf8');const route='/'+path.relative('dist',file).replaceAll(path.sep,'/').replace(/index\.html$/,'').replace(/\.html$/,'').replace(/\/$/,'');const normalized=route||'/';
 const is404=file.endsWith('/404.html');
 for(const en of [false,true]){
  const doc=parse(original);let head;
  function visit(node,protectedContent=false){const attrs=node.attrs??[];const get=n=>attrs.find(a=>a.name===n);const set=(n,v)=>{let a=get(n);if(a)a.value=v;else attrs.push({name:n,value:v});};
   if(node.tagName==='head')head=node;
   if(node.tagName==='html'){
    set('lang',en?'en':'zh-CN');
    set('data-translation-version',translationVersion);
    set('data-search-index-version',searchIndexVersion);
   }
   if(node.tagName==='script' && get('type')?.value==='application/ld+json') {
    try {const json=JSON.parse(node.childNodes[0]?.value??'null');const remap=(v,key='')=>{if(typeof v==='string'){if(en&&v.startsWith(origin)){const u=new URL(v);return pages.has(u.pathname.replace(/\/$/,'')||'/')?origin+'/en'+u.pathname+u.search+u.hash:v;}if(!en&&['name','headline','description','text','alternateName'].includes(key))return text(v);if(!en&&key==='inLanguage'&&!normalized.startsWith('/skills/'))return 'zh-CN';return v;}if(Array.isArray(v))return v.map(x=>remap(x,key));if(v&&typeof v==='object')return Object.fromEntries(Object.entries(v).map(([k,value])=>[k,remap(value,k)]));return v;};node.childNodes[0].value=JSON.stringify(remap(json)).replaceAll('<','\\u003c');}catch{}
   }
   const keep=protectedContent||['script','style','pre','code'].includes(node.tagName)||!!get('data-original-content')||get('translate')?.value==='no'||node.tagName==='astro-island';
   if(node.nodeName==='#text'&&!en&&!keep)node.value=text(node.value);
   if(node.tagName){
    if(!en&&!keep)for(const a of attrs)if(['aria-label','placeholder','title','alt'].includes(a.name))a.value=text(a.value);
    for(const a of attrs)if(['href','data-card-href'].includes(a.name))a.value=localizedLink(a.value,en);
    if(get('data-language-switch')){set('href',(en?'':'/en')+(is404?'/':normalized));set('lang',en?'zh-CN':'en');set('aria-label',en?'切换到中文':'Switch to English');node.childNodes=[{nodeName:'#text',value:en?'中文':'EN',parentNode:node}];}
    if(node.tagName==='link'&&get('rel')?.value==='canonical')set('href',origin+(en?'/en':'')+normalized);
    if(node.tagName==='meta'&&get('http-equiv')?.value==='refresh'&&en)set('content',get('content').value.replace(/url=(\/[^ ]+)/,(_,url)=>'url='+localizedLink(url,true)));
    if(node.tagName==='meta'&&['og:url'].includes(get('property')?.value))set('content',origin+(en?'/en':'')+normalized);
    if(node.tagName==='meta'&&!en&&['description','og:title','og:description','twitter:title','twitter:description'].includes(get('name')?.value??get('property')?.value))set('content',text(get('content').value));
   }
   const englishVariant=node.childNodes?.find(c=>c.tagName==='template'&&c.attrs.some(a=>a.name==='data-english-playbook-demo'||a.name==='data-english-variant'));
   if(englishVariant){
    node.childNodes=en?englishVariant.content.childNodes:node.childNodes.filter(c=>c!==englishVariant);
   }
   for(const c of node.childNodes??[])visit(c,keep);
  }visit(doc);
  if(head&&!is404&&!file.startsWith('dist/agent/'))for(const [lang,prefix] of [['zh-CN',''],['en','/en'],['x-default','']])head.childNodes.push({nodeName:'link',tagName:'link',namespaceURI:'http://www.w3.org/1999/xhtml',attrs:[{name:'rel',value:'alternate'},{name:'hreflang',value:lang},{name:'href',value:origin+prefix+normalized}],childNodes:[],parentNode:head});
  const target=en?path.join('dist/en',path.relative('dist',file)):file;await mkdir(path.dirname(target),{recursive:true});await writeFile(target,serialize(doc));
 }
}
const esc=v=>v.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');
await writeFile('dist/sitemap.xml','<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">'+[...pages].flatMap(route=>['','/en'].map(prefix=>`<url><loc>${esc(origin+prefix+route)}</loc><xhtml:link rel="alternate" hreflang="zh-CN" href="${esc(origin+route)}"/><xhtml:link rel="alternate" hreflang="en" href="${esc(origin+'/en'+route)}"/></url>`)).join('')+'</urlset>');
console.log(`Localized ${files.length} pages; ${pages.size*2} sitemap URLs.`);

await mkdir('dist/data',{recursive:true});
await writeFile('dist/data/unavailable-sources.json',await readFile('.cache/unavailable-sources.json','utf8'));
