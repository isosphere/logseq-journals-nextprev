import '@logseq/libs'
import { createApp } from 'vue'
import App from './App.vue'
import './index.css'

/** settings **/
let app = null

/**
 * user model
 */
const model = {
  goToDayOfJournal (name) {
    app._onDaySelect({event: {}, name: name})
  },

  async prevDay (_context) {
    let prior_date = await app._prevDay()
    if (prior_date) {
      this.goToDayOfJournal(prior_date)
    }
  },

  async nextDay (_context) {
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

  // main UI
  app = createApp(App).mount('#app')
}

// bootstrap
logseq.ready(main).catch(null)
