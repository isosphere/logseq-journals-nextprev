<script>
  export default {
    name: 'App',

    data () {
      return {
        shift_held: false,
        hook_timer: null,
      }
    },

    // FIXME: these events do not fire
    mounted () {
      // We won't be able to find our toolbar buttons while `mounted() {}` is still executing, so we'll defer this
      this.hook_timer = setTimeout(this._hookShiftButton, 250)     
    },

    beforeUnmount () {
      let previous_day_button = parent.document.getElementById('prev-day-button')
      let next_day_button = parent.document.getElementById('next-day-button')
      
      previous_day_button.removeEventListener('keydown', this._updateShift)
      previous_day_button.removeEventListener('keyup', this._updateShift)
      next_day_button.removeEventListener('keydown', this._updateShift)
      next_day_button.removeEventListener('keyup', this._updateShift)      
    },
    
    methods: {
      _hookShiftButton () {
        if (parent.document.getElementById('prev-day-button') === null) {
          console.log("Couldn't find toolbar buttons, trying again in 1 second.")
          this.hook_timer = setTimeout(this._hookShiftButton, 1000)
          return
        }

        console.log("Toolbar items found, clearing timer and hooking UI elements.")
        clearInterval(this.hook_timer)

        // keyboard shortcuts
        let previous_day_button = parent.document.getElementById('prev-day-button')
        let next_day_button = parent.document.getElementById('next-day-button')

        previous_day_button.addEventListener('keydown', this._updateShift)
        previous_day_button.addEventListener('keyup', this._updateShift)
        next_day_button.addEventListener('keydown', this._updateShift)
        next_day_button.addEventListener('keyup', this._updateShift)         
      },
      _updateShift (e) {
        this.shift_held = e.shiftKey
      },

      async _onDaySelect ({ event, name, uuid }) {
        console.debug("onDaySelect: " + name)
        if (event.shiftKey || this.shift_held) {
          logseq.Editor.openInRightSidebar(uuid)
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
            [:find (pull ?p [:block/journal-day :block/name :block/uuid])
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
            [:find (pull ?p [:block/journal-day :block/name :block/uuid])
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

        return journals[prev_day]
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

        return journals[next_day]
      }
    },
  }
</script>
