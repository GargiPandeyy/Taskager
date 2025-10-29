const VERSION='v1'
const KEY=`taskager:${VERSION}`
const readRaw=()=>JSON.parse(localStorage.getItem(KEY)||'{}')
export const store={
  read(){const s=readRaw();return s.__version?s:{...s,__version:VERSION}},
  write(s){const v={...s,__version:VERSION};localStorage.setItem(KEY,JSON.stringify(v))},
  patch(p){const s={...this.read(),...p};this.write(s);return s},
  export(){return btoa(unescape(encodeURIComponent(JSON.stringify(this.read()))))},
  import(b64){const s=JSON.parse(decodeURIComponent(escape(atob(b64))));this.write(s)}
}

