const el=(t,p={},c=[])=>{const e=document.createElement(t);Object.entries(p).forEach(([k,v])=>{if(k==='class')e.className=v;else if(k==='html')e.innerHTML=v;else e.setAttribute(k,v)});c.forEach(x=>e.append(x));return e}

export function render(root,state){
  const container=el('div',{class:'container'})
  if(!document.getElementById('scene')){
    const scene=el('div',{id:'scene'})
    const make=(cls,style)=>{const d=el('div',{class:cls,style});scene.append(d)}
    make('orb pink',`left:5vw;top:10vh;width:220px;height:220px;animation-delay:0s`)
    make('orb sky',`right:8vw;top:30vh;width:180px;height:180px;animation-delay:.5s`)
    make('orb lime',`left:20vw;bottom:8vh;width:260px;height:260px;animation-delay:1s`)
    make('ufo',`top:22vh;left:8vw`)
    document.body.append(scene)
  }
  const header=el('div',{class:'row'},[
    el('div',{class:'brand'},['Taskager']),
  ])
  const grid=el('div',{class:'grid'})
  const left=el('div',{class:'card'})
  const right=el('div',{class:'card'})

  const user=state.user||{level:1,xp:0,xpToNext:60,streakDays:0,coins:0}
  const settingsState=state.settings||{theme:'dark',sound:false}
  const pct=Math.min(100,((user.xp/Math.max(1,user.xpToNext))*100))
  const stats=el('div',{},[
    el('div',{class:'row'},[
      el('div',{class:'chip'},[`lv ${user.level}`]),
      el('div',{class:'muted'},[`xp ${user.xp}/${user.xpToNext}`]),
      el('div',{class:'chip'},[`streak ${user.streakDays}`]),
      el('div',{class:'chip'},[`coins ${user.coins||0}`])
    ]),
    el('div',{class:'bar',role:'progressbar','aria-valuemin':'0','aria-valuemax':'100','aria-valuenow':String(pct)},[el('span',{style:`width:${pct}%`})])
  ])
  const settings=el('div',{class:'row',style:'gap:8px;flex-wrap:wrap'},[
    el('button',{class:'btn secondary',id:'toggle-theme'},[settingsState.theme==='dark'?'light':'dark']),
    el('button',{class:'btn secondary',id:'toggle-sound'},[settingsState.sound?'sound on':'sound off']),
    el('button',{class:'btn secondary',id:'btn-export'},['export']),
    el('button',{class:'btn secondary',id:'btn-import'},['import']),
    el('button',{class:'btn candy',id:'open-help'},['help'])
  ])
  const filters=el('div',{class:'row',style:'gap:8px;flex-wrap:wrap'},[
    el('button',{class:'btn secondary filter-all',"data-filter":'all'},['all']),
    el('button',{class:'btn secondary filter-todo',"data-filter":'todo'},['todo']),
    el('button',{class:'btn secondary filter-done',"data-filter":'done'},['done'])
  ])

  const composer=el('form',{id:'create-form',class:'row',style:'gap:8px;flex-wrap:wrap'},[
    el('input',{class:'input',name:'title',placeholder:'add a task...',style:'flex:1;min-width:240px'}),
    el('select',{class:'input',name:'priority',style:'width:140px'},[
      el('option',{value:'low'},['low']),
      el('option',{value:'med',selected:''},['med']),
      el('option',{value:'high'},['high'])
    ]),
    el('input',{class:'input',type:'number',name:'estimate',min:'1',value:'1',style:'width:100px'}),
    el('input',{class:'input',type:'date',name:'due',style:'width:160px'}),
    el('button',{class:'btn candy',type:'submit',title:'add task'},['add'])
  ])

  left.append(el('div',{class:'row'},[el('div',{class:'title'},['tasks'])]))
  left.append(composer)
  left.append(el('div',{class:'list',id:'tasks-list'}))

  right.append(el('div',{class:'row'},[el('div',{class:'title'},['quests'])]))
  right.append(el('div',{class:'list',id:'quests-list'}))
  right.append(el('div',{class:'row',style:'margin-top:8px'},[el('button',{class:'btn secondary',id:'open-badges'},['badges'])]))
  right.append(el('div',{id:'badges-modal',style:'display:none;position:fixed;inset:0;background:rgba(0,0,0,.6);align-items:center;justify-content:center;z-index:50'},[
    el('div',{class:'card',style:'max-width:600px;width:90%;max-height:80vh;overflow:auto'},[
      el('div',{class:'row',style:'justify-content:space-between'},[
        el('div',{class:'title'},['badges']),
        el('button',{class:'btn secondary',id:'close-badges'},['close'])
      ]),
      el('div',{class:'list',id:'badges-list'})
    ])
  ]))

  right.append(el('div',{id:'help-modal',style:'display:none;position:fixed;inset:0;background:rgba(0,0,0,.6);align-items:center;justify-content:center;z-index:50'},[
    el('div',{class:'card',style:'max-width:700px;width:92%;max-height:82vh;overflow:auto'},[
      el('div',{class:'row',style:'justify-content:space-between'},[
        el('div',{class:'title'},['how to use taskager']),
        el('button',{class:'btn secondary',id:'close-help'},['close'])
      ]),
      el('div',{class:'list'},[
        el('div',{class:'task'},['add tasks with a title, priority, estimate and optional due date.']),
        el('div',{class:'task'},['complete tasks to earn xp, coins and keep streaks.']),
        el('div',{class:'task'},['claim daily and weekly quests when progress is full.']),
        el('div',{class:'task'},['badges unlock automatically as you achieve milestones.']),
        el('div',{class:'task'},['use theme, sound, export/import in settings.']),
        el('div',{class:'task'},['drag tasks to reorder; use filters to view all/todo/done.'])
      ])
    ])
  ]))

  grid.append(left)
  grid.append(right)
  container.append(header)
  container.append(el('div',{class:'card'},[stats]))
  container.append(el('div',{class:'card'},[settings]))
  container.append(el('div',{class:'card'},[filters]))
  container.append(grid)
  root.replaceChildren(container)
}

