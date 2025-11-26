<template>
  <div class="q-pa-md">
    <div class="q-mb-md">
      <div class="text-subtitle1 q-mb-xs">
        Zone 3 - Projection
      </div>
      <div class="text-caption text-grey-7">
        Fan chart shows projected portfolio value by percentile. The table below tracks the same P50 path,
        including contributions, growth, fees, withdrawals, and ending value at each age.
      </div>
    </div>

    <q-card flat bordered class="q-pa-md q-mb-lg">
      <div id="projection-chart-container" style="width: 100%; height: 400px;"></div>
    </q-card>

    <q-card flat bordered>
      <q-card-section>
        <div class="text-subtitle2 q-mb-xs">
          Annual Lifetime Portfolio Growth
        </div>
        <div class="text-caption text-grey-7">
          One path (median / P50). Values are shown in nominal dollars; calculations use full precision even where
          display is rounded.
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-table
          :rows="portfolioRows"
          :columns="columns"
          row-key="year"
          flat
          dense
          :pagination="pagination"
        >
          <template #body-cell-yearAge="props">
            <q-td :props="props">
              {{ props.row.year }} / Age {{ props.row.age }}
            </q-td>
          </template>

          <template #body-cell-starting="props">
            <q-td :props="props">
              {{ formatCurrency(props.row.starting) }}
            </q-td>
          </template>

          <template #body-cell-contrib="props">
            <q-td :props="props">
              {{ formatCurrency(props.row.contrib) }}
            </q-td>
          </template>

          <template #body-cell-growth="props">
            <q-td :props="props">
              {{ formatCurrency(props.row.growth) }}
            </q-td>
          </template>

          <template #body-cell-fees="props">
            <q-td :props="props">
              {{ formatCurrency(props.row.fees) }}
            </q-td>
          </template>

          <template #body-cell-withdrawals="props">
            <q-td :props="props">
              {{ formatCurrency(props.row.withdrawals) }}
            </q-td>
          </template>

          <template #body-cell-ending="props">
            <q-td :props="props">
              {{ formatCurrency(props.row.ending) }}
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import Highcharts from 'highcharts'
import HighchartsMore from 'highcharts/highcharts-more'
import HighchartsExporting from 'highcharts/modules/exporting'
import HighchartsAccessibility from 'highcharts/modules/accessibility'
import { projectionYears, projectionP10, projectionP50, projectionP90, portfolioRows } from '../mockData'

// Initialize Highcharts modules
HighchartsMore(Highcharts)
HighchartsExporting(Highcharts)
HighchartsAccessibility(Highcharts)

const columns = [
  { name: 'yearAge', label: 'Year / Age', field: 'yearAge', align: 'left' },
  { name: 'starting', label: 'Starting Portfolio Value', field: 'starting', align: 'right' },
  { name: 'contrib', label: 'Total Contributions (This Year)', field: 'contrib', align: 'right' },
  { name: 'growth', label: 'Investment Growth / Loss (Before Fees)', field: 'growth', align: 'right' },
  { name: 'fees', label: 'Fees & Expenses', field: 'fees', align: 'right' },
  { name: 'withdrawals', label: 'Withdrawals for Retirement Spending', field: 'withdrawals', align: 'right' },
  { name: 'ending', label: 'Ending Portfolio Value', field: 'ending', align: 'right' }
]

const pagination = {
  rowsPerPage: 10
}

function formatCurrency (val) {
  const sign = val < 0 ? '-' : ''
  const abs = Math.abs(val || 0)
  return sign + '$' + abs.toLocaleString('en-US', { maximumFractionDigits: 0 })
}

const rangeData = projectionP10.map((low, idx) => [low, projectionP90[idx]])

