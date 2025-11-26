<template>
  <q-card flat bordered class="q-pa-md bg-white">
    <div class="text-subtitle1 q-mb-sm">
      Scenario Results
    </div>
    <div class="text-caption text-grey-7 q-mb-md">
      Simple goal-based projection focusing on retirement income, portfolio growth, and cash flow. 
      Spending target is modeled as a constant real dollar amount grown by inflation, with no guardrails or policy overlays.
    </div>

    <div class="row q-col-gutter-md items-stretch">
      <div class="col-12 col-md-3">
        <q-card flat bordered class="full-height flex flex-center column q-pa-md">
          <div class="text-caption text-grey-7 q-mb-sm">
            Probability of Success
          </div>
          <q-circular-progress
            show-value
            :value="99"
            size="120px"
            :thickness="0.18"
            color="positive"
            track-color="grey-3"
            class="q-mb-xs"
          >
            <div class="text-h5">99%</div>
          </q-circular-progress>
          <div class="text-caption text-grey-7">
            Based on Monte Carlo simulation (P50 path shown below)
          </div>
        </q-card>
      </div>

      <div class="col-12 col-md-9">
        <div class="row q-col-gutter-md">
          <div class="col-12 col-sm-3" v-for="card in metricCards" :key="card.label">
            <q-card flat bordered class="q-pa-md full-height">
              <div class="text-caption text-grey-7 q-mb-xs">
                {{ card.label }}
              </div>
              <div class="text-h6">
                {{ card.value }}
              </div>
              <div v-if="card.helper" class="text-caption text-grey-6 q-mt-xs">
                {{ card.helper }}
              </div>
            </q-card>
          </div>
        </div>
      </div>
    </div>
  </q-card>
</template>

<script setup>
const metricCards = [
  {
    label: 'Retirement Income Goal',
    value: '$60,000 / year',
    helper: 'Starting spending in today\'s dollars'
  },
  {
    label: 'Current Account Value',
    value: '$1,150,000',
    helper: 'All retirement-designated accounts'
  },
  {
    label: 'Target Model Allocation',
    value: 'Moderate 1',
    helper: '60% Equity / 40% Fixed Income'
  },
  {
    label: 'Ending Portfolio Value (P50)',
    value: '$3,248,680',
    helper: 'At end of plan horizon'
  }
]
</script>

<style scoped>
.full-height {
  height: 100%;
}
</style>
