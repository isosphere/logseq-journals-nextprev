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


  // main UI
  app = createApp(App).mount('#app')
}

// bootstrap
logseq.ready(main).catch(null)
