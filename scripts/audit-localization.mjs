import {readFile,readdir,writeFile} from 'node:fs/promises';
import {parse,serialize} from 'parse5';
import {normalizeText,translateText} from '../public/i18n-core.mjs';
const dictionary=JSON.parse(await readFile('public/i18n/zh-CN.json','utf8'));
const missing=new Map();let pages=0,originals=0;
async function walk(dir){for(const file of await readdir(dir,{withFileTypes:true})){const path=dir+'/'+file.name;if(file.isDirectory())await walk(path);else if(path.endsWith('.html')){
 const english=parse(await readFile(path,'utf8'));const chinese=parse(await readFile(path.replace('dist/en/','dist/'),'utf8'));const enOriginal=[],zhOriginal=[];
 const check=(value)=>{const text=normalizeText(value);if(!/[a-zA-Z]{2}/.test(text)||dictionary[text]!==undefined||translateText(text,dictionary)!==text||/^https?:|^[@a-zA-Z0-9_./:#%+–—−=()\[\]<>*\-]+$/.test(text))return;if(!missing.has(text))missing.set(text,path);};
 function visit(node,keep=false,originalNodes=null){const attrs=Object.fromEntries((node.attrs??[]).map(x=>[x.name,x.value]));if('data-original-content'in attrs){originalNodes?.push(serialize(node));return;}const skip=keep||attrs.translate==='no'||['script','style','pre','code','svg','astro-island'].includes(node.tagName);if(!skip&&originalNodes===enOriginal){if(node.nodeName==='#text')check(node.value);for(const key of ['aria-label','placeholder','title','alt'])if(attrs[key])check(attrs[key]);if(node.tagName==='meta'&&['description','og:title','og:description','twitter:title','twitter:description'].includes(attrs.name??attrs.property))check(attrs.content);}for(const child of node.childNodes??[])visit(child,skip,originalNodes);}
 function compare(en,zh,keep=false){
  if(!zh)throw Error('Missing translated node: '+path);
  const attrs=Object.fromEntries((en.attrs??[]).map(x=>[x.name,x.value]));
  const skip=keep||attrs.translate==='no'||['script','style','pre','code','svg','astro-island'].includes(en.tagName)||'data-original-content'in attrs||'data-language-switch'in attrs;
  if(!skip&&en.nodeName==='#text'&&normalizeText(zh.value??'')!==normalizeText(translateText(en.value,dictionary)))throw Error('Translation mismatch: '+path+' '+en.value.slice(0,80));
  if(skip)return;
  for(let i=0;i<(en.childNodes??[]).length;i++)compare(en.childNodes[i],zh.childNodes?.[i],skip);
 }
 compare(english,chinese);
 visit(english,false,enOriginal);visit(chinese,false,zhOriginal);if(JSON.stringify(enOriginal)!==JSON.stringify(zhOriginal))throw Error('Original skill content changed: '+path);originals+=enOriginal.length;pages++;
}}}await walk('dist/en');
await writeFile('/tmp/ui-skills-missing-translations.json',JSON.stringify([...missing].map(([text,page])=>({text,page})),null,2));
if(missing.size)throw Error(`${missing.size} untranslated strings; see /tmp/ui-skills-missing-translations.json`);
console.log(`Localization verified: ${pages} bilingual page pairs, ${originals} unchanged skill bodies, ${Object.keys(dictionary).length} dictionary entries.`);
