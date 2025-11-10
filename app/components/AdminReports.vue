<template>
  <div class="space-y-6">

    <!-- Header -->
    <div class="flex justify-between items-center mb-1">
      <h2 class="text-xl font-bold text-gray-800">📄 Отчёты</h2>
    </div>

    <!-- Filters Card -->
    <div class="bg-white rounded-2xl p-5 shadow-md space-y-5 border border-gray-100">

      <!-- Type -->
      <div class="space-y-2">
        <label class="block text-sm font-semibold text-gray-700">Тип отчёта</label>
        <select
          v-model="reportType"
          class="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 focus:border-blue-500 outline-none text-base transition-all"
        >
          <option value="both">📦 Все записи (въезды + выезды)</option>
          <option value="entries">🚛 Только въезды</option>
          <option value="exits">🚚 Только выезды</option>
        </select>
      </div>

      <!-- Date range -->
      <div class="space-y-2">
        <label class="block text-sm font-semibold text-gray-700">Период</label>
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          unlink-panels
          start-placeholder="Дата с"
          end-placeholder="Дата по"
          value-format="YYYY-MM-DD"
          size="large"
          class="w-full [&>.el-input__wrapper]:h-[52px] [&>.el-input__wrapper]:rounded-xl"
        />
      </div>

      <!-- Warehouse -->
      <div class="space-y-2">
        <label class="block text-sm font-semibold text-gray-700">Склад</label>
        <select
          v-model="warehouseId"
          class="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 focus:border-blue-500 outline-none text-base transition-all"
        >
          <option value="">🏭 Все склады</option>
          <option v-for="w in warehouses" :key="w.id" :value="w.id">
            🏢 {{ w.name }}
          </option>
        </select>
      </div>

      <!-- Button -->
      <button
        @click="downloadReport"
        :disabled="loading"
        class="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl py-4 font-semibold text-base shadow-sm active:scale-[.97] disabled:opacity-50 transition"
      >
        <span v-if="!loading" class="flex items-center justify-center gap-2">
          📥 Скачать отчёт
        </span>
        <span v-else class="flex items-center gap-2 justify-center">
          <div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          Формируем...
        </span>
      </button>
    </div>

    <p class="text-center text-gray-500 text-xs">
      Файл будет скачан с учётом выбранных фильтров
    </p>
  </div>
</template>

<script setup>
import { useAxios } from '~/composables/useAxios'
import { ElNotification } from 'element-plus'

const $axios = useAxios()

const warehouses = ref([])
const warehouseId = ref('')
const dateRange = ref([])
const reportType = ref('both') // default
const loading = ref(false)

async function loadWarehouses() {
  const { data } = await $axios.get('/admin/warehouses')
  warehouses.value = data
}

async function downloadReport() {
  loading.value = true
  try {
    const params = {
      type: reportType.value,
      warehouse_id: warehouseId.value || undefined,
      start_date: dateRange.value?.[0] || undefined,
      end_date: dateRange.value?.[1] || undefined,
    }

    const { data } = await $axios.get('/admin/logs/export', {
      params,
      responseType: 'blob',
    })

    const url = URL.createObjectURL(new Blob([data]))
    const a = document.createElement('a')
    a.href = url
    const filename = `report_${reportType.value}_${new Date().toISOString().slice(0,10)}.xlsx`
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)

    ElNotification({
      title: 'Готово',
      message: 'Отчёт скачан ✅',
      type: 'success',
    })
  } catch (err) {
    ElNotification({
      title: 'Ошибка',
      message: err.response?.data?.message || 'Не удалось скачать отчёт',
      type: 'error',
    })
  } finally {
    loading.value = false
  }
}

onMounted(loadWarehouses)
</script>