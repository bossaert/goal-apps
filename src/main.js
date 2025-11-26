import { createApp } from 'vue'
import { Quasar } from 'quasar'
import 'quasar/dist/quasar.css'
import '@quasar/extras/material-icons/material-icons.css'

import Highcharts from 'highcharts'
import HighchartsMore from 'highcharts/highcharts-more'
import HighchartsExporting from 'highcharts/modules/exporting'
import HighchartsAccessibility from 'highcharts/modules/accessibility'
import HighchartsVue from 'highcharts-vue'

HighchartsMore(Highcharts)
HighchartsExporting(Highcharts)
HighchartsAccessibility(Highcharts)
import App from './App.vue'

const app = createApp(App)

app.use(Quasar, { plugins: {} })
app.use(HighchartsVue)

app.mount('#app')
