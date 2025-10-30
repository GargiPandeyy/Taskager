const el=(t,p={},c=[])=>{const e=document.createElement(t);Object.entries(p).forEach(([k,v])=>{if(k==='class')e.className=v;else if(k==='html')e.innerHTML=v;else e.setAttribute(k,v)});c.forEach(x=>e.append(x));return e}

const icon=(name,size=16)=>{const i=document.createElement('i');i.setAttribute('data-lucide',name);i.style.width=`${size}px`;i.style.height=`${size}px`;return i}

export function render(root,state){
  const container=el('div',{class:'container'})

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
      el('div',{class:'chip'},[icon('trending-up'),`lv ${user.level}`]),
      el('div',{class:'muted'},[icon('zap'),`xp ${user.xp}/${user.xpToNext}`]),
      el('div',{class:'chip'},[icon('flame'),`streak ${user.streakDays}`]),
      el('div',{class:'chip'},[icon('coins'),`coins ${user.coins||0}`])
    ]),
    el('div',{class:'bar',role:'progressbar','aria-valuemin':'0','aria-valuemax':'100','aria-valuenow':String(pct)},[el('span',{style:`width:${pct}%`})])
  ])

  const settings=el('div',{class:'row',style:'gap:8px;flex-wrap:wrap'},[
    el('button',{class:'btn secondary',id:'toggle-theme'},[icon(settingsState.theme==='dark'?'sun':'moon'),settingsState.theme==='dark'?'light':'dark']),
    el('button',{class:'btn secondary',id:'toggle-sound'},[icon(settingsState.sound?'volume-2':'volume-x'),settingsState.sound?'sound on':'sound off']),
    el('button',{class:'btn secondary',id:'btn-export'},[icon('download'),'export']),
    el('button',{class:'btn secondary',id:'btn-import'},[icon('upload'),'import']),
    el('button',{class:'btn',id:'open-help'},[icon('help-circle'),'tutorial'])
  ])

  const filters=el('div',{class:'row',style:'gap:8px;flex-wrap:wrap'},[
    el('button',{class:'btn secondary filter-all',"data-filter":'all'},[icon('circle'),'all']),
    el('button',{class:'btn secondary filter-todo',"data-filter":'todo'},[icon('circle-dot'),'todo']),
    el('button',{class:'btn secondary filter-done',"data-filter":'done'},[icon('check-circle'),'done'])
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
    el('button',{class:'btn',type:'submit',title:'add task'},[icon('plus'),'add'])
  ])

  left.append(el('div',{class:'row'},[el('div',{class:'title'},[icon('list-todo'),'tasks'])]))
  left.append(composer)
  left.append(el('div',{class:'list',id:'tasks-list'}))

  right.append(el('div',{class:'row'},[el('div',{class:'title'},[icon('target'),'quests'])]))
  right.append(el('div',{class:'list',id:'quests-list'}))
  right.append(el('div',{class:'row',style:'margin-top:8px'},[el('button',{class:'btn secondary',id:'open-badges'},[icon('award'),'badges'])]))

  right.append(el('div',{id:'badges-modal',style:'display:none;position:fixed;inset:0;background:rgba(0,0,0,.6);align-items:center;justify-content:center;z-index:50'},[
    el('div',{class:'card',style:'max-width:600px;width:90%;max-height:80vh;overflow:auto'},[
      el('div',{class:'row',style:'justify-content:space-between'},[
        el('div',{class:'title'},[icon('award'),'badges']),
        el('button',{class:'btn secondary',id:'close-badges'},[icon('x'),'close'])
      ]),
      el('div',{class:'list',id:'badges-list'})
    ])
  ]))

  right.append(el('div',{id:'help-modal',style:'display:none;position:fixed;inset:0;background:rgba(0,0,0,.6);align-items:center;justify-content:center;z-index:50'},[
    el('div',{class:'card',style:'max-width:720px;width:92%;max-height:82vh;overflow:auto'},[
      el('div',{class:'row',style:'justify-content:space-between'},[
        el('div',{class:'title'},[icon('help-circle'),'how to play taskager']),
        el('button',{class:'btn secondary',id:'close-help'},[icon('x'),'close'])
      ]),
      el('div',{class:'list'},[
        el('div',{class:'task'},[icon('edit-3'),'1. add a task: title + priority + estimate (and optional due date).']),
        el('div',{class:'task'},[icon('trending-up'),'2. complete tasks to earn xp and coins. level up as the bar fills.']),
        el('div',{class:'task'},[icon('flame'),'3. keep a daily streak by completing at least one task per day.']),
        el('div',{class:'task'},[icon('target'),'4. finish daily (3) and weekly (10) tasks, then press claim.']),
        el('div',{class:'task'},[icon('award'),'5. badges unlock automatically at milestones in the badges panel.']),
        el('div',{class:'task'},[icon('filter'),'6. use filters, drag to reorder, and export/import to back up data.'])
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

  // Initialize Lucide icons
  if(window.lucide){
    window.lucide.createIcons()
  }
}

export function renderTasks(listEl,tasks){
  const items=tasks.map(t=>{
    const row=el('div',{class:'task',"data-id":t.id,draggable:'true'},[
      el('div',{},[
        el('div',{class:'title'},[t.title,' ',el('span',{class:`chip prio-${t.priority}`},[t.priority])]),
        el('div',{class:'muted'},[t.dueAt?`${icon('calendar').outerHTML} due ${t.dueAt}`:''])
      ]),
      el('div',{class:'actions'},[
        el('button',{class:'btn secondary action-edit',type:'button'},[icon('pencil'),'edit']),
        el('button',{class:'btn secondary action-complete',type:'button',title:'complete task'},[icon('check'),'done']),
        el('button',{class:'btn secondary action-delete',type:'button',title:'delete task'},[icon('trash-2'),'delete'])
      ])
    ])
    return row
  })
  listEl.replaceChildren(...items)

  // Initialize Lucide icons for new tasks
  if(window.lucide){
    window.lucide.createIcons()
  }

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
      el('div',{},[icon('target'),`${q.type} ${q.progress}/${q.target}`]),
      el('div',{class:'actions'},[
        el('button',{class:'btn secondary action-claim',type:'button',disabled: q.progress<q.target || q.claimed? '': null},[icon(q.claimed?'check':'gift'),q.claimed?'claimed':'claim'])
      ])
    ])
  })
  listEl.replaceChildren(...items)

  // Initialize Lucide icons
  if(window.lucide){
    window.lucide.createIcons()
  }
}

export function renderBadges(listEl,badges){
  const items=(badges||[]).map(b=>el('div',{class:'task'},[icon('award'),b]))
  listEl.replaceChildren(...items)

  // Initialize Lucide icons
  if(window.lucide){
    window.lucide.createIcons()
  }
}
