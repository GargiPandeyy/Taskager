export const xpForLevel=l=>50+10*l
export function gainXp(user,g){let xp=user.xp+g;let level=user.level;let toNext=user.xpToNext;while(xp>=toNext){xp-=toNext;level+=1;toNext=xpForLevel(level)}return{...user,xp,level,xpToNext:toNext}}

