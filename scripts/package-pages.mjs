import {mkdirSync,cpSync,writeFileSync} from 'node:fs';
mkdirSync('docs/.vitepress/dist/demo',{recursive:true});
cpSync('apps/web/dist','docs/.vitepress/dist/demo',{recursive:true,force:true});
writeFileSync('docs/.vitepress/dist/.nojekyll','');
console.log('Packaged VitePress and WebGPU interactive app. Publish only via explicit docs:deploy.');
