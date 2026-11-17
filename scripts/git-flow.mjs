import {execFileSync} from 'node:child_process';
import {chmodSync} from 'node:fs';
const git=(...args)=>execFileSync('git',args,{encoding:'utf8'}).trim();
const fail=x=>{console.error(x);process.exit(1)};
const [, ,action, raw]=process.argv;
if(action==='hooks'){ chmodSync('.githooks/post-merge',0o755);git('config','core.hooksPath','.githooks');console.log('Optional local-only post-merge verification installed.');}
else if(['feature','fix','release'].includes(action)){
 if(!raw || !/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(raw))fail('Supply a valid name/version.');
 if(git('status','--porcelain'))fail('You must commit or stash changes yourself before branching.');
 if(git('branch','--show-current')!=='main')fail('Start on main.');
 const name=action+'/'+raw;git('switch','-c',name);console.log(name,'created locally. Nothing pushed.');
}else if(action==='tag'){
 if(!raw || !/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?$/.test(raw))fail('Use semantic version, e.g. 0.2.0');
 if(git('status','--porcelain'))fail('Commit changes yourself before tagging.');
 if(git('branch','--show-current')!=='main')fail('Switch to main before tagging.');
 git('tag','v'+raw);console.log('Local tag created. Not pushed.');
}else fail('Usage: feature|fix|release <name>, tag <semver>, hooks');
