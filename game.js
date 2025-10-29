export const xpForLevel=l=>50+10*l
export function gainXp(user,g){let xp=user.xp+g;let level=user.level;let toNext=user.xpToNext;while(xp>=toNext){xp-=toNext;level+=1;toNext=xpForLevel(level)}return{...user,xp,level,xpToNext:toNext}}
const base={low:10,med:20,high:35}
export function calcTaskXp(priority,estimate,streak){const b=base[priority]||20;const effort=Math.round(Number(estimate||1)*5);const m=1+Math.min(0.5,(streak||0)*0.05);return Math.round((b+effort)*m)}
export function computeNewStreak(lastISO,nowISO){const now=new Date(nowISO);const last=lastISO?new Date(lastISO):null;const start=d=>new Date(d.getFullYear(),d.getMonth(),d.getDate());const n=start(now);const l=last?start(last):null;let streak=0;let lastOut=nowISO;if(!l)streak=1;else{const diff=(n-l)/(1000*60*60*24);if(diff===0)streak=0;else if(diff===1)streak=1;else if(diff>1)streak=1;else streak=1}
  return {streakDelta:streak,lastCompletionISO:lastOut}
}
export function evaluateBadges(user,tasks){
  const have=new Set(user.badges||[])
  const done=tasks.filter(t=>t.status==='done').length
  const doneHigh=tasks.filter(t=>t.status==='done'&&t.priority==='high').length
  const totalPomos=tasks.filter(t=>t.status==='done').reduce((a,t)=>a+Number(t.estimatePomodoros||0),0)
  const add=[]
  if(done>=1 && !have.has('first-blood')) add.push('first-blood')
  if(user.streakDays>=7 && !have.has('on-a-roll')) add.push('on-a-roll')
  if(doneHigh>=20 && !have.has('high-roller')) add.push('high-roller')
  if(totalPomos>=100 && !have.has('marathon')) add.push('marathon')
  return add.length?{...user,badges:[...user.badges,...add]}:user
}

