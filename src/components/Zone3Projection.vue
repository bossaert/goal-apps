<template>
  <div class="q-pa-md">
    <div class="q-mb-md">
      <div class="text-subtitle1 q-mb-xs">
        Zone 3 - Projection
      </div>
      <div class="text-caption text-grey-7">
        The fan chart shows projected portfolio values by percentile. The table tracks the same median (P50) path, including
        contributions, growth, fees, withdrawals, and ending value each year. Contributions and withdrawals are broken down
        by tax type in the hover details.
      </div>
    </div>

    <!-- Fan chart -->
    <q-card flat bordered class="q-pa-md q-mb-lg">
      <div id="projection-chart-container" style="width: 100%; height: 400px;"></div>
    </q-card>

    <!-- Table -->
    <q-card flat bordered>
      <q-card-section>
        <div class="text-subtitle2 q-mb-sm">
          Annual Lifetime Portfolio Growth
        </div>
        <div class="text-caption text-grey-7">
          One path (median / P50). Values are shown in nominal dollars; calculations use full precision even where display
          is rounded.
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section class="q-pa-none">
        <div class="projection-table-wrapper">
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
            :key="`projection-table-${timelineMode}`"
            :rows="portfolioRows"
            :columns="columns"
            row-key="year"
            flat
            dense
            :pagination="tablePagination"
            :rows-per-page-options="[]"
            class="projection-table"
          >
          <!-- First column: Year / Age -->
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

          <!-- Monetary columns -->
          <template #body-cell-starting="props">
            <q-td :props="props">
              <span :class="valueColorClass(props.row.starting)">
                {{ formatCurrency(props.row.starting) }}
              </span>
            </q-td>
          </template>

          <template #body-cell-contrib="props">
            <q-td :props="props">
              <span :class="valueColorClass(props.row.contrib)">
                {{ formatCurrency(props.row.contrib) }}
              </span>
            </q-td>
          </template>

          <template #body-cell-growth="props">
            <q-td :props="props">
              <span :class="valueColorClass(props.row.growth)">
                {{ formatCurrency(props.row.growth) }}
              </span>
            </q-td>
          </template>

          <template #body-cell-fees="props">
            <q-td :props="props">
              <span :class="valueColorClass(props.row.fees)">
                {{ formatCurrency(props.row.fees) }}
              </span>
            </q-td>
          </template>

          <template #body-cell-withdrawals="props">
            <q-td :props="props">
              <span :class="valueColorClass(props.row.withdrawals)">
                {{ formatCurrency(props.row.withdrawals) }}
              </span>
            </q-td>
          </template>

          <template #body-cell-ending="props">
            <q-td :props="props">
              <span :class="valueColorClass(props.row.ending)">
                {{ formatCurrency(props.row.ending) }}
              </span>
            </q-td>
          </template>
          </q-table>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { onMounted, computed, ref, watch } from 'vue'
import Highcharts from 'highcharts'
import HighchartsMore from 'highcharts/highcharts-more'
import HighchartsExporting from 'highcharts/modules/exporting'
import HighchartsAccessibility from 'highcharts/modules/accessibility'

// Initialize Highcharts modules
HighchartsMore(Highcharts)
HighchartsExporting(Highcharts)
HighchartsAccessibility(Highcharts)

const props = defineProps({
  results: {
    type: Object,
    required: true
  }
})

// --- Data from engine / composable ---
const projectionYears = props.results?.projectionYears || []
const projectionP10 = props.results?.projectionP10 || []
const projectionP50 = props.results?.projectionP50 || []
const projectionP90 = props.results?.projectionP90 || []
const portfolioRows = props.results?.portfolioRows || []

// --- Year / Age toggle ---
const timelineMode = ref('age')

// Computed label for Year/Age column
const yearAgeLabel = computed(() =>
  timelineMode.value === 'age' ? 'Age' : 'Year'
)

const xCategories = computed(() => {
  if (timelineMode.value === 'year') {
    return projectionYears.map(y => String(y))
  }
  return portfolioRows.map(r => {
    const a1 = r.agePrimary
    const a2 = r.ageSpouse
    if (a1 != null && a2 != null) return `${a1} / ${a2}`
    if (a1 != null) return `${a1}`
    if (a2 != null) return `${a2}`
    return ''
  })
})

const tablePagination = ref({
  page: 1,
  rowsPerPage: 0 // 0 = "display all rows"
})

