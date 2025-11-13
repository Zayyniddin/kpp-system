<template>
  <div class="space-y-6">

    <!-- Header -->
    <div class="flex justify-between items-center">
      <h2 class="text-xl font-bold text-gray-800">🚛 История въездов</h2>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-2xl p-5 shadow-md border border-gray-100 space-y-5">

      <!-- Date -->
      <div class="space-y-2">
        <label class="block text-sm font-semibold text-gray-700">Период</label>
        <MobileDateRange v-model="dateRange" />
      </div>

      <!-- Warehouse select -->
      <div class="space-y-2">
        <label class="block text-sm font-semibold text-gray-700">Склад</label>
        <select
          v-model="warehouseId"
          class="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 focus:border-blue-500 outline-none text-base transition"
        >
          <option value="">🏭 Все склады</option>
          <option v-for="w in warehouses" :key="w.id" :value="w.id">
            🏢 {{ w.name }}
          </option>
        </select>
      </div>

    </div>

    <!-- Entries -->
    <div class="space-y-4 pb-2">

      <!-- Loading spinner -->
      <div v-if="loading" class="flex justify-center py-8">
        <div class="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>

      <!-- Item list -->
      <div
        v-for="e in entries"
        :key="e.id"
        class="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-2 active:scale-[.99] transition"
      >
        <!-- Top: plate + date -->
        <div class="flex justify-between items-center">
          <div class="text-lg font-bold uppercase text-gray-800">{{ e.plate_number }}</div>
          <div class="text-xs text-gray-500">{{ formatDate(e.created_at) }}</div>
        </div>

        <!-- Driver -->
        <div class="flex items-center gap-2 text-sm font-semibold text-gray-700">
          👤 {{ e.driver_name }}
        </div>

        <!-- Phone -->
        <div class="flex items-center gap-1 text-sm text-gray-600">
          📞
          <a :href="`tel:+${e.driver_phone}`" class="text-blue-600 font-medium">
            {{ formatPhone(e.driver_phone) }}
          </a>
        </div>

        <!-- Labels -->
        <div class="flex flex-wrap gap-2 pt-1">
          <span class="px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 text-xs">
            🏢 {{ e.warehouse_name }}
          </span>
          <span class="px-2 py-0.5 rounded-md bg-green-100 text-green-700 text-xs">
            📦 {{ e.project }}
          </span>
        </div>

        <!-- Comment -->
        <div v-if="e.comment" class="text-xs text-gray-600 flex gap-1 pt-1">
          💬 {{ e.comment }}
        </div>
      </div>

      <!-- Empty -->
      <div v-if="!loading && entries.length === 0"
        class="flex flex-col items-center text-center text-gray-400 py-8">
        📭 <div class="text-sm mt-1">Нет данных за выбранный период</div>
      </div>
    </div>

    <!-- Pagination -->
    <div class="flex justify-between items-center bg-white border border-gray-200 rounded-xl p-3 shadow-sm sticky bottom-4">
      <button
        @click="prevPage"
        :disabled="page === 1 || loading"
        class="px-4 py-2 text-sm font-medium rounded-lg bg-gray-50 text-gray-700 disabled:opacity-40 active:scale-95 transition"
      >
        ◀ Пред
      </button>

      <div class="text-sm font-semibold text-gray-600">Стр. {{ page }}</div>

      <button
        @click="nextPage"
        :disabled="endReached || loading"
        class="px-4 py-2 text-sm font-medium rounded-lg bg-gray-50 text-gray-700 disabled:opacity-40 active:scale-95 transition"
      >
        След ▶
      </button>
    </div>
  </div>
</template>

<script setup>
import MobileDateRange from '~/components/MobileDateRange.vue'
import { useAxios } from '~/composables/useAxios'

const $axios = useAxios()

const entries = ref([])
const warehouses = ref([])

const warehouseId = ref('')
const dateRange = ref([])

const page = ref(1)
const limit = 12
const endReached = ref(false)
const loading = ref(false)

function formatPhone(num) {
  if (!num) return '—'
  let d = String(num).replace(/\D/g, '')
  if (d.startsWith('998')) d = d.slice(3)
  return `+998 ${d.slice(0,2)} ${d.slice(2,5)} ${d.slice(5,7)} ${d.slice(7,9)}`
}

function formatDate(d) {
  return new Date(d).toLocaleString('ru-RU', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
  })
}

async function loadWarehouses() {
  const { data } = await $axios.get('/admin/warehouses')
  warehouses.value = data
}

async function fetchEntries() {
  loading.value = true
  try {
    const params = {
      skip: (page.value - 1) * limit,
      limit,
      warehouse_id: warehouseId.value || undefined,
      start_date: dateRange.value?.[0] || undefined,
      end_date: dateRange.value?.[1] || undefined,
    }

    const { data } = await $axios.get('/admin/logs/entries', { params })

    entries.value = data
    endReached.value = data.length < limit
  } finally {
    loading.value = false
  }
}

function refresh() {
  page.value = 1
  fetchEntries()
}

watch([dateRange, warehouseId], refresh)

function nextPage() {
  page.value++
  fetchEntries()
}
function prevPage() {
  page.value--
  fetchEntries()
}

onMounted(() => {
  loadWarehouses()
  fetchEntries()
})
</script>