const KEY = 'taskager:v1'
export const store = {
  read(){return JSON.parse(localStorage.getItem(KEY)||'{}')},
  write(s){localStorage.setItem(KEY,JSON.stringify(s))},
  patch(p){const s={...this.read(),...p};this.write(s);return s},
  export(){return btoa(unescape(encodeURIComponent(JSON.stringify(this.read()))))},
  import(b64){this.write(JSON.parse(decodeURIComponent(escape(atob(b64)))))}
}

