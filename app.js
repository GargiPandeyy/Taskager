import { store } from './storage.js'
import { createInitialState } from './models.js'
import { render, renderTasks } from './ui.js'
import { createTask, addTask, deleteTask } from './models.js'

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
  })
}

refresh()

