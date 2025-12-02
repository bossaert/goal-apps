<template>
  <div class="q-pa-md">
    <!-- Heading -->
    <div class="q-mb-md">
      <div class="text-subtitle1 q-mb-xs">
        Zone 3 – Funding (Lifetime Cash Flow)
      </div>
      <div class="text-caption text-grey-7">
        Pre-retirement years show employment income, contributions, and taxes.
        Retirement years add Social Security, pension/annuity, RMD, and portfolio
        income to support the target income amount.
      </div>
    </div>

    <!-- Chart -->
    <q-card flat bordered class="q-pa-md q-mb-lg">
      <div id="funding-chart-container" style="width: 100%; height: 400px;"></div>
    </q-card>

    <!-- Table -->
    <q-card flat bordered>
      <q-card-section class="row items-center justify-between q-pb-none">
        <div class="column">
          <div class="text-subtitle2">
            Annual Lifetime Cash Flow
          </div>
          <div class="text-caption text-grey-7">
            Dashes (–) indicate values that do not apply in a given year
            (for example, Social Security before claiming, contributions after
            retirement, or target income amount before retirement).
          </div>
        </div>

        <!-- Year / Age toggle -->
        <div class="row items-center q-gutter-sm">
          <span class="text-caption text-grey-7">View by:</span>
          <q-btn-toggle
            v-model="timelineMode"
            :options="timelineOptions"
            dense
            unelevated
            color="primary"
            toggle-color="primary"
          />
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section class="q-pa-none">
        <div class="funding-table-wrapper">
          <q-table
            :rows="cashflowRows"
            :columns="columns"
            row-key="year"
            flat
            dense
            :pagination="pagination"
            class="funding-table"
            :row-class="rowClass"
          >
            <!-- Year / Age column -->
            <template #body-cell-yearAge="props">
              <q-td :props="props">
                <span v-if="timelineMode === 'year'">
                  {{ props.row.year }}
                </span>
                <span v-else>
                  <span v-if="props.row.agePrimary != null || props.row.ageSpouse != null">
                    <template v-if="props.row.agePrimary != null && props.row.ageSpouse != null">
                      {{ props.row.agePrimary }} / {{ props.row.ageSpouse }}
                    </template>
                    <template v-else-if="props.row.agePrimary != null">
                      {{ props.row.agePrimary }}
                    </template>
                    <template v-else>
                      {{ props.row.ageSpouse }}
                    </template>
                  </span>
                  <span v-else class="text-grey-6">–</span>
                </span>
              </q-td>
            </template>

            <!-- Income columns -->
            <template #body-cell-salary="props">
              <q-td :props="props">
                <span v-if="props.row.salaryWages != null"
                      :class="valueColorClass(props.row.salaryWages, false)">
                  {{ formatCurrency(props.row.salaryWages) }}
                </span>
                <span v-else class="text-grey-6">–</span>
              </q-td>
            </template>

            <template #body-cell-socialSecurity="props">
              <q-td :props="props">
                <span
                  v-if="!isPreRetirement(props.row) && props.row.socialSecurity != null"
                  :class="valueColorClass(props.row.socialSecurity, false)">
                  {{ formatCurrency(props.row.socialSecurity) }}
                </span>
                <span v-else class="text-grey-6">–</span>
              </q-td>
            </template>

            <template #body-cell-pension="props">
              <q-td :props="props">
                <span
                  v-if="!isPreRetirement(props.row) && props.row.pensionAnnuity != null"
                  :class="valueColorClass(props.row.pensionAnnuity, false)">
                  {{ formatCurrency(props.row.pensionAnnuity) }}
                </span>
                <span v-else class="text-grey-6">–</span>
              </q-td>
            </template>

            <template #body-cell-otherIncome="props">
              <q-td :props="props">
                <span :class="valueColorClass(props.row.otherIncome ?? 0, false)">
                  {{ formatCurrency(props.row.otherIncome ?? 0) }}
                </span>
              </q-td>
            </template>

            <template #body-cell-rmd="props">
              <q-td :props="props">
                <span
                  v-if="!isPreRetirement(props.row) && props.row.rmd != null"
                  :class="valueColorClass(props.row.rmd, false)">
                  {{ formatCurrency(props.row.rmd) }}
                </span>
                <span v-else class="text-grey-6">–</span>
              </q-td>
            </template>

            <template #body-cell-portfolioIncome="props">
              <q-td :props="props">
                <span
                  v-if="props.row.portfolioIncome != null"
                  :class="valueColorClass(props.row.portfolioIncome, false)">
                  {{ formatCurrency(props.row.portfolioIncome) }}
                </span>
                <span v-else class="text-grey-6">–</span>
              </q-td>
            </template>

            <!-- Expense columns -->
            <template #body-cell-contributions="props">
              <q-td :props="props">
                <span v-if="props.row.contributions != null"
                      :class="valueColorClass(props.row.contributions, true)">
                  {{ formatCurrency(props.row.contributions) }}
                </span>
                <span v-else class="text-grey-6">–</span>
              </q-td>
            </template>

            <template #body-cell-estimatedTaxes="props">
              <q-td :props="props">
                <span v-if="props.row.estimatedTaxes != null"
                      :class="valueColorClass(props.row.estimatedTaxes, true)">
                  {{ formatCurrency(props.row.estimatedTaxes) }}
                </span>
                <span v-else class="text-grey-6">–</span>
              </q-td>
            </template>

            <template #body-cell-otherExpenses="props">
              <q-td :props="props">
                <span :class="valueColorClass(props.row.otherExpenses ?? 0, true)">
                  {{ formatCurrency(props.row.otherExpenses ?? 0) }}
                </span>
              </q-td>
            </template>

            <!-- Lifestyle Spending: negative outflow, table should always show a number only in retirement -->
            <template #body-cell-lifestyleSpending="props">
              <q-td :props="props">
                <span
                  v-if="!isPreRetirement(props.row) && props.row.lifestyleSpending != null"
                  :class="valueColorClass(props.row.lifestyleSpending, true)">
                  {{ formatCurrency(props.row.lifestyleSpending) }}
                </span>
                <span v-else class="text-grey-6">–</span>
              </q-td>
            </template>

            <!-- Spending Target: retirement-only expense target -->
            <template #body-cell-spendingTarget="props">
              <q-td :props="props">
                <span
                  v-if="!isPreRetirement(props.row) && props.row.spendingTarget != null"
                  :class="valueColorClass(props.row.spendingTarget, true)">
                  {{ formatCurrency(props.row.spendingTarget) }}
                </span>
                <span v-else class="text-grey-6">–</span>
              </q-td>
            </template>

            <!-- Under/Over Spending: surplus (+ green) or shortfall (- red) -->
            <template #body-cell-underOverSpending="props">
              <q-td :props="props">
                <span
                  v-if="!isPreRetirement(props.row) && props.row.underOverSpending != null"
                  :class="valueColorClass(props.row.underOverSpending, false)">
                  {{ formatCurrency(props.row.underOverSpending) }}
                </span>
                <span v-else class="text-grey-6">–</span>
              </q-td>
            </template>
          </q-table>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import Highcharts from 'highcharts'