// --- Display helpers ---
function formatCurrency (val) {
  const sign = val < 0 ? '-' : ''
  const abs = Math.abs(val || 0)
  return sign + '$' + abs.toLocaleString('en-US', { maximumFractionDigits: 0 })
}

function valueColorClass (val) {
  if (val == null || val === 0) return ''
  return val > 0 ? 'text-positive' : 'text-negative'
}

function axisCurrencyLabel (value) {
  const abs = Math.abs(value)
  if (abs >= 1_000_000_000) return '$' + (value / 1_000_000_000).toFixed(1) + 'B'
  if (abs >= 1_000_000) return '$' + (value / 1_000_000).toFixed(1) + 'M'
  if (abs >= 1_000) return '$' + (value / 1000).toFixed(1) + 'K'
  return '$' + Highcharts.numberFormat(value, 0)
}

// --- Table columns ---
const columns = computed(() => {
  return [
    { name: 'yearAge', label: yearAgeLabel.value, field: 'yearAge', align: 'left' },
    { name: 'starting', label: 'Starting Portfolio Value', field: 'starting', align: 'right' },
    { name: 'contrib', label: 'Contributions', field: 'contrib', align: 'right' },
    { name: 'growth', label: 'Investment Growth / Loss (Before Fees)', field: 'growth', align: 'right' },
    { name: 'fees', label: 'Fees & Expenses', field: 'fees', align: 'right' },
    { name: 'withdrawals', label: 'Withdrawals', field: 'withdrawals', align: 'right' },
    { name: 'ending', label: 'Ending Portfolio Value', field: 'ending', align: 'right' }
  ]
})


// --- Fan chart (P10/P50/P90 + contributions stack) ---
const rangeData = projectionP10.map((low, idx) => [low, projectionP90[idx]])

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

