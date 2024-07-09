import '@logseq/libs'
import { createApp } from 'vue'
import App from './App.vue'
import './index.css'

/** settings **/
const settingsSchema = [
  {
    key: 'hotkey_next',
    type: 'string',
    title: 'Shortcut: Next Journal',
    description: 'A hotkey to go to the next journal that exists, chronologically.',
    default: "ctrl+right",
  },
  {
    key: 'hotkey_prev',
    type: 'string',
    title: 'Shortcut: Previous Journal',
    description: 'A hotkey to go to the previous journal that exists, chronologically.',
    default: "ctrl+left",
  },  
]

let app = null

/**
 * user model
 */
const model = {
  goToDayOfJournal (journal_instance) {
    app._onDaySelect({event: {}, name: journal_instance['name'], uuid: journal_instance['uuid']})
  },

  async prevDay (_context) {
    let prior_journal = await app._prevDay()
    if (prior_journal) {
      this.goToDayOfJournal(prior_journal)
    }
  },

  async nextDay (_context) {
    let next_journal = await app._nextDay()
    if (next_journal) {
      this.goToDayOfJournal(next_journal)
    }
  },
}

/**
 * app entry
 */
function main () {
  logseq.setMainUIInlineStyle({
    position: 'fixed', zIndex: 11,
  })
  logseq.provideModel(model)

  // external btns
  logseq.App.registerUIItem('toolbar', {
    key: 'open-d-next-day', template: `
      <a class="button" id="next-day-button" data-on-click="nextDay" data-rect tabindex="0">
        <i class="ti ti-square-arrow-right"></i> 
      </a>
    `,
  })

  logseq.App.registerUIItem('toolbar', {
    key: 'open-a-next-day', template: `
      <a class="button" id="prev-day-button" data-on-click="prevDay" data-rect tabindex="0">
        <i class="ti ti-square-arrow-left"></i> 
      </a>
    `,
  })

  logseq.provideStyle(`
    body[data-page="page"] div#left-container:not(:has(div#main-content-container div.page.is-journals)) div#head :is(a#next-day-button,a#prev-day-button){
      opacity: 0.3;
      cursor: not-allowed;
    }
  `)

  if (logseq.settings.hotkey_next) {
    logseq.App.registerCommandShortcut({
      binding: logseq.settings.hotkey_next,
      }, () => { model.nextDay(null) }
    )
  }

  if (logseq.settings.hotkey_prev) {
    logseq.App.registerCommandShortcut({
      binding: logseq.settings.hotkey_prev,
      }, () => { model.prevDay(null) }
    )
  }

  // main UI
  app = createApp(App).mount('#app')
}

// bootstrap
logseq.useSettingsSchema(settingsSchema).ready(main).catch(null)