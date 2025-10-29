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
  renderTasks(list,state.tasks)
  const qlist=document.getElementById('quests-list')
  renderQuests(qlist,state.quests||[])
  const blist=document.getElementById('badges-list')
  renderBadges(blist,state.user.badges||[])
  const form=document.getElementById('create-form')
  form.addEventListener('submit',e=>{
    e.preventDefault()
    const fd=new FormData(form)
    const task=createTask({
      title:fd.get('title'),
      priority:fd.get('priority'),
      estimatePomodoros:fd.get('estimate')
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
    if(btn.classList.contains('action-complete')){
      const t=state.tasks.find(x=>x.id===id)
      const xp=calcTaskXp(t.priority,t.estimatePomodoros,state.user.streakDays)
      const user=gainXp(state.user,xp)
      const now=new Date().toISOString()
      const s=computeNewStreak(state.user.lastCompletionISO,now)
      const quests=(state.quests||[]).map(q=>q.type==='daily'&&!q.claimed?{...q,progress:Math.min(q.target,q.progress+1)}:q)
      const tasks=state.tasks.map(x=>x.id===id?{...x,status:'done',completedAt:now}:x)
      const user2={...user,streakDays:state.user.streakDays+(s.streakDelta||0),lastCompletionISO:s.lastCompletionISO}
      const user3=evaluateBadges(user2,tasks)
      state={...state,user:user3,tasks,quests}
      store.write(state)
      refresh()
    }
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
        state={...state,user,quests}
        store.write(state)
        refresh()
      }
    }
  })
  const btnExport=document.getElementById('btn-export')
  const btnImport=document.getElementById('btn-import')
  const btnTheme=document.getElementById('toggle-theme')
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