import HighchartsExporting from 'highcharts/modules/exporting'
import HighchartsAccessibility from 'highcharts/modules/accessibility'

// Initialize Highcharts modules
HighchartsExporting(Highcharts)
HighchartsAccessibility(Highcharts)

const props = defineProps({
  results: {
    type: Object,
    required: true
  }
})

const cashflowRows = props.results.cashflowRows || []
const retirementStartYear = props.results.retirementStartYear || 2035

// Pre-retirement helper
function isPreRetirement(row) {
  return retirementStartYear != null && row.year < retirementStartYear
}

// Life-stage ranges for visual marking
const earlyRetirementEnd = retirementStartYear + 9
const midRetirementEnd = retirementStartYear + 19

// Row class for visual retirement marking (Early, Mid, Late Retirement)
function rowClass (row) {
  if (!retirementStartYear) return ''

  if (row.year < retirementStartYear) return ''            // pre-retirement
  if (row.year >= retirementStartYear && row.year <= earlyRetirementEnd) {
    return 'stage-early'
  }
  if (row.year > earlyRetirementEnd && row.year <= midRetirementEnd) {
    return 'stage-mid'
  }
  return 'stage-late'
}

// Year / Age toggle
const timelineMode = ref('year')
const timelineOptions = [
  { label: 'Year', value: 'year' },
  { label: 'Age', value: 'age' }
]

const pagination = { rowsPerPage: 20 }