const fanChartOptions = {
  chart: {
    type: 'areasplinerange',
    height: 360,
    spacingTop: 20,
    spacingRight: 20,
    spacingBottom: 20,
    spacingLeft: 20,
    // Responsive configuration
    reflow: true,
    // Accessibility
    description: 'Fan chart showing projected portfolio value range from 10th to 90th percentile, with median line overlay'
  },
  // Responsive rules
  responsive: {
    rules: [{
      condition: {
        maxWidth: 500
      },
      chartOptions: {
        legend: {
          layout: 'horizontal',
          align: 'center',
          verticalAlign: 'bottom'
        },
        yAxis: {
          labels: {
            style: {
              fontSize: '10px'
            }
          }
        }
      }
    }]
  },
  title: {
    text: 'Projected Portfolio Value (P10, P50, P90)',
    style: {
      fontSize: '16px',
      fontWeight: 'bold'
    }
  },
  // Accessibility
  accessibility: {
    enabled: true,
    description: 'Fan chart displaying portfolio projection with confidence intervals',
    point: {
      valueDescriptionFormat: '{index}. {xDescription}, {point.y}'
    }
  },
  xAxis: {
    categories: projectionYears,
    title: { text: 'Year' },
    accessibility: {
      description: 'Years from 2025 to 2054'
    }
  },
  yAxis: {
    title: { text: 'Portfolio Value ($)' },
    labels: {
      formatter: function () {
        return '$' + Highcharts.numberFormat(this.value / 1000, 0) + 'k'
      }
    },
    accessibility: {
      description: 'Portfolio value in thousands of dollars'
    }
  },
  legend: {
    enabled: true,
    accessibility: {
      enabled: true
    }
  },
  tooltip: {
    shared: true,
    useHTML: true,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    formatter: function () {
      const year = this.x
      const points = this.points || []
      let s = '<b>Year ' + year + '</b><br/>'
      points.forEach(p => {
        if (p.series.type === 'areasplinerange') {
          s += '<span style="color:' + p.color + '">●</span> ' + p.series.name + ': $' +
            Highcharts.numberFormat(p.point.low, 0) +
            ' - $' +
            Highcharts.numberFormat(p.point.high, 0) + '<br/>'
        } else {
          s += '<span style="color:' + p.color + '">●</span> ' + p.series.name + ': $' +
            Highcharts.numberFormat(p.y, 0) + '<br/>'
        }
      })
      return s
    }
  },
  // Export functionality
  exporting: {
    enabled: true,
    buttons: {
      contextButton: {
        menuItems: ['downloadPNG', 'downloadJPEG', 'downloadPDF', 'downloadSVG', 'separator', 'downloadCSV', 'downloadXLS']
      }
    },
    filename: 'portfolio-projection-chart',
    chartOptions: {
      title: {
        text: 'Projected Portfolio Value (P10, P50, P90)'
      }
    }
  },
  // Performance optimizations
  plotOptions: {
    series: {
      marker: { enabled: false },
      // Enable turbo threshold for better performance with large datasets
      turboThreshold: 1000,
      // Animation optimization
      animation: {
        duration: 750
      }
    },
    areasplinerange: {
      color: '#c5e1fa',
      fillOpacity: 0.5,
      states: {
        hover: {
          fillOpacity: 0.7
        }
      }
    },
    spline: {
      lineWidth: 2,
      states: {
        hover: {
          lineWidth: 3
        }
      }
    }
  },
  // Credits
  credits: {
    enabled: false
  },
  series: [
    {
      name: 'P10 - P90 Range',
      type: 'areasplinerange',
      data: rangeData,
      accessibility: {
        description: 'Confidence interval showing range from 10th to 90th percentile'
      }
    },
    {
      name: 'Median (P50)',
      type: 'spline',
      data: projectionP50,
      color: '#1976d2',
      accessibility: {
        description: 'Median projected portfolio value'
      }
    }
  ]
}

// Render chart after component mounts
onMounted(() => {
  Highcharts.chart('projection-chart-container', fanChartOptions)
})
</script>

<style scoped>
</style>
