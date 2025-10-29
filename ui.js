const el=(t,p={},c=[])=>{const e=document.createElement(t);Object.entries(p).forEach(([k,v])=>{if(k==='class')e.className=v;else if(k==='html')e.innerHTML=v;else e.setAttribute(k,v)});c.forEach(x=>e.append(x));return e}

export function render(root,state){
  const container=el('div',{class:'container'})
  const header=el('div',{class:'row'},[
    el('div',{class:'brand'},['Taskager']),
  ])
  const grid=el('div',{class:'grid'})
  const left=el('div',{class:'card'})
  const right=el('div',{class:'card'})

  const stats=el('div',{},[
    el('div',{class:'row'},[
      el('div',{class:'chip'},[`lv ${state.user.level}`]),
      el('div',{class:'muted'},[`xp ${state.user.xp}/${state.user.xpToNext}`]),
      el('div',{class:'chip'},[`streak ${state.user.streakDays}`])
    ]),
    el('div',{class:'bar'},[el('span',{style:`width:${Math.min(100,(state.user.xp/state.user.xpToNext)*100)}%`})])
  ])

  const composer=el('form',{id:'create-form',class:'row',style:'gap:8px;flex-wrap:wrap'},[
    el('input',{class:'input',name:'title',placeholder:'add a task...',style:'flex:1;min-width:240px'}),
    el('select',{class:'input',name:'priority',style:'width:140px'},[
      el('option',{value:'low'},['low']),
      el('option',{value:'med',selected:''},['med']),
      el('option',{value:'high'},['high'])
    ]),
    el('input',{class:'input',type:'number',name:'estimate',min:'1',value:'1',style:'width:100px'}),
    el('button',{class:'btn',type:'submit'},['add'])
  ])

  left.append(el('div',{class:'row'},[el('div',{class:'title'},['tasks'])]))
  left.append(composer)
  left.append(el('div',{class:'list',id:'tasks-list'}))

  right.append(el('div',{class:'row'},[el('div',{class:'title'},['quests'])]))
  right.append(el('div',{class:'list',id:'quests-list'}))

  grid.append(left)
  grid.append(right)
  container.append(header)
  container.append(el('div',{class:'card'},[stats]))
  container.append(grid)
  root.replaceChildren(container)
}

