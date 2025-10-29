import { store } from './storage.js'
import { createInitialState } from './models.js'
import { render, renderTasks, renderQuests, renderBadges } from './ui.js'
import { createTask, addTask, deleteTask, updateTask } from './models.js'
import { calcTaskXp, gainXp, computeNewStreak, evaluateBadges } from './game.js'

const existing = store.read()
let state = Object.keys(existing).length ? existing : createInitialState()
store.write(state)

const root = document.getElementById('app')
function refresh(){
  render(root,state)
  document.documentElement.setAttribute('data-theme',state.settings.theme==='light'?'light':'dark')
  const list=document.getElementById('tasks-list')
  const filter=(state.settings.filter)||'all'
  const filtered=state.tasks.filter(t=>filter==='all'?true:filter==='done'?t.status==='done':t.status!=='done')
  renderTasks(list,filtered)
  const qlist=document.getElementById('quests-list')
  renderQuests(qlist,state.quests||[])
  const blist=document.getElementById('badges-list')
  renderBadges(blist,state.user.badges||[])
  const badgesModal=document.getElementById('badges-modal')
  const openBadges=document.getElementById('open-badges')
  const closeBadges=document.getElementById('close-badges')
  openBadges&&openBadges.addEventListener('click',()=>{badgesModal.style.display='flex'})
  closeBadges&&closeBadges.addEventListener('click',()=>{badgesModal.style.display='none'})
  const form=document.getElementById('create-form')
  form.addEventListener('submit',e=>{
    e.preventDefault()
    const fd=new FormData(form)
    const task=createTask({
      title:fd.get('title'),
      priority:fd.get('priority'),
      estimatePomodoros:fd.get('estimate'),
      dueAt:fd.get('due')||null
    })
    state=addTask(state,task)
    store.write(state)
    refresh()
  })
  list.addEventListener('click',e=>{
    const btn=e.target.closest('button')
    if(!btn)return
    const row=e.target.closest('.task')
    const id=row.getAttribute('data-id')
    if(btn.classList.contains('action-delete')){
      state=deleteTask(state,id)
      store.write(state)
      refresh()
    }
    if(btn.classList.contains('action-edit')){
      const t=state.tasks.find(x=>x.id===id)
      const title=window.prompt('edit title',t.title)
      if(!title)return
      const pri=window.prompt('priority low|med|high',t.priority)||t.priority
      state=updateTask(state,id,{title,priority:pri})
      store.write(state)
      refresh()
    }
    if(btn.classList.contains('action-complete')){
      const t=state.tasks.find(x=>x.id===id)
      const xp=calcTaskXp(t.priority,t.estimatePomodoros,state.user.streakDays)
      const user=gainXp(state.user,xp)
      const now=new Date().toISOString()
      const s=computeNewStreak(state.user.lastCompletionISO,now)
      const quests=(state.quests||[]).map(q=>{
        if(q.claimed)return q
        if(q.type==='daily' || q.type==='weekly') return {...q,progress:Math.min(q.target,q.progress+1)}
        return q
      })
      const tasks=state.tasks.map(x=>x.id===id?{...x,status:'done',completedAt:now}:x)
      const leveledUp=user.level>state.user.level
      const user2={...user,streakDays:state.user.streakDays+(s.streakDelta||0),lastCompletionISO:s.lastCompletionISO}
      const user3=evaluateBadges(user2,tasks)
      const coinsGain=5
      state={...state,user:{...user3,coins:(user3.coins||0)+coinsGain},tasks,quests}
      store.write(state)
      if(state.settings.sound){
        try{const ctx=new (window.AudioContext||window.webkitAudioContext)();const o=ctx.createOscillator();const g=ctx.createGain();o.type='triangle';o.frequency.value=660;o.connect(g);g.connect(ctx.destination);g.gain.setValueAtTime(0.001,ctx.currentTime);g.gain.exponentialRampToValueAtTime(0.2,ctx.currentTime+0.01);o.start();g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.2);o.stop(ctx.currentTime+0.22)}catch(e){}
      }
      confetti()
      if(leveledUp) alert('level up')
      refresh()
    }
  })
  list.addEventListener('reorder',e=>{
    const {from,to}=e.detail
    const ids=state.tasks.map(t=>t.id)
    const fromIdx=ids.indexOf(from)
    const toIdx=ids.indexOf(to)
    if(fromIdx<0||toIdx<0)return
    const next=[...state.tasks]
    const [moved]=next.splice(fromIdx,1)
    next.splice(toIdx,0,moved)
    state={...state,tasks:next}
    store.write(state)
    refresh()
  })
  qlist.addEventListener('click',e=>{
    const btn=e.target.closest('button')
    if(!btn)return
    const row=e.target.closest('.task')
    const id=row.getAttribute('data-id')
    if(btn.classList.contains('action-claim')){
      const q=(state.quests||[]).find(x=>x.id===id)
      if(q && !q.claimed && q.progress>=q.target){
        const user=gainXp(state.user,q.rewardXP)
        const quests=(state.quests||[]).map(x=>x.id===id?{...x,claimed:true}:x)
        state={...state,user:{...user,coins:(user.coins||0)+(q.rewardCoins||0)},quests}
        store.write(state)
        refresh()
      }
    }
  })
  const btnExport=document.getElementById('btn-export')
  const btnImport=document.getElementById('btn-import')
  const btnTheme=document.getElementById('toggle-theme')
  const btnSound=document.getElementById('toggle-sound')
  btnExport.addEventListener('click',()=>{
    const data=store.export()
    window.prompt('copy your data',data)
  })
  btnImport.addEventListener('click',()=>{
    const data=window.prompt('paste your data','')
    if(!data)return
    store.import(data)
    state=store.read()
    refresh()
  })
  btnTheme.addEventListener('click',()=>{
    state={...state,settings:{...state.settings,theme: state.settings.theme==='dark'?'light':'dark'}}
    store.write(state)
    refresh()
  })
  btnSound&&btnSound.addEventListener('click',()=>{
    state={...state,settings:{...state.settings,sound: !state.settings.sound}}
    store.write(state)
    refresh()
  })
  document.querySelectorAll('[data-filter]').forEach(b=>{
    b.addEventListener('click',()=>{
      state={...state,settings:{...state.settings,filter:b.getAttribute('data-filter')}}
      store.write(state)
      refresh()
    })
  })
}

