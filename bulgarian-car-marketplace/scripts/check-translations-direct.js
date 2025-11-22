const fs = require('fs');
const path = require('path');
function sanitizeTs(source){
  // Remove import/export type lines
  let cleaned = source
    .replace(/import[^\n]*\n/g,'')
    .replace(/export\s+type[^\n]*\n/g,'')
    .replace(/interface [^{]+{[^}]*}\n/g,'')
    .replace(/:\s*Translations\s*=\s*/,'=')
    .replace(/export const translations/,'const translations');
  // Remove explicit type annotations like ": string" within object literals (simple pass)
  cleaned = cleaned.replace(/: string/g,'');
  return cleaned;
}
function getObject(){
  const file = path.join(__dirname,'..','src','locales','translations.ts');
  const raw = fs.readFileSync(file,'utf8');
  const js = sanitizeTs(raw);
  try {
    // Evaluate in isolated scope
    const sandbox = {};
    const fn = new Function('sandbox', js + '\nreturn sandbox.translations || translations;');
    return fn(sandbox);
  } catch(e){
    return { __error: e.message }; }
}
function collectKeys(obj,prefix=''){ const keys=[]; for(const k of Object.keys(obj||{})){ const val=obj[k]; const pathKey= prefix? prefix+'.'+k : k; keys.push(pathKey); if(val && typeof val==='object'){ // only descend if not a primitive string
      if(typeof val !== 'string') keys.push(...collectKeys(val,pathKey)); }
  } return keys; }
function main(){
  const translations = getObject();
  if(translations.__error){
    console.log(JSON.stringify({ ok:false, error: translations.__error }));
    return;
  }
  const bg = translations.bg || {};
  const en = translations.en || {};
  const bgKeys = collectKeys(bg).filter(k=>!k.includes('__')); // simple filter
  const enKeys = collectKeys(en).filter(k=>!k.includes('__'));
  const missingInBg = enKeys.filter(k=>!bgKeys.includes(k));
  const missingInEn = bgKeys.filter(k=>!enKeys.includes(k));
  console.log(JSON.stringify({ ok: missingInBg.length===0 && missingInEn.length===0, bgCount: bgKeys.length, enCount: enKeys.length, missingInBg, missingInEn }));
}
main();
