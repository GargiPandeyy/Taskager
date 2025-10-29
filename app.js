import { store } from './storage.js'
import { createInitialState } from './models.js'
import { render } from './ui.js'

const existing = store.read()
const state = Object.keys(existing).length ? existing : createInitialState()
store.write(state)

const root = document.getElementById('app')
render(root, state)

