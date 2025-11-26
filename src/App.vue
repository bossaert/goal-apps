<template>
  <q-layout view="hHh lpR fFf">
    <q-page-container>
      <q-page class="bg-grey-1">
        <!-- Zone 2: Header KPIs -->
        <div class="q-pa-md">
          <Zone2Header />
        </div>

        <!-- Zone 3: Tabs -->
        <div class="q-pa-md">
          <q-card>
            <q-tabs
              v-model="tab"
              dense
              class="text-primary"
              active-color="primary"
              indicator-color="primary"
            >
              <q-tab name="projection" label="Projection" />
              <q-tab name="cashflow" label="Cash Flow" />
              <q-tab name="portfolio" label="Portfolio" disable />
            </q-tabs>

            <q-separator />

            <q-tab-panels v-model="tab" animated>
              <q-tab-panel name="projection">
                <Zone3Projection />
              </q-tab-panel>

              <q-tab-panel name="cashflow">
                <Zone3CashFlow />
              </q-tab-panel>

              <q-tab-panel name="portfolio">
                <div class="q-pa-md text-grey-7 text-body2">
                  Portfolio detail view not implemented in this prototype.
                </div>
              </q-tab-panel>
            </q-tab-panels>
          </q-card>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import Zone2Header from './components/Zone2Header.vue'
import Zone3Projection from './components/Zone3Projection.vue'
import Zone3CashFlow from './components/Zone3CashFlow.vue'

const tab = ref('projection')
</script>

<style scoped>
</style>
