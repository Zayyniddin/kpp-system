<template>
  <div class="space-y-6">

    <!-- Header -->
    <div class="flex justify-between items-center mb-1">
      <h2 class="text-xl font-bold text-gray-800">📄 Отчёты</h2>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-2xl p-5 shadow-md space-y-5 border border-gray-100">

      <!-- Тип -->
      <div class="space-y-2">
        <label class="block text-sm font-semibold text-gray-700">Тип отчёта</label>
        <select
          v-model="reportType"
          class="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 focus:border-blue-600 outline-none text-base transition"
        >
          <option value="both">📦 Все записи</option>
          <option value="entries">🚛 Въезды</option>
          <option value="exits">🚚 Выезды</option>
        </select>
      </div>

      <!-- Date range (mobile custom picker) -->
      <div class="space-y-2">
        <label class="block text-sm font-semibold text-gray-700">Период</label>
        <MobileDateRange
          v-model="dateRange"
          class="w-full"
        />
      </div>

      <!-- Warehouse -->
      <div class="space-y-2">
        <label class="block text-sm font-semibold text-gray-700">Склад</label>
        <select
          v-model="warehouseId"
          @focus="$event.target.blur()"
          class="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 focus:border-blue-600 outline-none text-base transition"
        >
          <option value="">🏭 Все склады</option>
          <option v-for="w in warehouses" :key="w.id" :value="w.id">
            🏢 {{ w.name }}
          </option>
        </select>
      </div>

      <!-- Button -->
      <button
        @click="sendReport"
        :disabled="loading"
        class="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl py-4 font-semibold shadow-sm active:scale-[.97] disabled:opacity-50"
      >
        <span v-if="!loading" class="flex items-center justify-center gap-2">
          📤 Отправить в Telegram
        </span>

        <span v-else class="flex items-center justify-center gap-2">
          <div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          Отправляем...
        </span>
      </button>
    </div>

    <p class="text-center text-gray-500 text-xs">
      Отчёт будет отправлен в Telegram 📎
    </p>

  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { ElNotification } from 'element-plus'
import { useAxios } from '~/composables/useAxios'
import MobileDateRange from '~/components/MobileDateRange.vue'

const $axios = useAxios()

const warehouses = ref([])
const warehouseId = ref('')
const reportType = ref('both')
const dateRange = ref([]) // [start, end]
const loading = ref(false)

async function loadWarehouses() {
  const { data } = await $axios.get('/admin/warehouses')
  warehouses.value = data
}

async function sendReport() {
  if (!dateRange.value?.[0] || !dateRange.value?.[1]) {
    return ElNotification({ title: 'Ошибка', message: 'Выберите период', type: 'error' })
  }

  loading.value = true

  try {
    await $axios.post('/admin/logs/export-to-telegram', null, {
      params: {
        type: reportType.value,
        warehouse_id: warehouseId.value || undefined,
        start_date: dateRange.value[0],
        end_date: dateRange.value[1]
      }
    })

    ElNotification({
      title: '✅ Успех',
      message: 'Отчёт отправлен в Telegram',
      type: 'success'
    })

  } catch (e) {
    ElNotification({
      title: 'Ошибка',
      message: e.response?.data?.message || 'Не удалось отправить отчёт',
      type: 'error'
    })
  } finally {
    loading.value = false
  }
}

onMounted(loadWarehouses)
</script>