refresh()

function ensureDailyQuest(){
  const now=new Date()
  const end=new Date(now.getFullYear(),now.getMonth(),now.getDate()+1)
  const existing=(state.quests||[]).find(q=>q.id==='daily')
  if(!existing || new Date(existing.expiresAtISO)<=now){
    const q={id:'daily',type:'daily',target:3,progress:0,rewardXP:30,rewardCoins:0,expiresAtISO:end.toISOString(),claimed:false}
    state={...state,quests:[q]}
    store.write(state)
  }
}

ensureDailyQuest()

function ensureWeeklyQuest(){
  const now=new Date()
  const day=now.getDay()
  const diff=(7-day)%7
  const end=new Date(now.getFullYear(),now.getMonth(),now.getDate()+diff,23,59,59,999)
  const existing=(state.quests||[]).find(q=>q.id==='weekly')
  if(!existing || new Date(existing.expiresAtISO)<=now){
    const q={id:'weekly',type:'weekly',target:10,progress:0,rewardXP:120,rewardCoins:0,expiresAtISO:end.toISOString(),claimed:false}
    const others=(state.quests||[]).filter(q=>q.id!=='weekly')
    state={...state,quests:[...others,q]}
    store.write(state)
  }
}

ensureWeeklyQuest()

function confetti(){
  const c=document.createElement('canvas')
  c.width=window.innerWidth
  c.height=window.innerHeight
  c.style.position='fixed'
  c.style.inset='0'
  c.style.pointerEvents='none'
  c.style.zIndex='60'
  document.body.appendChild(c)
  const ctx=c.getContext('2d')
  const parts=Array.from({length:80}).map(()=>({x:Math.random()*c.width,y:-20-Math.random()*100,r:3+Math.random()*5,vy:2+Math.random()*3,vx:(Math.random()-.5)*2,color:`hsl(${Math.floor(Math.random()*360)},90%,60%)`,rot:Math.random()*Math.PI}))
  let t=0
  const step=()=>{
    ctx.clearRect(0,0,c.width,c.height)
    parts.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.rot+=0.1;ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot);ctx.fillStyle=p.color;ctx.fillRect(-p.r,-p.r,p.r*2,p.r*2);ctx.restore()})
    t++
    if(t<120) requestAnimationFrame(step); else c.remove()
  }
  requestAnimationFrame(step)
}

