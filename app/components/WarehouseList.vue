<template>
  <div class="space-y-6">

    <!-- Title -->
    <div class="flex justify-between items-center">
      <h2 class="text-xl font-bold text-gray-800">📦 Склады</h2>
    </div>

    <!-- Loader circle -->
    <div v-if="loading" class="flex justify-center pt-10 pb-20">
      <div class="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>

    <!-- Empty -->
    <div
      v-else-if="warehouses.length === 0"
      class="p-6 text-center text-gray-500 bg-white rounded-xl shadow-sm"
    >
      Складов пока нет 📭
    </div>

    <!-- List -->
    <div v-else class="space-y-3 pb-24">
      <div
        v-for="wh in warehouses"
        :key="wh.id"
        class="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-2 active:scale-[.99] transition"
      >
        <div class="flex justify-between items-center">
          <div class="font-semibold text-gray-900 text-base">
            {{ wh.name }}
          </div>

          <!-- delete button -->
          <button
            @click="confirmDelete(wh)"
            class="w-9 h-9 flex items-center justify-center rounded-full bg-red-50 text-red-600 hover:bg-red-100 active:scale-90 transition"
            title="Удалить"
          >
            ✕
          </button>
        </div>

        <div class="text-sm text-gray-700 flex items-center gap-1">
          📍 <span>{{ wh.address }}</span>
        </div>

        <div class="text-xs text-gray-500">
          ID: {{ wh.id }}
        </div>
      </div>
    </div>

    <!-- Delete modal -->
    <el-dialog v-model="deleteDialog.show" width="320px" align-center>
      <div class="text-center space-y-3 py-2">
        <div class="text-lg font-semibold">Удалить склад?</div>
        <div class="text-sm text-gray-500">
          {{ deleteDialog.wh?.name }}
        </div>

        <div class="flex gap-2 mt-4">
          <button
            class="flex-1 py-2 bg-gray-200 rounded-lg font-medium"
            @click="deleteDialog.show = false"
          >
            Отмена
          </button>

          <button
            class="flex-1 py-2 bg-red-600 text-white rounded-lg font-medium active:scale-95"
            @click="deleteWarehouse"
          >
            Удалить
          </button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ElNotification } from 'element-plus'
import { useAxios } from '~/composables/useAxios'

const $axios = useAxios()

const warehouses = ref([])
const loading = ref(true)

const deleteDialog = ref({ show: false, wh: null })

async function fetchWarehouses() {
  loading.value = true
  try {
    const { data } = await $axios.get('/admin/warehouses')
    warehouses.value = data
  } catch {
    ElNotification({
      title: 'Ошибка',
      message: 'Не удалось загрузить склады',
      type: 'error'
    })
  } finally {
    loading.value = false
  }
}

function confirmDelete(wh) {
  deleteDialog.value = { show: true, wh }
}

async function deleteWarehouse() {
  const wh = deleteDialog.value.wh
  deleteDialog.value.show = false

  try {
    await $axios.delete(`/admin/warehouses/${wh.id}`)
    warehouses.value = warehouses.value.filter(w => w.id !== wh.id)

    ElNotification({
      title: 'Удалено',
      message: `Склад «${wh.name}» успешно удалён ✅`,
      type: 'success'
    })
  } catch (e) {
    ElNotification({
      title: 'Ошибка',
      message: e.response?.data?.message || 'Не удалось удалить склад',
      type: 'error'
    })
  }
}

onMounted(fetchWarehouses)
</script>