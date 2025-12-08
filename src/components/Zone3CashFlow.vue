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
    <q-card flat bordered class="q-pa-md q-mb-lg funding-chart-card">
      <!-- Funding chart view dropdown -->
      <div class="row items-center q-mb-md">
        <div class="col-auto">
          <q-select
            v-model="selectedFundingChartType"
            :options="fundingChartTypeOptions"
            option-label="label"
            option-value="value"
            dense
            outlined
            emit-value
            map-options
            style="min-width: 260px"
            label="Funding chart view"
          />
        </div>
      </div>

      <div class="funding-chart-wrapper">
        <div id="funding-chart-container" class="funding-chart-container"></div>
        <!-- HTML legend container -->
        <div ref="fundingLegend" class="funding-html-legend"></div>
      </div>
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
      </q-card-section>

      <q-separator />

      <q-card-section class="q-pa-none">
        <div class="funding-table-wrapper">
          <!-- Year / Age toggle header -->
          <div class="year-age-header">
            <q-btn-toggle
              v-model="timelineMode"
              rounded
              unelevated
              size="sm"
              color="white"
              toggle-color="primary"
              text-color="primary"
              :options="[
                { label: 'Age', value: 'age' },
                { label: 'Year', value: 'year' }
              ]"
            />
          </div>

            <q-table
            :key="`funding-table-${timelineMode}`"
            :rows="cashflowRows"
            :columns="fundingColumns"
            row-key="year"
            flat
            dense
            :pagination="tablePagination"
            :rows-per-page-options="[]"
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

            <!-- Covered Spending: negative outflow, table should always show a number only in retirement -->
            <template #body-cell-lifestyleSpending="props">
              <q-td :props="props">
                <span
                  v-if="!isPreRetirement(props.row) && props.row.lifestyleSpending != null"
                  :class="valueColorClass(Math.abs(props.row.lifestyleSpending), true)">
                  {{ formatCurrency(Math.abs(props.row.lifestyleSpending)) }}
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
import { ref, computed, onMounted, watch, nextTick } from 'vue'
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
const timelineMode = ref('age')
const tablePagination = ref({
  page: 1,
  rowsPerPage: 0 // 0 = "display all rows"
})

// Funding chart type dropdown
// 4 chart types, default to stacked
const fundingChartTypeOptions = [
  { label: 'Stacked bar (current)', value: 'stacked' },
  { label: 'Lines: Total income vs total target', value: 'lines' },
  { label: 'Clustered bars: Income vs target', value: 'clustered' },
  { label: 'Area: Total spending vs total target', value: 'area' }
]

const selectedFundingChartType = ref('stacked')

// Waterfall chart: selected year index (defaults to first retirement year)
const selectedWaterfallIndex = ref(0)

// Computed label for Year/Age column
const yearAgeLabel = computed(() =>
  timelineMode.value === 'age' ? 'Age' : 'Year'
)

// Table column definitions (computed to update label dynamically)
const fundingColumns = computed(() => [
  { name: 'yearAge', label: yearAgeLabel.value, field: 'yearAge', align: 'left' },
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
  // NEW: Covered Spending (what income can support)
  { name: 'lifestyleSpending', label: 'Covered Spending', field: 'lifestyleSpending', align: 'right' },
  // NEW: spending target (what client wants)
  { name: 'spendingTarget', label: 'Spending Target', field: 'spendingTarget', align: 'right' },
  // Under/Over Spending (surplus/shortfall)
  { name: 'underOverSpending', label: 'Under/Over Spending', field: 'underOverSpending', align: 'right' }
])

// Helpers
function formatCurrency (val) {
  if (val == null) return '–'
  const sign = val < 0 ? '-' : ''
  const abs = Math.abs(val || 0)
  return sign + '$' + abs.toLocaleString('en-US', { maximumFractionDigits: 0 })
}

// incomes: green; expenses: red; deltas based on sign
function valueColorClass (value, isExpense = false) {
  if (value == null) return ''

  const v = Number(value)

  // income = green, expense = red
  if (isExpense) {
    return 'text-negative'   // red for all expenses
  }

  return v >= 0 ? 'text-positive' : 'text-negative'
}