// Table column definitions
const columns = [
  { name: 'yearAge', label: 'Year / Age', field: 'yearAge', align: 'left' },
  // incomes
  { name: 'salary', label: 'Salary/Wages', field: 'salaryWages', align: 'right' },
  { name: 'socialSecurity', label: 'Social Security', field: 'socialSecurity', align: 'right' },
  { name: 'pension', label: 'Pension/Annuity', field: 'pensionAnnuity', align: 'right' },
  { name: 'otherIncome', label: 'Other Income', field: 'otherIncome', align: 'right' },
  { name: 'rmd', label: 'RMD', field: 'rmd', align: 'right' },
  { name: 'portfolioIncome', label: 'Portfolio Income', field: 'portfolioIncome', align: 'right' },
  // expenses
  { name: 'contributions', label: 'Contributions', field: 'contributions', align: 'right' },
  { name: 'estimatedTaxes', label: 'Estimated Taxes', field: 'estimatedTaxes', align: 'right' },
  { name: 'otherExpenses', label: 'Other Expenses', field: 'otherExpenses', align: 'right' },
  // NEW: lifestyle spending (what income can support)
  { name: 'lifestyleSpending', label: 'Lifestyle Spending', field: 'lifestyleSpending', align: 'right' },
  // NEW: spending target (what client wants)
  { name: 'spendingTarget', label: 'Spending Target', field: 'spendingTarget', align: 'right' },
  // Under/Over Spending (surplus/shortfall)
  { name: 'underOverSpending', label: 'Under/Over Spending', field: 'underOverSpending', align: 'right' }
]

// Helpers
function formatCurrency (val) {
  if (val == null) return '–'
  const sign = val < 0 ? '-' : ''
  const abs = Math.abs(val || 0)
  return sign + '$' + abs.toLocaleString('en-US', { maximumFractionDigits: 0 })
}

// incomes: green; expenses: red; deltas based on sign
function valueColorClass (val, isExpense) {
  if (val == null) return 'text-grey-6'
  if (isExpense) {
    return val === 0 ? '' : 'text-negative'
  }
  if (val === 0) return ''
  return val > 0 ? 'text-positive' : 'text-negative'
}

// Chart x-axis labels (year vs age)
const xCategories = computed(() => {
  if (timelineMode.value === 'year') {
    return cashflowRows.map(r => r.year)
  }
  return cashflowRows.map(r => {
    const a1 = r.agePrimary
    const a2 = r.ageSpouse
    if (a1 != null && a2 != null) return `${a1} / ${a2}`
    if (a1 != null) return `${a1}`
    if (a2 != null) return `${a2}`
    return ''
  })
})

// Build series arrays - map to correct field names from mockData
// incomes
const salarySeries = cashflowRows.map(r => r.salaryWages || 0)
const ssSeries = cashflowRows.map(r => r.socialSecurity || 0)
const pensionSeries = cashflowRows.map(r => r.pensionAnnuity || 0)
const otherIncomeSeries = cashflowRows.map(r => r.otherIncome || 0)
const rmdSeries = cashflowRows.map(r => r.rmd || 0)
const portfolioSeries = cashflowRows.map(r => r.portfolioIncome || 0)

// fixed expenses (positive)
const contribSeries = cashflowRows.map(r => r.contributions || 0)
const taxSeries = cashflowRows.map(r => r.estimatedTaxes || 0)
const otherExpSeries = cashflowRows.map(r => r.otherExpenses || 0)

// lifestyleSpending is stored as NEGATIVE in the data;
// for the bar height we stack on its absolute value
const lifestyleSeries = cashflowRows.map(r => {
  if (isPreRetirement(r) || r.lifestyleSpending == null) return 0
  return Math.abs(r.lifestyleSpending)
})

// Spending Target line (retirement only)
const spendingTargetSeries = cashflowRows.map(r => {
  if (isPreRetirement(r) || r.spendingTarget == null) return null
  return r.spendingTarget
})