export function renderTasks(listEl,tasks){
  const items=tasks.map(t=>{
    const row=el('div',{class:'task',"data-id":t.id,draggable:'true'},[
      el('div',{},[
        el('div',{class:'title'},[t.title,' ',el('span',{class:`chip prio-${t.priority}`},[t.priority])]),
        el('div',{class:'muted'},[t.dueAt?`due ${t.dueAt}`:''])
      ]),
      el('div',{class:'actions'},[
        el('button',{class:'btn secondary action-edit',type:'button'},['edit']),
        el('button',{class:'btn secondary action-complete',type:'button',title:'complete task'},['done']),
        el('button',{class:'btn secondary action-delete',type:'button',title:'delete task'},['delete'])
      ])
    ])
    return row
  })
  listEl.replaceChildren(...items)
  let dragId=null
  listEl.querySelectorAll('.task').forEach(row=>{
    row.addEventListener('dragstart',e=>{dragId=row.getAttribute('data-id')})
    row.addEventListener('dragover',e=>{e.preventDefault()})
    row.addEventListener('drop',e=>{
      e.preventDefault()
      const targetId=row.getAttribute('data-id')
      if(!dragId||dragId===targetId)return
      const ev=new CustomEvent('reorder',{detail:{from:dragId,to:targetId}})
      listEl.dispatchEvent(ev)
    })
  })
}

export function renderQuests(listEl,quests){
  const items=quests.map(q=>{
    const pct=Math.min(100,(q.progress/q.target)*100)
    return el('div',{class:'task',"data-id":q.id},[
      el('div',{},[`${q.type} ${q.progress}/${q.target}`]),
      el('div',{class:'actions'},[
        el('button',{class:'btn secondary action-claim',type:'button',disabled: q.progress<q.target || q.claimed? '': null},[q.claimed?'claimed':'claim'])
      ])
    ])
  })
  listEl.replaceChildren(...items)
}

export function renderBadges(listEl,badges){
  const items=(badges||[]).map(b=>el('div',{class:'task'},[b]))
  listEl.replaceChildren(...items)
}

