<script>
  export default {
    name: 'App',
    
    methods: {
      async _onDaySelect ({ event, name }) {
        console.debug("onDaySelect: " + name)
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

      async _getNewerJournals(currentJournalDate) {
        let ret

        try {
          ret = await logseq.DB.datascriptQuery(`
            [:find (pull ?p [:block/journal-day :block/name])
            :where
            [?b :block/page ?p]
            [?p :block/journal? true]
            [?p :block/journal-day ?d]
            [(> ?d ${currentJournalDate})]]
          `)
        } catch (e) {
          console.error(e)
        }        

        return this._cleanJournalQueryReturn(ret)
      },

      async _getOlderJournals(currentJournalDate) {
        let ret

        try {
          ret = await logseq.DB.datascriptQuery(`
            [:find (pull ?p [:block/journal-day :block/name])
            :where
            [?b :block/page ?p]
            [?p :block/journal? true]
            [?p :block/journal-day ?d]
            [(< ?d ${currentJournalDate})]]
          `)
        } catch (e) {
          console.error(e)
        }

        return this._cleanJournalQueryReturn(ret)
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