// Helper to compute total target spending (gross = fixed expenses + net spending target)
function totalTargetSpending (row) {
  if (!row || row.spendingTarget == null) return null

  const contrib = row.contributions || 0
  const taxes = row.estimatedTaxes || 0
  const other = row.otherExpenses || 0

  // Gross target = fixed expenses + desired net spending
  return contrib + taxes + other + row.spendingTarget
}

// Chart x-axis labels (year vs age)
const xCategories = computed(() => {
  if (timelineMode.value === 'year') {
    return cashflowRows.map(r => String(r.year))
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
// These are computed so they're reactive and reusable across chart types
// incomes
const salarySeries = computed(() => cashflowRows.map(r => r.salaryWages || 0))
const ssSeries = computed(() => cashflowRows.map(r => r.socialSecurity || 0))
const pensionSeries = computed(() => cashflowRows.map(r => r.pensionAnnuity || 0))
const otherIncomeSeries = computed(() => cashflowRows.map(r => r.otherIncome || 0))
const rmdSeries = computed(() => cashflowRows.map(r => r.rmd || 0))
const portfolioSeries = computed(() => cashflowRows.map(r => r.portfolioIncome || 0))

// fixed expenses (positive)
const contribSeries = computed(() => cashflowRows.map(r => r.contributions || 0))
const taxSeries = computed(() => cashflowRows.map(r => r.estimatedTaxes || 0))
const otherExpSeries = computed(() => cashflowRows.map(r => r.otherExpenses || 0))

// lifestyleSpending is stored as NEGATIVE in the data;
// for the bar height we stack on its absolute value
const lifestyleSeries = computed(() => cashflowRows.map(r => {
  if (isPreRetirement(r) || r.lifestyleSpending == null) return 0
  return Math.abs(r.lifestyleSpending)
}))

// Total Target Spending line (retirement only)
const spendingTargetSeries = computed(() => cashflowRows.map(row => {
  if (isPreRetirement(row)) return null
  return totalTargetSpending(row)
}))

// Total income series (sum of all income sources)
const totalIncomeSeries = computed(() => cashflowRows.map(row => {
  const salary = row.salaryWages || 0
  const ss = row.socialSecurity || 0
  const pension = row.pensionAnnuity || 0
  const other = row.otherIncome || 0
  const rmd = row.rmd || 0
  const portfolio = row.portfolioIncome || 0
  return salary + ss + pension + other + rmd + portfolio
}))

// Total target spending series (for all years, not just retirement)
const totalTargetSeries = computed(() => cashflowRows.map(row => {
  const contrib = row.contributions || 0
  const taxes = row.estimatedTaxes || 0
  const otherExp = row.otherExpenses || 0
  const target = row.spendingTarget || 0
  return contrib + taxes + otherExp + target
}))

// Covered spending series (absolute values for all years)
const coveredSpendingSeries = computed(() => cashflowRows.map(row => Math.abs(row.lifestyleSpending || 0)))

// Total spending series (Contributions + Estimated taxes + Other expenses + Covered spending)
const totalSpendingSeries = computed(() => cashflowRows.map(row => {
  const contrib = row.contributions || 0
  const taxes = row.estimatedTaxes || 0
  const otherExp = row.otherExpenses || 0
  const covered = Math.abs(row.lifestyleSpending || 0)
  return contrib + taxes + otherExp + covered
}))

// Retirement indicator helpers
const client1RetirementYear = 2035
const client2RetirementYear = 2026

function retirementCategoryIndex (categories, retirementYear) {
  // Handle both string and number categories
  const idx = categories.findIndex(cat => {
    if (typeof cat === 'string') {
      return cat.includes(String(retirementYear))
    }
    return cat === retirementYear
  })
  return idx === -1 ? null : idx
}

// Helper to build retirement plot lines
function buildRetirementPlotLines (categories) {
  let client1Index = null
  let client2Index = null
  
  if (timelineMode.value === 'year') {
    client1Index = retirementCategoryIndex(categories, client1RetirementYear)
    client2Index = retirementCategoryIndex(categories, client2RetirementYear)
  } else {
    // When viewing by age, find the corresponding age
    const client1Row = cashflowRows.find(r => r.year === client1RetirementYear)
    const client2Row = cashflowRows.find(r => r.year === client2RetirementYear)
    
    if (client1Row) {
      const age = client1Row.agePrimary != null ? client1Row.agePrimary : client1Row.ageSpouse
      client1Index = categories.findIndex(cat => {
        if (typeof cat === 'string') {
          return cat.includes(String(age))
        }
        return cat === age
      })
      if (client1Index === -1) client1Index = null
    }
    if (client2Row) {
      const age = client2Row.agePrimary != null ? client2Row.agePrimary : client2Row.ageSpouse
      client2Index = categories.findIndex(cat => {
        if (typeof cat === 'string') {
          return cat.includes(String(age))
        }
        return cat === age
      })
      if (client2Index === -1) client2Index = null
    }
  }
  
  // Build plotLines array
  const plotLines = []
  if (client1Index != null) {
    plotLines.push({
      color: '#999',
      dashStyle: 'ShortDash',
      width: 2,
      value: client1Index,
      zIndex: 5,
      label: {
        text: 'Retirement',
        rotation: 0,
        align: 'center',
        verticalAlign: 'top',
        y: -10,
        style: {
          fontSize: '11px',
          fontWeight: '600',
          color: '#555'
        }
      }
    })
  }
  if (client2Index != null && client2Index !== client1Index) {
    plotLines.push({
      color: '#999',
      dashStyle: 'ShortDash',
      width: 2,
      value: client2Index,
      zIndex: 5,
      label: {
        text: 'Retirement',
        rotation: 0,
        align: 'center',
        verticalAlign: 'top',
        y: -10,
        style: {
          fontSize: '11px',
          fontWeight: '600',
          color: '#555'
        }
      }
    })
  }
  
  return plotLines
}

// Tooltip formatter for funding charts
function fundingTooltipFormatter () {
  const idx = this.points && this.points.length > 0 ? this.points[0].point.index : 0
  const row = cashflowRows[idx] || {}
  const label = this.x

  const fmt = v => {
    if (v == null) return '–'
    return formatCurrency(v)
  }
  const fmtAbs = v => {
    if (v == null) return '–'
    return formatCurrency(Math.abs(v))
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
  html += `Covered Spending: ${fmtAbs(row.lifestyleSpending)}<br/>`

  html += '<br/><b>Targets</b><br/>'
  const totalTarget = totalTargetSpending(row)
  html += `Total Target Spending: ${fmt(totalTarget)}<br/>`
  html += `Net Spending Target: ${fmt(row.spendingTarget)}<br/>`
  html += `Under/Over Spending: ${fmt(row.underOverSpending)}<br/>`

  return html
}

// Build stacked bar chart options
function buildStackedFundingOptions () {
  const categories = xCategories.value
  const plotLines = buildRetirementPlotLines(categories)

  return {
    chart: {
      type: 'column',
      height: 380,
      events: {
        render () {
          // Keep HTML legend synchronized on resize or redraw
          // Use setTimeout to ensure series colors are available
          setTimeout(() => {
            buildFundingHtmlLegend()
          }, 50)
        }
      }
    },
    title: {
      text: 'Retirement Funding: Income, Expenses, and Spending Target'
    },
    xAxis: {
      categories: categories,
      title: {
        text: timelineMode.value === 'year' ? 'Year' : 'Age'
      },
      plotLines: plotLines
    },
    yAxis: {
      title: { text: 'Annual Amount ($)' },
      reversedStacks: false,  // ensure last income series (Portfolio) is on top
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
    legend: { enabled: false },
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
      formatter: fundingTooltipFormatter
    },
    series: [
      // Group headers (dummy HTML-legend headers - NO stack property)
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
      // INCOME STACK (bottom → top)
      {
        name: 'Salary/Wages',
        type: 'column',
        data: salarySeries.value,
        stack: 'income',
        index: 0,
        legendIndex: 1
      },
      {
        name: 'Social Security',
        type: 'column',
        data: ssSeries.value,
        stack: 'income',
        index: 1,
        legendIndex: 2
      },
      {
        name: 'Pension/Annuity',
        type: 'column',
        data: pensionSeries.value,
        stack: 'income',
        index: 2,
        legendIndex: 3
      },
      {
        name: 'Other Income',
        type: 'column',
        data: otherIncomeSeries.value,
        stack: 'income',
        index: 3,
        legendIndex: 4
      },
      {
        name: 'RMD',
        type: 'column',
        data: rmdSeries.value,
        stack: 'income',
        index: 4,
        legendIndex: 5
      },
      {
        // THIS MUST BE LAST INCOME SERIES → always top of the stack
        name: 'Portfolio Income',
        type: 'column',
        data: portfolioSeries.value,
        stack: 'income',
        index: 5,
        legendIndex: 6
      },
      // EXPENSE STACK (all use 'expense', order doesn't affect incomes)
      {
        name: 'Contributions',
        type: 'column',
        data: contribSeries.value,
        stack: 'expense',
        index: 10,
        legendIndex: 10
      },
      {
        name: 'Estimated Taxes',
        type: 'column',
        data: taxSeries.value,
        stack: 'expense',
        index: 11,
        legendIndex: 11
      },
      {
        name: 'Other Expenses',
        type: 'column',
        data: otherExpSeries.value,
        stack: 'expense',
        index: 12,
        legendIndex: 12
      },
      {
        name: 'Covered Spending',
        type: 'column',
        data: lifestyleSeries.value,
        stack: 'expense',
        index: 13,
        legendIndex: 13
      },
      // Total Target Spending line (not stacked)
      {
        name: 'Total Target Spending',
        type: 'spline',
        data: spendingTargetSeries.value,
        dashStyle: 'ShortDash',
        zIndex: 5,
        legendIndex: 20
      }
    ]
  }
}

// Build lines chart options: Total income vs total target
function buildLinesFundingOptions () {
  const categories = xCategories.value
  const plotLines = buildRetirementPlotLines(categories)

  return {
    chart: {
      type: 'line',
      height: 380,
      events: {
        render () {
          // Keep HTML legend synchronized on resize or redraw
          setTimeout(() => {
            buildFundingHtmlLegend()
          }, 50)
        }
      }
    },
    title: {
      text: 'Total Income vs Total Target Spending'
    },
    xAxis: {
      categories: categories,
      title: {
        text: timelineMode.value === 'year' ? 'Year' : 'Age'
      },
      plotLines: plotLines
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
    legend: { enabled: false },
    plotOptions: {
      series: {
        marker: { enabled: false }
      }
    },
    tooltip: {
      shared: true,
      useHTML: true,
      formatter () {
        const idx = this.points?.[0]?.point?.index ?? 0
        const yearLabel = this.x
        const row = cashflowRows[idx]

        return [
          `<b>${yearLabel}</b>`,
          `Total income: ${formatCurrency(totalIncomeSeries.value[idx])}`,
          `Total target spending: ${formatCurrency(totalTargetSeries.value[idx])}`
        ].join('<br/>')
      }
    },
    series: [
      {
        name: 'Total income',
        type: 'line',
        data: totalIncomeSeries.value
      },
      {
        name: 'Total target spending',
        type: 'line',
        data: totalTargetSeries.value,
        dashStyle: 'ShortDash'
      }
    ]
  }
}

// Build clustered bars chart options: Income vs target
function buildClusteredFundingOptions () {
  const categories = xCategories.value
  const plotLines = buildRetirementPlotLines(categories)

  return {
    chart: {
      type: 'column',
      height: 380,
      events: {
        render () {
          setTimeout(() => {
            buildFundingHtmlLegend()
          }, 50)
        }
      }
    },
    title: {
      text: 'Total Income vs Total Target Spending'
    },
    xAxis: {
      categories: categories,
      title: {
        text: timelineMode.value === 'year' ? 'Year' : 'Age'
      },
      plotLines: plotLines
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
    legend: { enabled: false },
    plotOptions: {
      column: {
        stacking: undefined,
        grouping: true
      },
      series: {
        marker: { enabled: false }
      }
    },
    tooltip: {
      shared: true,
      useHTML: true,
      formatter () {
        const idx = this.points?.[0]?.point?.index ?? 0
        const row = cashflowRows[idx]
        const yearLabel = this.x

        const incomeBreakdown = [
          `Salary/Wages: ${formatCurrency(row.salaryWages || 0)}`,
          `Social Security: ${formatCurrency(row.socialSecurity || 0)}`,
          `Pension/Annuity: ${formatCurrency(row.pensionAnnuity || 0)}`,
          `Other income: ${formatCurrency(row.otherIncome || 0)}`,
          `RMD: ${formatCurrency(row.rmd || 0)}`,
          `Portfolio income: ${formatCurrency(row.portfolioIncome || 0)}`
        ].join('<br/>')

        const targetBreakdown = [
          `Contributions: ${formatCurrency(row.contributions || 0)}`,
          `Estimated taxes: ${formatCurrency(row.estimatedTaxes || 0)}`,
          `Other expenses: ${formatCurrency(row.otherExpenses || 0)}`,
          `Net spending target: ${formatCurrency(row.spendingTarget || 0)}`
        ].join('<br/>')

        return [
          `<b>${yearLabel}</b>`,
          '<br/><b>Income</b>',
          `Total income: ${formatCurrency(totalIncomeSeries.value[idx])}`,
          incomeBreakdown,
          '<br/><b>Total target spending</b>',
          `Total: ${formatCurrency(totalTargetSeries.value[idx])}`,
          targetBreakdown
        ].join('<br/>')
      }
    },
    series: [
      {
        name: 'Total income',
        type: 'column',
        data: totalIncomeSeries.value
      },
      {
        name: 'Total target spending',
        type: 'column',
        data: totalTargetSeries.value
      }
    ]
  }
}

// Build area chart options: Covered spending vs target
function buildAreaFundingOptions () {
  const categories = xCategories.value
  const plotLines = buildRetirementPlotLines(categories)

  return {
    chart: {
      type: 'area',
      height: 380,
      events: {
        render () {
          setTimeout(() => {
            buildFundingHtmlLegend()
          }, 50)
        }
      }
    },
    title: {
      text: 'Total Spending vs Total Target Spending'
    },
    xAxis: {
      categories: categories,
      title: {
        text: timelineMode.value === 'year' ? 'Year' : 'Age'
      },
      plotLines: plotLines
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
    plotOptions: {
      series: {
        marker: { enabled: false }
      }
    },
    tooltip: {
      shared: true,
      useHTML: true,
      formatter () {
        const idx = this.points?.[0]?.point?.index ?? 0
        const yearLabel = this.x

        return [
          `<b>${yearLabel}</b>`,
          `Total spending: ${formatCurrency(totalSpendingSeries.value[idx])}`,
          `Total target spending: ${formatCurrency(totalTargetSeries.value[idx])}`
        ].join('<br/>')
      }
    },
    legend: { enabled: true },
    series: [
      {
        name: 'Total spending',
        type: 'area',
        data: totalSpendingSeries.value,
        fillOpacity: 0.4
      },
      {
        name: 'Total target spending',
        type: 'line',
        data: totalTargetSeries.value,
        dashStyle: 'ShortDash'
      }
    ]
  }
}

// Build waterfall series for a given row index
function buildWaterfallSeriesForIndex (idx) {
  const row = cashflowRows[idx]
  if (!row) return []

  const salary = row.salaryWages || 0
  const ss = row.socialSecurity || 0
  const pension = row.pensionAnnuity || 0
  const other = row.otherIncome || 0
  const rmd = row.rmd || 0
  const portfolio = row.portfolioIncome || 0
  const contributions = row.contributions || 0
  const taxes = row.estimatedTaxes || 0
  const otherExp = row.otherExpenses || 0
  const covered = Math.abs(row.lifestyleSpending || 0)
  const totalTarget = totalTargetSpending(row) || 0

  return [
    {
      type: 'waterfall',
      name: 'Funding breakdown',
      upColor: '#4caf50',
      color: '#f44336',
      data: [
        { name: 'Salary/Wages', y: salary },
        { name: 'Social Security', y: ss },
        { name: 'Pension/Annuity', y: pension },
        { name: 'Other income', y: other },
        { name: 'RMD', y: rmd },
        { name: 'Portfolio income', y: portfolio },
        { name: 'Total income', isSum: true },
        { name: 'Contributions', y: -contributions },
        { name: 'Estimated taxes', y: -taxes },
        { name: 'Other expenses', y: -otherExp },
        { name: 'Covered spending', y: -covered },
        { name: 'Total covered', isSum: true },
        { name: 'Gap to total target', y: totalTarget - covered }
      ]
    }
  ]
}

// Build waterfall chart options: Selected year breakdown
function buildWaterfallFundingOptions () {
  const idx = selectedWaterfallIndex.value
  const categories = xCategories.value
  const yearLabel = categories[idx] ?? 'Selected year'

  return {
    chart: {
      type: 'waterfall',
      height: 380
    },
    title: {
      text: `Cash Flow Breakdown: ${yearLabel}`
    },
    xAxis: {
      type: 'category',
      title: { text: yearLabel }
    },
    yAxis: {
      title: { text: 'Amount ($)' },
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
    tooltip: {
      pointFormatter () {
        return `${this.name}: ${formatCurrency(this.y)}`
      }
    },
    legend: { enabled: false },
    series: buildWaterfallSeriesForIndex(idx)
  }
}

// Highcharts options - switches based on selected chart type
const fundingChartOptions = computed(() => {
  switch (selectedFundingChartType.value) {
    case 'stacked':
      return buildStackedFundingOptions()
    case 'lines':
      return buildLinesFundingOptions()
    case 'clustered':
      return buildClusteredFundingOptions()
    case 'area':
      return buildAreaFundingOptions()
    default:
      return buildStackedFundingOptions()
  }
})

// Chart instance reference for updates
let chartInstance = null
const fundingLegend = ref(null)

// Helper to build HTML legend
function buildFundingHtmlLegend () {
  const chart = chartInstance
  const legendEl = fundingLegend.value
  if (!chart || !legendEl) return

  // Clear previous legend
  legendEl.innerHTML = ''

  const groups = [
    {
      title: 'Incomes',
      seriesNames: [
        'Salary/Wages',
        'Social Security',
        'Pension/Annuity',
        'Other Income',
        'RMD',
        'Portfolio Income'
      ]
    },
    {
      title: 'Expenses',
      seriesNames: [
        'Contributions',
        'Estimated Taxes',
        'Other Expenses',
        'Covered Spending',
        'Total Target Spending'
      ]
    }
  ]

  groups.forEach(group => {
    const groupDiv = document.createElement('div')
    groupDiv.className = 'legend-group'

    const titleEl = document.createElement('div')
    titleEl.className = 'legend-group-title'
    titleEl.textContent = group.title
    groupDiv.appendChild(titleEl)

    group.seriesNames.forEach(name => {
      const series = chart.series.find(s => s.name === name)
      if (!series) return

      const item = document.createElement('div')
      item.className = 'legend-item'
      if (!series.visible) {
        item.classList.add('legend-item-hidden')
      }

      const symbol = document.createElement('span')
      
      // Get the series color - try multiple sources
      let seriesColor = '#000000'
      if (series.color) {
        seriesColor = series.color
      } else if (series.options && series.options.color) {
        seriesColor = series.options.color
      } else if (series.userOptions && series.userOptions.color) {
        seriesColor = series.userOptions.color
      } else {
        // Fallback: use Highcharts default colors based on index
        const defaultColors = Highcharts.getOptions().colors || []
        const colorIndex = chart.series.indexOf(series) % defaultColors.length
        seriesColor = defaultColors[colorIndex] || '#7cb5ec'
      }
      
      // Use different symbol styles based on series type
      if (series.type === 'spline' || series.name === 'Total Target Spending') {
        // Dashed line for spline series
        symbol.className = 'legend-symbol legend-symbol-line'
        symbol.style.width = '20px'
        symbol.style.height = '2px'
        symbol.style.display = 'inline-block'
        symbol.style.borderTop = `2px dashed ${seriesColor}`
        symbol.style.borderBottom = 'none'
        symbol.style.borderLeft = 'none'
        symbol.style.borderRight = 'none'
        symbol.style.backgroundColor = 'transparent'
        symbol.style.verticalAlign = 'middle'
        symbol.style.marginRight = '0.5rem'
        symbol.style.marginTop = '0'
      } else {
        // Circular dot for column series
        symbol.className = 'legend-symbol legend-symbol-dot'
        symbol.style.width = name === 'Covered Spending' ? '16px' : '12px'
        symbol.style.height = name === 'Covered Spending' ? '16px' : '12px'
        symbol.style.display = 'inline-block'
        symbol.style.backgroundColor = seriesColor
        symbol.style.borderRadius = '50%'
        symbol.style.marginRight = '0.5rem'
        symbol.style.flexShrink = '0'
      }
      
      item.appendChild(symbol)

      const label = document.createElement('span')
      // Display labels with proper names
      if (name === 'Covered Spending') {
        label.textContent = 'Covered Spending'
      } else if (name === 'Total Target Spending') {
        label.textContent = 'Total Target Spending'
      } else {
        label.textContent = name
      }
      item.appendChild(label)

      item.onclick = function () {
        series.setVisible(!series.visible, false)
        chart.redraw()
        item.classList.toggle('legend-item-hidden', !series.visible)
      }

      groupDiv.appendChild(item)
    })

    legendEl.appendChild(groupDiv)
  })
}

// Render chart after component mounts and when data changes
onMounted(async () => {
  // Guard against old saved values (e.g., 'waterfall' from previous versions)
  if (selectedFundingChartType.value === 'waterfall' || 
      !fundingChartTypeOptions.find(opt => opt.value === selectedFundingChartType.value)) {
    selectedFundingChartType.value = 'stacked'
  }

  if (fundingChartOptions.value && cashflowRows.length > 0) {
    chartInstance = Highcharts.chart('funding-chart-container', fundingChartOptions.value)
    await nextTick()
    // Wait a bit for chart to fully render and series colors to be available
    setTimeout(() => {
      buildFundingHtmlLegend()
    }, 100)
  }
})

// Watch for chart type, timeline mode, and data changes - recreate chart when type changes
watch([selectedFundingChartType, timelineMode, xCategories, fundingChartOptions], () => {
  if (!cashflowRows.length) return

  // When chart type changes, destroy and recreate the chart
  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }

  // Recreate chart with new options
  if (fundingChartOptions.value) {
    chartInstance = Highcharts.chart('funding-chart-container', fundingChartOptions.value)
    // Rebuild legend after chart renders
    setTimeout(() => {
      buildFundingHtmlLegend()
    }, 100)
  }
}, { immediate: false })
</script>

<style scoped>
/* funding-table-wrapper: No max-height or overflow - let table size naturally, use browser scroll */

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

.funding-chart-card {
  position: relative;
}

.funding-chart-wrapper {
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
}

.funding-chart-container {
  flex: 1;
  min-width: 0;
  height: 400px;
}

.funding-html-legend {
  flex-shrink: 0;
  display: flex;
  gap: 2rem;
  font-size: 0.75rem;
  padding: 0.5rem 0;
  min-width: 200px;
}

.legend-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  flex: 1;
}

.legend-group-title {
  font-weight: 600;
  font-size: 0.8rem;
  margin-bottom: 0.25rem;
  color: #333;
  text-align: center;
  text-decoration: underline;
}

.legend-item {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 0.1rem 0;
  user-select: none;
  line-height: 1.4;
}

.legend-item span:last-child {
  color: #333;
  font-size: 0.75rem;
}

.legend-item:hover {
  opacity: 0.8;
}

.legend-item-hidden {
  opacity: 0.4;
}

.legend-symbol {
  flex-shrink: 0;
  display: inline-block;
}

.legend-symbol-dot {
  display: inline-block;
  border-radius: 50%;
  flex-shrink: 0;
}

.legend-symbol-line {
  display: inline-block;
  flex-shrink: 0;
  vertical-align: middle;
}

.year-age-header {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 0.5rem;
}

.year-age-toggle .q-btn {
  font-size: 0.8rem;
}
</style>
