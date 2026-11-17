import {defineConfig} from 'vitepress';
export default defineConfig({
  title:'Research Games — Reinforcement Learning',
  description:'Browser-based neural evolution and reinforcement learning experiments in original game environments.',
  base:'/research-games-rl/',
  cleanUrls:true,
  themeConfig:{
    nav:[{text:'Home',link:'/'},{text:'Play / Train',link:'/demo/'},{text:'Research Methods',link:'/methodology'},{text:'GitHub',link:'https://github.com/Infinite-Dimensions-AI/research-games-rl'}],
    sidebar:[{text:'Research',items:[
      {text:'Overview',link:'/'},{text:'Video & source analysis',link:'/original-mar-io'},
      {text:'Algorithm and mathematics',link:'/algorithm'},
      {text:'Live input → network → controller',link:'/live-visualisation'},
      {text:'Canvas screenshots and pixel inputs',link:'/canvas-vision'},
      {text:'Experimental methodology',link:'/methodology'},
      {text:'Architecture',link:'/architecture'},
      {text:'Roadmap',link:'/roadmap'},
      {text:'Workflow and releases',link:'/workflow'}
    ]}],
    socialLinks:[{icon:'github',link:'https://github.com/Infinite-Dimensions-AI/research-games-rl'}],
    footer:{message:'Original browser environments. No Nintendo game files or copied Lua source.'}
  }
});
