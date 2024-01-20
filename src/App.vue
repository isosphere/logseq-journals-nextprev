<script>
  export default {
    name: 'App',

    data() {
      return {
        journals: null, // will become a dictionary where each key is the YYYYMMDD date, and the value is the page entity
      }
    },

    mounted () {
      this._updateJournalCache()
      logseq.App.onCurrentGraphChanged(() => { console.log("Graph change detected, updating cache."); this._updateJournalCache() })
      // update the cache only when we have reason to do so
      // FIXME: not triggering
      logseq.App.onTodayJournalCreated(() => { console.log("New journal creation detected, updating cache."); this._updateJournalCache()})
      //logseq.App.onTodayJournalDeleted(() => {this._updateJournalCache()}) does not exist AFAIK
    },
    
    methods: {
      async _onDaySelect ({ event, name }) {
        console.log("onDaySelect: " + name)
        if (event.shiftKey) {
          logseq.Editor.openInRightSidebar(name)
        } else {
          logseq.App.pushState('page', { name: name })
        }
      },

      _cleanJournalQueryReturn(ret) {
        return ret.flat().reduce((ac, it) => {
          const k = it[`journal-day`].toString()
          ac[k] = it
          return ac
        }, {})
      },

      async _updateJournalCache() {
        let ret

        console.log("Cache update triggered.")

        try {
          ret = await logseq.DB.datascriptQuery(`
            [:find (pull ?p [*])
              :where
              [?b :block/page ?p]
              [?p :block/journal? true]]    
          `)

          this.journals = this._cleanJournalQueryReturn(ret)
          console.log("Cache updated.")
        } catch (e) {
          console.error("Failed to update cache: " + e)
          return false
        }
        return true
      },

      async _getNewerJournals(currentJournalDate) {
        return Object.fromEntries(Object.entries(this.journals).filter(([k, v]) => k > currentJournalDate))
      },

      async _getOlderJournals(currentJournalDate) {
        return Object.fromEntries(Object.entries(this.journals).filter(([k, v]) => k < currentJournalDate))
      },

      async _getCurrentJournalDate() {
        // https://github.com/logseq/plugins/issues/10#issuecomment-1592268949
        let pageEntity = await logseq.Editor.getCurrentPage()
        let journalDay = pageEntity?.journalDay
        
        if (journalDay === "undefined" || pageEntity === null) {
          // Set currentJournalDate to the current date expressed as a "YYYYMMDD" string
          let currentDate = new Date()
          let year = currentDate.getFullYear()
          let month = String(currentDate.getMonth() + 1).padStart(2, '0')
          let day = String(currentDate.getDate()).padStart(2, '0')
          journalDay = `${year}${month}${day}`
        } 

        return journalDay;
      },

      async _prevDay() {
        let currentJournalDate = await this._getCurrentJournalDate()

        if (typeof currentJournalDate === 'undefined') {
          return;
        }
      
        let journals = await this._getOlderJournals(currentJournalDate)
        let prev_day = Math.max(...Object.keys(journals).map(Number))

        if (!journals[prev_day]) {
          return;
        }

        return journals[prev_day]['name']
      },

      async _nextDay() {
        let currentJournalDate = await this._getCurrentJournalDate()

        if (typeof currentJournalDate === 'undefined') {
          return;
        }

        let journals = await this._getNewerJournals(currentJournalDate)
        let next_day = Math.min(...Object.keys(journals).map(Number))

        if (!journals[next_day]) {
          return;
        }

        return journals[next_day]['name'];
      }
    },
  }
</script>