// Highcharts options
const fundingChartOptions = computed(() => {
  // Find indices for retirement years
  const client1RetirementYear = 2035
  const client2RetirementYear = 2026
  
  // Find the index in the categories array for each retirement
  let client1Index = -1
  let client2Index = -1
  
  if (timelineMode.value === 'year') {
    client1Index = cashflowRows.findIndex(r => r.year === client1RetirementYear)
    client2Index = cashflowRows.findIndex(r => r.year === client2RetirementYear)
  } else {
    // When viewing by age, find the corresponding age
    const client1Row = cashflowRows.find(r => r.year === client1RetirementYear)
    const client2Row = cashflowRows.find(r => r.year === client2RetirementYear)
    
    if (client1Row) {
      const age = client1Row.agePrimary != null ? client1Row.agePrimary : client1Row.ageSpouse
      client1Index = cashflowRows.findIndex(r => {
        const rAge = r.agePrimary != null ? r.agePrimary : r.ageSpouse
        return rAge === age
      })
    }
    if (client2Row) {
      const age = client2Row.agePrimary != null ? client2Row.agePrimary : client2Row.ageSpouse
      client2Index = cashflowRows.findIndex(r => {
        const rAge = r.agePrimary != null ? r.agePrimary : r.ageSpouse
        return rAge === age
      })
    }
  }

  return {
    chart: {
      type: 'column',
      height: 380
    },
    title: {
      text: 'Retirement Funding: Income, Expenses, and Spending Target'
    },
    xAxis: {
      categories: xCategories.value,
      title: {
        text: timelineMode.value === 'year' ? 'Year' : 'Age'
      },
      plotLines: [
        {
          value: client1Index,
          color: '#ff6b6b',
          width: 2,
          dashStyle: 'Dash',
          label: {
            text: 'Client 1 Retirement (2035)',
            align: 'right',
            style: {
              color: '#ff6b6b',
              fontWeight: 'bold'
            },
            x: -5
          },
          zIndex: 5
        },
        {
          value: client2Index,
          color: '#4ecdc4',
          width: 2,
          dashStyle: 'Dash',
          label: {
            text: 'Client 2 Retirement (2026)',
            align: 'right',
            style: {
              color: '#4ecdc4',
              fontWeight: 'bold'
            },
            x: -5
          },
          zIndex: 5
        }
      ]
    },
  yAxis: {
    title: { text: 'Annual Amount ($)' },
    labels: {
      formatter () {
        const v = this.value
        const abs = Math.abs(v)
        if (abs >= 1_000_000) return '$' + (v / 1_000_000).toFixed(1) + 'M'
        if (abs >= 1_000) return '$' + (v / 1_000).toFixed(1) + 'K'
        return '$' + Highcharts.numberFormat(v, 0)
      }
    }
  },
  legend: { enabled: true },
  plotOptions: {
    column: {
      stacking: 'normal'
    },
    series: {
      marker: { enabled: false }
    }
  },
  tooltip: {
    shared: true,
    useHTML: true,
    formatter: function () {
      const idx = this.points && this.points.length > 0 ? this.points[0].point.index : 0
      const row = cashflowRows[idx] || {}
      const label = this.x

      const fmt = v => {
        if (v == null) return '–'
        return formatCurrency(v)
      }

      let html = `<b>${label}</b><br/><br/>`
      html += '<b>Income</b><br/>'
      html += `Salary/Wages: ${fmt(row.salaryWages)}<br/>`
      html += `Social Security: ${fmt(row.socialSecurity)}<br/>`
      html += `Pension/Annuity: ${fmt(row.pensionAnnuity)}<br/>`
      html += `Other Income: ${fmt(row.otherIncome)}<br/>`
      html += `RMD: ${fmt(row.rmd)}<br/>`
      html += `Portfolio Income: ${fmt(row.portfolioIncome)}<br/>`

      html += '<br/><b>Expenses</b><br/>'
      html += `Contributions: ${fmt(row.contributions)}<br/>`
      html += `Estimated Taxes: ${fmt(row.estimatedTaxes)}<br/>`
      html += `Other Expenses: ${fmt(row.otherExpenses)}<br/>`
      html += `Lifestyle Spending: ${fmt(row.lifestyleSpending)}<br/>`

      html += '<br/><b>Targets</b><br/>'
      html += `Spending Target: ${fmt(row.spendingTarget)}<br/>`
      html += `Under/Over Spending: ${fmt(row.underOverSpending)}<br/>`

      return html
    }
  },
  series: [
    // Group headers
    {
      name: 'Incomes',
      type: 'line',
      data: [],
      showInLegend: true,
      enableMouseTracking: false,
      color: 'transparent',
      tooltip: { enabled: false }
    },
    {
      name: 'Expenses',
      type: 'line',
      data: [],
      showInLegend: true,
      enableMouseTracking: false,
      color: 'transparent',
      tooltip: { enabled: false }
    },
    // Income stack
    { name: 'Salary/Wages', type: 'column', data: salarySeries, stack: 'income', legendIndex: 1 },
    { name: 'Social Security', type: 'column', data: ssSeries, stack: 'income', legendIndex: 2 },
    { name: 'Pension/Annuity', type: 'column', data: pensionSeries, stack: 'income', legendIndex: 3 },
    { name: 'Other Income', type: 'column', data: otherIncomeSeries, stack: 'income', legendIndex: 4 },
    { name: 'RMD', type: 'column', data: rmdSeries, stack: 'income', legendIndex: 5 },
    { name: 'Portfolio Income', type: 'column', data: portfolioSeries, stack: 'income', legendIndex: 6 },
    // Expense stack (including Lifestyle Spending)
    { name: 'Contributions', type: 'column', data: contribSeries, stack: 'expense', legendIndex: 10 },
    { name: 'Estimated Taxes', type: 'column', data: taxSeries, stack: 'expense', legendIndex: 11 },
    { name: 'Other Expenses', type: 'column', data: otherExpSeries, stack: 'expense', legendIndex: 12 },
    { name: 'Lifestyle Spending', type: 'column', data: lifestyleSeries, stack: 'expense', legendIndex: 13 },
    // Spending Target line (what client wants)
    {
      name: 'Spending Target',
      type: 'spline',
      data: spendingTargetSeries,
      dashStyle: 'ShortDash',
      zIndex: 4,
      legendIndex: 20
    }
  ]
  }
})

