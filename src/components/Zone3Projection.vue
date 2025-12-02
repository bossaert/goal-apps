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
        <div class="row items-center justify-between q-mb-sm">
          <div class="text-subtitle2">
            Annual Lifetime Portfolio Growth
          </div>
          <!-- Year / Age toggle -->
          <q-btn-toggle
            v-model="timelineMode"
            :options="timelineOptions"
            dense
            color="primary"
            toggle-color="primary"
            unelevated
          />
        </div>
        <div class="text-caption text-grey-7">
          One path (median / P50). Values are shown in nominal dollars; calculations use full precision even where display
          is rounded.
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section class="q-pa-none">
        <div class="projection-table-wrapper">
          <q-table
            :rows="portfolioRows"
            :columns="columns"
            row-key="year"
            flat
            dense
            :pagination="pagination"
            class="projection-table"
          >
          <!-- First column: Year / Age -->
          <template #body-cell-yearAge="props">
            <q-td :props="props">
              <span v-if="timelineMode === 'year'">
                {{ props.row.year }}
              </span>
              <span v-else-if="timelineMode === 'agePrimary'">
                <span v-if="props.row.agePrimary != null">
                  Age {{ props.row.agePrimary }}
                </span>
                <span v-else class="text-grey-6">–</span>
              </span>
              <span v-else>
                <span v-if="props.row.ageSpouse != null">
                  Age {{ props.row.ageSpouse }}
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
const timelineMode = ref('year') // 'year' | 'agePrimary' | 'ageSpouse'

const timelineOptions = [
  { label: 'Year', value: 'year' },
  { label: 'Age – Client 1', value: 'agePrimary' },
  { label: 'Age – Client 2', value: 'ageSpouse' }
]

const xCategories = computed(() => {
  if (timelineMode.value === 'year') return projectionYears
  if (timelineMode.value === 'agePrimary') {
    return portfolioRows.map(r => r.agePrimary != null ? r.agePrimary : null)
  }
  return portfolioRows.map(r => r.ageSpouse != null ? r.ageSpouse : null)
})

const pagination = { rowsPerPage: 10 }

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
  const firstColumnLabel =
    timelineMode.value === 'year'
      ? 'Year'
      : timelineMode.value === 'agePrimary'
        ? 'Age (Client 1)'
        : 'Age (Client 2)'

  return [
    { name: 'yearAge', label: firstColumnLabel, field: 'yearAge', align: 'left' },
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

// MAIN chart options
const fanChartOptions = computed(() => {
  // Find indices for retirement years
  const client1RetirementYear = 2035
  const client2RetirementYear = 2026
  
  // Find the index in the categories array for each retirement
  let client1Index = -1
  let client2Index = -1
  
  if (timelineMode.value === 'year') {
    client1Index = projectionYears.indexOf(client1RetirementYear)
    client2Index = projectionYears.indexOf(client2RetirementYear)
  } else if (timelineMode.value === 'agePrimary') {
    // Client 1 retires at age 65
    const client1RetirementAge = 65
    client1Index = portfolioRows.findIndex(r => r.agePrimary === client1RetirementAge)
    // For Client 2, find the year 2026 and get Client 1's age at that time
    const client2YearRow = portfolioRows.find(r => r.year === client2RetirementYear)
    if (client2YearRow) {
      client2Index = portfolioRows.findIndex(r => r.agePrimary === client2YearRow.agePrimary)
    }
  } else {
    // Client 2 retires at age 54 (in year 2026)
    const client2RetirementAge = 54
    client2Index = portfolioRows.findIndex(r => r.ageSpouse === client2RetirementAge)
    // For Client 1, find the year 2035 and get Client 2's age at that time
    const client1YearRow = portfolioRows.find(r => r.year === client1RetirementYear)
    if (client1YearRow) {
      client1Index = portfolioRows.findIndex(r => r.ageSpouse === client1YearRow.ageSpouse)
    }
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
      categories: xCategories.value,
      title: {
        text:
          timelineMode.value === 'year'
            ? 'Year'
            : timelineMode.value === 'agePrimary'
              ? 'Age – Client 1'
              : 'Age – Client 2'
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
    // Recalculate plotLine indices
    const client1RetirementYear = 2035
    const client2RetirementYear = 2026
    let client1Index = -1
    let client2Index = -1
    
    if (timelineMode.value === 'year') {
      client1Index = projectionYears.indexOf(client1RetirementYear)
      client2Index = projectionYears.indexOf(client2RetirementYear)
    } else if (timelineMode.value === 'agePrimary') {
      const client1RetirementAge = 65
      client1Index = portfolioRows.findIndex(r => r.agePrimary === client1RetirementAge)
      const client2YearRow = portfolioRows.find(r => r.year === client2RetirementYear)
      if (client2YearRow) {
        client2Index = portfolioRows.findIndex(r => r.agePrimary === client2YearRow.agePrimary)
      }
    } else {
      const client2RetirementAge = 54
      client2Index = portfolioRows.findIndex(r => r.ageSpouse === client2RetirementAge)
      const client1YearRow = portfolioRows.find(r => r.year === client1RetirementYear)
      if (client1YearRow) {
        client1Index = portfolioRows.findIndex(r => r.ageSpouse === client1YearRow.ageSpouse)
      }
    }

    chartInstance.update({
      xAxis: {
        categories: xCategories.value,
        title: {
          text:
            timelineMode.value === 'year'
              ? 'Year'
              : timelineMode.value === 'agePrimary'
                ? 'Age – Client 1'
                : 'Age – Client 2'
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
.projection-table-wrapper {
  max-height: 400px;          /* whatever height you want */
  overflow-y: auto;
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
</style>
