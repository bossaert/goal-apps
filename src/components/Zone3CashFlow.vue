<template>
  <div class="q-pa-md">
    <div class="q-mb-md">
      <div class="text-subtitle1 q-mb-xs">
        Zone 3 - Cash Flow
      </div>
      <div class="text-caption text-grey-7">
        Stacked bars show income sources plus portfolio withdrawals. The spending target (after tax) is drawn as a line.
        Portfolio withdrawals represent the amount that must be taken from the portfolio to meet the spending line after
        other income and taxes.
      </div>
    </div>

    <q-card flat bordered class="q-pa-md q-mb-lg">
      <div id="cashflow-chart-container" style="width: 100%; height: 400px;"></div>
    </q-card>

    <q-card flat bordered>
      <q-card-section>
        <div class="text-subtitle2 q-mb-xs">
          Annual Lifetime Cash Flow
        </div>
        <div class="text-caption text-grey-7">
          Pre-retirement years show employment income, contributions, and taxes. Retirement years add Social Security,
          pension income, and portfolio withdrawals to support the spending target.
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-table
          :rows="cashflowRows"
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

          <template #body-cell-employmentIncome="props">
            <q-td :props="props">
              {{ formatCurrency(props.row.employmentIncome) }}
            </q-td>
          </template>

          <template #body-cell-socialSecurityIncome="props">
            <q-td :props="props">
              {{ formatCurrency(props.row.socialSecurityIncome) }}
            </q-td>
          </template>

          <template #body-cell-pensionIncome="props">
            <q-td :props="props">
              {{ formatCurrency(props.row.pensionIncome) }}
            </q-td>
          </template>

          <template #body-cell-portfolioWithdrawals="props">
            <q-td :props="props">
              {{ formatCurrency(props.row.portfolioWithdrawals) }}
            </q-td>
          </template>

          <template #body-cell-retirementContributions="props">
            <q-td :props="props">
              {{ formatCurrency(props.row.retirementContributions) }}
            </q-td>
          </template>

          <template #body-cell-estimatedTaxes="props">
            <q-td :props="props">
              {{ formatCurrency(props.row.estimatedTaxes) }}
            </q-td>
          </template>

          <template #body-cell-netCashForLifestyle="props">
            <q-td :props="props">
              {{ formatCurrency(props.row.netCashForLifestyle) }}
            </q-td>
          </template>

          <template #body-cell-retirementIncomeTarget="props">
            <q-td :props="props">
              {{ formatCurrency(props.row.retirementIncomeTarget) }}
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
import { cashflowRows, projectionYears } from '../mockData'

// Initialize Highcharts modules
HighchartsMore(Highcharts)
HighchartsExporting(Highcharts)
HighchartsAccessibility(Highcharts)

const columns = [
  { name: 'yearAge', label: 'Year / Age', field: 'yearAge', align: 'left' },
  { name: 'employmentIncome', label: 'Employment Income', field: 'employmentIncome', align: 'right' },
  { name: 'socialSecurityIncome', label: 'Social Security Income', field: 'socialSecurityIncome', align: 'right' },
  { name: 'pensionIncome', label: 'Pension / Annuity Income', field: 'pensionIncome', align: 'right' },
  { name: 'portfolioWithdrawals', label: 'Portfolio Withdrawals', field: 'portfolioWithdrawals', align: 'right' },
  { name: 'retirementContributions', label: 'Retirement Contributions', field: 'retirementContributions', align: 'right' },
  { name: 'estimatedTaxes', label: 'Estimated Taxes', field: 'estimatedTaxes', align: 'right' },
  { name: 'netCashForLifestyle', label: 'Net Cash for Lifestyle & Other Uses', field: 'netCashForLifestyle', align: 'right' },
  { name: 'retirementIncomeTarget', label: 'Retirement Income Target (After-Tax)', field: 'retirementIncomeTarget', align: 'right' }
]

const pagination = {
  rowsPerPage: 10
}

