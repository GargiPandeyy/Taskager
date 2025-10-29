import { store } from './storage.js'
import { createInitialState } from './models.js'
import { render, renderTasks } from './ui.js'
import { createTask, addTask, deleteTask, updateTask } from './models.js'
import { calcTaskXp, gainXp, computeNewStreak } from './game.js'

const existing = store.read()
let state = Object.keys(existing).length ? existing : createInitialState()
store.write(state)

const root = document.getElementById('app')
function refresh(){
  render(root,state)
  const list=document.getElementById('tasks-list')
  renderTasks(list,state.tasks)
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
      state={...state,user:{...user,streakDays:state.user.streakDays+(s.streakDelta||0),lastCompletionISO:s.lastCompletionISO},tasks:state.tasks.map(x=>x.id===id?{...x,status:'done',completedAt:now}:x)}
      store.write(state)
      refresh()
    }
  })
}

refresh()

