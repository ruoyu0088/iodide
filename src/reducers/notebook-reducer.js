import * as NB from '../notebook-utils.js'

function clearHistory(loadedState) {
  // remove history and declared properties before exporting the state.
  loadedState.declaredProperties = {}
  loadedState.history = []
  loadedState.externalScripts = []
  loadedState.executionNumber = 0
}

let notebook = function (state=newNotebook(), action) {
  switch (action.type) {
    case 'NEW_NOTEBOOK':
      var newState = NB.newNotebook()
      return newState

    case 'EXPORT_NOTEBOOK':
      var outputState = Object.assign({}, state)
      clearHistory(outputState)
      var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(outputState))
      var dlAnchorElem = document.getElementById('export-anchor')
      dlAnchorElem.setAttribute("href", dataStr)
      var title = outputState.title === undefined ? 'new-notebook' : outputState.title
      var filename = title.replace(/[^a-z0-9]/gi, '-').toLowerCase() + '.json'
      dlAnchorElem.setAttribute("download", filename)
      dlAnchorElem.click()
      return Object.assign({}, state)

    case 'IMPORT_NOTEBOOK':
      // note: loading a NB should always assign to a copy of the latest global
      // and per-cell state for backwards compatibility
      var loadedState = action.newState
      var cells = loadedState.cells.map(
        cell => Object.assign(NB.newCell(loadedState.cells, cell.cellType), cell) )
      return Object.assign(NB.blankState(), loadedState, {cells})

    case 'SAVE_NOTEBOOK':
      var lastSaved = new Date()
      var outputState = Object.assign({}, state, {lastSaved})
      clearHistory(outputState)
      var title
      if (action.title!==undefined) title = action.title
      else title = state.title
      window.localStorage.setItem(title, JSON.stringify(outputState))
      return Object.assign({}, state, {lastSaved})

    case 'LOAD_NOTEBOOK':
      // note: loading a NB should always assign to a copy of the latest global
      // and per-cell state for backwards compatibility
      var loadedState = JSON.parse(window.localStorage.getItem(action.title))
      var cells = loadedState.cells.map(
        cell => Object.assign(NB.newCell(loadedState.cells, cell.cellType), cell) )
      return Object.assign(NB.blankState(), loadedState, {cells})

    case 'DELETE_NOTEBOOK':
      var title = action.title
      if (window.localStorage.hasOwnProperty(title)) window.localStorage.removeItem(title)
      var newState = (title === state.title) ? Object.assign({}, NB.newNotebook()) : Object.assign({}, state)
      return newState

    case 'CHANGE_PAGE_TITLE':
      return Object.assign({}, state, {title: action.title})

    case 'CHANGE_MODE':
      var mode = action.mode
      return Object.assign({}, state, {mode});
    
    case 'CHANGE_SIDE_PANE_MODE':
      return Object.assign({}, state, {sidePaneMode: action.mode})
    
    default:
        return state
  }
}

  export default notebook