function formatCurrency (val) {
  const sign = val < 0 ? '-' : ''
  const abs = Math.abs(val || 0)
  return sign + '$' + abs.toLocaleString('en-US', { maximumFractionDigits: 0 })
}

const employmentSeries = cashflowRows.map(r => r.employmentIncome)
const ssSeries = cashflowRows.map(r => r.socialSecurityIncome)
const pensionSeries = cashflowRows.map(r => r.pensionIncome)
const withdrawalSeries = cashflowRows.map(r => r.portfolioWithdrawals)
const spendingTargetSeries = cashflowRows.map(r => r.retirementIncomeTarget)

const cashFlowChartOptions = {
  chart: {
    type: 'column',
    height: 360,
    spacingTop: 20,
    spacingRight: 20,
    spacingBottom: 20,
    spacingLeft: 20,
    // Responsive configuration
    reflow: true,
    // Accessibility
    description: 'Stacked column chart showing income sources and portfolio withdrawals, with spending target line overlay'
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
        },
        xAxis: {
          labels: {
            rotation: -45,
            style: {
              fontSize: '10px'
            }
          }
        }
      }
    }]
  },
  title: {
    text: 'Lifetime Cash Flow: Income, Withdrawals, and Spending Target',
    style: {
      fontSize: '16px',
      fontWeight: 'bold'
    }
  },
  // Accessibility
  accessibility: {
    enabled: true,
    description: 'Stacked column chart displaying lifetime cash flow with income sources and spending target',
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
    min: 0,
    title: { text: 'Annual Amount ($)' },
    labels: {
      formatter: function () {
        return '$' + Highcharts.numberFormat(this.value / 1000, 0) + 'k'
      }
    },
    accessibility: {
      description: 'Annual cash flow amount in thousands of dollars'
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
        s += '<span style="color:' + p.color + '">●</span> ' + p.series.name + ': $' +
          Highcharts.numberFormat(p.y, 0) + '<br/>'
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
    filename: 'cash-flow-chart',
    chartOptions: {
      title: {
        text: 'Lifetime Cash Flow: Income, Withdrawals, and Spending Target'
      }
    }
  },
  // Performance optimizations
  plotOptions: {
    column: {
      stacking: 'normal',
      // Enable turbo threshold for better performance
      turboThreshold: 1000,
      // Animation optimization
      animation: {
        duration: 750
      },
      states: {
        hover: {
          brightness: 0.1
        }
      }
    },
    spline: {
      marker: {
        enabled: false
      },
      lineWidth: 2,
      states: {
        hover: {
          lineWidth: 3
        }
      },
      animation: {
        duration: 750
      }
    }
  },
  // Credits
  credits: {
    enabled: false
  },
  series: [
    {
      name: 'Employment Income',
      type: 'column',
      data: employmentSeries,
      color: '#1976d2',
      accessibility: {
        description: 'Employment income by year'
      }
    },
    {
      name: 'Social Security Income',
      type: 'column',
      data: ssSeries,
      color: '#26a69a',
      accessibility: {
        description: 'Social Security income by year'
      }
    },
    {
      name: 'Pension / Annuity Income',
      type: 'column',
      data: pensionSeries,
      color: '#9c27b0',
      accessibility: {
        description: 'Pension and annuity income by year'
      }
    },
    {
      name: 'Portfolio Withdrawals',
      type: 'column',
      data: withdrawalSeries,
      color: '#f2c037',
      accessibility: {
        description: 'Portfolio withdrawals by year'
      }
    },
    {
      name: 'Retirement Spending Target',
      type: 'spline',
      data: spendingTargetSeries,
      color: '#c10015',
      marker: {
        enabled: false
      },
      accessibility: {
        description: 'Retirement spending target line'
      }
    }
  ]
}

// Render chart after component mounts
onMounted(() => {
  Highcharts.chart('cashflow-chart-container', cashFlowChartOptions)
})
</script>

<style scoped>
</style>
