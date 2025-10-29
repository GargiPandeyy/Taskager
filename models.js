const uid = () => Math.random().toString(36).slice(2)+Date.now().toString(36)

export function createInitialState(){
  return {
    tasks: [],
    user: { level: 1, xp: 0, xpToNext: 60, streakDays: 0, lastCompletionISO: null, coins: 0, badges: [] },
    settings: { theme: 'dark', sound: false, animations: true, filter:'all' },
    quests: []
  }
}

export function createTask(input){
  return {
    id: uid(),
    title: input.title,
    notes: input.notes||'',
    priority: input.priority||'med',
    estimatePomodoros: Number(input.estimatePomodoros||1),
    createdAt: new Date().toISOString(),
    dueAt: input.dueAt||null,
    completedAt: null,
    status: 'todo'
  }
}

export function addTask(state,task){
  return { ...state, tasks:[task,...state.tasks] }
}

export function updateTask(state,id,patch){
  return { ...state, tasks: state.tasks.map(t=>t.id===id?{...t,...patch}:t) }
}

export function deleteTask(state,id){
  return { ...state, tasks: state.tasks.filter(t=>t.id!==id) }
}