// Chart instance reference for updates
let chartInstance = null

// Render chart after component mounts and when data changes
onMounted(() => {
  if (fundingChartOptions.value && cashflowRows.length > 0) {
    chartInstance = Highcharts.chart('funding-chart-container', fundingChartOptions.value)
  }
})

// Watch for timeline mode changes and update chart
watch([timelineMode, xCategories, fundingChartOptions], () => {
  if (chartInstance && cashflowRows.length > 0) {
    // Recalculate plotLine indices
    const client1RetirementYear = 2035
    const client2RetirementYear = 2026
    let client1Index = -1
    let client2Index = -1
    
    if (timelineMode.value === 'year') {
      client1Index = cashflowRows.findIndex(r => r.year === client1RetirementYear)
      client2Index = cashflowRows.findIndex(r => r.year === client2RetirementYear)
    } else {
      const client1Row = cashflowRows.find(r => r.year === client1RetirementYear)
      const client2Row = cashflowRows.find(r => r.year === client2RetirementYear)
      
      if (client1Row) {
        const age = client1Row.agePrimary != null ? client1Row.agePrimary : client1Row.ageSpouse
        client1Index = cashflowRows.findIndex(r => {
          const rAge = r.agePrimary != null ? r.agePrimary : r.ageSpouse
          return rAge === age
        })
      }
      if (client2Row) {
        const age = client2Row.agePrimary != null ? client2Row.agePrimary : client2Row.ageSpouse
        client2Index = cashflowRows.findIndex(r => {
          const rAge = r.agePrimary != null ? r.agePrimary : r.ageSpouse
          return rAge === age
        })
      }
    }

    chartInstance.update({
      xAxis: {
        categories: xCategories.value,
        title: {
          text: timelineMode.value === 'year' ? 'Year' : 'Age'
        },
        plotLines: [
          {
            value: client1Index,
            color: '#ff6b6b',
            width: 2,
            dashStyle: 'Dash',
            label: {
              text: 'Client 1 Retirement (2035)',
              align: 'right',
              style: {
                color: '#ff6b6b',
                fontWeight: 'bold'
              },
              x: -5
            },
            zIndex: 5
          },
          {
            value: client2Index,
            color: '#4ecdc4',
            width: 2,
            dashStyle: 'Dash',
            label: {
              text: 'Client 2 Retirement (2026)',
              align: 'right',
              style: {
                color: '#4ecdc4',
                fontWeight: 'bold'
              },
              x: -5
            },
            zIndex: 5
          }
        ]
      }
    }, true) // true = redraw
  }
}, { immediate: false })
</script>

<style scoped>
.funding-table-wrapper {
  max-height: 420px;
  overflow-y: auto;
}

.funding-table thead tr th {
  position: sticky;
  top: 0;
  z-index: 2;
  background: #ffffff;
}

.stage-early {
  background-color: #f5fbff; /* very light blue */
}

.stage-mid {
  background-color: #f9f5ff; /* very light purple */
}

.stage-late {
  background-color: #fff8f0; /* very light orange */
}
</style>
