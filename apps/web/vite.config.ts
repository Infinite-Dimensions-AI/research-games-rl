import { defineConfig } from 'vite';
export default defineConfig(({command})=>({ base:command==='serve'?'/':'/research-games-rl/demo/', server:{host:'127.0.0.1',port:5173} }));
