import '@logseq/libs'
import { createApp } from 'vue'
import App from './App.vue'
import './index.css'

/** settings **/
let app = null

// for duplicate hook
let processing = false

/**
 * user model
 */
const model = {
  goToDayOfJournal (name) {
    app._onDaySelect({event: {}, name: name})
  },

  async prevDay () {
    let prior_date = await app._prevDay()
    if (prior_date) {
      this.goToDayOfJournal(prior_date)
    }
  },

  async nextDay () {
    let next_date = await app._nextDay()
    if (next_date) {
      this.goToDayOfJournal(next_date)
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
      <a class="button" id="next-day-button" data-on-click="nextDay" data-rect>
        <i class="ti ti-square-arrow-right"></i> 
      </a>
    `,
  })

  logseq.App.registerUIItem('toolbar', {
    key: 'open-a-next-day', template: `
      <a class="button" id="prev-day-button" data-on-click="prevDay" data-rect>
        <i class="ti ti-square-arrow-left"></i> 
      </a>
    `,
  })

  // fade buttons when not available (CSS)
  logseq.provideStyle(`
    body[data-page="page"] div#left-container:not(:has(div#main-content-container div.page.is-journals)) div#head :is(a#next-day-button,a#prev-day-button){
      opacity: 0.3;
      cursor: not-allowed;
    }
    `)
  
  // hook

  // ** FIXME: Requires page creation hook (Check if it is a journal) **
  

  // update the cache only when we have reason to do so
  
  logseq.App.onCurrentGraphChanged(() => { // *** graph change only ***
    if (processing) return
    processing = true

    console.log("Graph change detected, updating cache.")
    app._updateJournalCache()

    setTimeout(() => processing = false, 1000);
  })

  logseq.App.onTodayJournalCreated(() => { // *** CAUTION: today journal only ***
    if (processing) return
    processing = true

    console.log("New journal creation detected, updating cache.")
    app._updateJournalCache()

    setTimeout(() => processing = false, 1000);
  })
  //does not exist AFAIK

  // main UI
  app = createApp(App).mount('#app')
}

// bootstrap
logseq.ready(main).catch(null)