// MAIN chart options
const fanChartOptions = computed(() => {
  const categories = xCategories.value
  
  // Find indices for retirement years
  let client1Index = null
  let client2Index = null
  
  if (timelineMode.value === 'year') {
    client1Index = retirementCategoryIndex(categories, client1RetirementYear)
    client2Index = retirementCategoryIndex(categories, client2RetirementYear)
  } else {
    // Age mode: categories are like "65 / 63" or "54 / 52"
    // Client 1 retires at age 65
    const client1RetirementAge = 65
    client1Index = categories.findIndex(cat => {
      if (typeof cat === 'string') {
        return cat.includes(String(client1RetirementAge))
      }
      return cat === client1RetirementAge
    })
    if (client1Index === -1) client1Index = null
    
    // Client 2 retires at age 54 (in year 2026)
    const client2RetirementAge = 54
    client2Index = categories.findIndex(cat => {
      if (typeof cat === 'string') {
        return cat.includes(String(client2RetirementAge))
      }
      return cat === client2RetirementAge
    })
    if (client2Index === -1) client2Index = null
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

  return {
    chart: {
      type: 'areasplinerange',
      height: 360
    },
    title: {
      text: 'Projected Portfolio Value (P10, P50, P90)'
    },
    xAxis: {
      categories: categories,
      title: {
        text: timelineMode.value === 'year' ? 'Year' : 'Age'
      },
      plotLines: plotLines
    },
  yAxis: {
    title: { text: 'Portfolio Value ($)' },
    labels: {
      formatter: function () {
        return axisCurrencyLabel(this.value)
      }
    }
  },
  legend: { enabled: true },
  plotOptions: {
    series: {
      marker: { enabled: false }
    },
    areasplinerange: {
      color: '#c5e1fa',
      fillOpacity: 0.5
    },
    spline: {
      lineWidth: 2
    }
  },
  tooltip: {
    shared: true,
    useHTML: true,
    formatter: function () {
      // Index of the point in the series; for shared tooltip, first point is fine
      const pointIndex =
        this.points && this.points.length > 0 ? this.points[0].point.index : 0
      const row = portfolioRows[pointIndex] || {}

      const label = this.x
      const fmt = axisCurrencyLabel

      let html = `<b>${label}</b><br/>`

      // Starting portfolio
      if (row.starting !== undefined) {
        html += `<br/><b>Starting Portfolio</b><br/>`
        html += `Total: ${fmt(row.starting)}<br/>`
        html += `&bull; Tax-deferred: ${fmt(row.startingTaxDeferred || 0)}<br/>`
        html += `&bull; Tax-free: ${fmt(row.startingTaxFree || 0)}<br/>`
        html += `&bull; Taxable: ${fmt(row.startingTaxable || 0)}<br/>`
      }

      // Contributions
      if (row.contrib && row.contrib !== 0) {
        html += `<br/><b>Contributions</b><br/>`
        html += `Total: ${fmt(row.contrib)}<br/>`
        html += `&bull; Tax-deferred: ${fmt(row.contribTaxDeferred || 0)}<br/>`
        html += `&bull; Tax-free: ${fmt(row.contribTaxFree || 0)}<br/>`
        html += `&bull; Taxable: ${fmt(row.contribTaxable || 0)}<br/>`
      }

      // Withdrawals
      if (row.withdrawals && row.withdrawals !== 0) {
        html += `<br/><b>Withdrawals</b><br/>`
        html += `Total: ${fmt(row.withdrawals)}<br/>`
        html += `&bull; Tax-deferred: ${fmt(row.withdrawalsTaxDeferred || 0)}<br/>`
        html += `&bull; Tax-free: ${fmt(row.withdrawalsTaxFree || 0)}<br/>`
        html += `&bull; Taxable: ${fmt(row.withdrawalsTaxable || 0)}<br/>`

        html += `<br/>Usage:<br/>`
        html += `&bull; Retirement spending: ${fmt(row.withdrawalsRetirement || 0)}<br/>`
        html += `&bull; Taxes: ${fmt(row.withdrawalsTaxes || 0)}<br/>`
        html += `&bull; Other: ${fmt(row.withdrawalsOther || 0)}<br/>`
      }

      // Ending portfolio
      if (row.ending !== undefined) {
        html += `<br/><b>Ending Portfolio</b><br/>`
        html += `Total: ${fmt(row.ending)}<br/>`
        html += `&bull; Tax-deferred: ${fmt(row.endingTaxDeferred || 0)}<br/>`
        html += `&bull; Tax-free: ${fmt(row.endingTaxFree || 0)}<br/>`
        html += `&bull; Taxable: ${fmt(row.endingTaxable || 0)}<br/>`
      }

      return html
    }
  },
  series: [
    {
      name: 'P10 - P90 Range',
      type: 'areasplinerange',
      data: rangeData,
      zIndex: 1
    },
    {
      name: 'Median (P50)',
      type: 'spline',
      data: projectionP50,
      zIndex: 3
    }
  ]
  }
})

// Chart instance reference for updates
let chartInstance = null

// Render chart after component mounts and when data changes
onMounted(() => {
  if (fanChartOptions.value && portfolioRows.length > 0) {
    chartInstance = Highcharts.chart('projection-chart-container', fanChartOptions.value)
  }
})

// Watch for timeline mode changes and update chart
watch([timelineMode, xCategories, fanChartOptions], () => {
  if (chartInstance && portfolioRows.length > 0) {
    const categories = xCategories.value
    
    // Recalculate plotLine indices
    let client1Index = null
    let client2Index = null
    
    if (timelineMode.value === 'year') {
      client1Index = retirementCategoryIndex(categories, client1RetirementYear)
      client2Index = retirementCategoryIndex(categories, client2RetirementYear)
    } else {
      // Age mode: categories are like "65 / 63" or "54 / 52"
      // Client 1 retires at age 65
      const client1RetirementAge = 65
      client1Index = categories.findIndex(cat => {
        if (typeof cat === 'string') {
          return cat.includes(String(client1RetirementAge))
        }
        return cat === client1RetirementAge
      })
      if (client1Index === -1) client1Index = null
      
      // Client 2 retires at age 54 (in year 2026)
      const client2RetirementAge = 54
      client2Index = categories.findIndex(cat => {
        if (typeof cat === 'string') {
          return cat.includes(String(client2RetirementAge))
        }
        return cat === client2RetirementAge
      })
      if (client2Index === -1) client2Index = null
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

    chartInstance.update({
      xAxis: {
        categories: categories,
        title: {
          text: timelineMode.value === 'year' ? 'Year' : 'Age'
        },
        plotLines: plotLines
      }
    }, true) // true = redraw
  }
}, { immediate: false })
</script>

<style scoped>
.projection-table-wrapper {
  /* No max-height or overflow - let table size naturally, use browser scroll */
  position: relative;
}

/* Target the real header cells inside q-table - use :deep() for scoped styles */
.projection-table-wrapper :deep(.q-table) {
  margin-bottom: 0;
}

.projection-table-wrapper :deep(.q-table thead) {
  position: sticky;
  top: 0;
  z-index: 10;
}

.projection-table-wrapper :deep(.q-table thead tr th) {
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: #ffffff !important;
  box-shadow: 0 2px 2px -1px rgba(0, 0, 0, 0.1);
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
