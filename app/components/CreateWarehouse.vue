<template>
  <div>
    <h2 class="text-xl font-bold mb-4">➕ Создать склад</h2>

    <div class="space-y-4 bg-white/90 backdrop-blur p-5 rounded-2xl shadow">

      <!-- Название склада -->
      <div>
        <label class="text-sm text-gray-700 mb-1 block">Название склада *</label>
        <input
          v-model="form.name"
          type="text"
          placeholder="Например: КПП 1"
          class="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none"
        />
      </div>

      <!-- Адрес склада -->
      <div>
        <label class="text-sm text-gray-700 mb-1 block">Адрес *</label>
        <input
          v-model="form.address"
          type="text"
          placeholder="Например: 1 этаж"
          class="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none"
        />
      </div>

      <!-- Telegram Group ID -->
      <div>
        <label class="text-sm text-gray-700 mb-1 block">Telegram Group ID *</label>
        <input
          v-model="form.telegram_group_id"
          type="text"
          placeholder="-1002756026049"
          class="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none"
          @input="onGroupIdInput"
        />
        <small class="text-gray-500 text-xs">Группа Telegram должна начинаться с минуса</small>
      </div>

      <!-- Submit -->
      <button
        @click="createWarehouse"
        :disabled="loading"
        class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 rounded-xl shadow active:scale-95 flex items-center justify-center gap-2 disabled:opacity-60"
      >
        <span v-if="!loading">Создать склад</span>

        <div v-else class="flex items-center gap-2">
          <div class="w-5 h-5 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          <span>Сохраняем...</span>
        </div>
      </button>
    </div>

  </div>
</template>

<script setup>
import { ElNotification } from 'element-plus'
import { useAxios } from '~/composables/useAxios'

const $axios = useAxios()

const loading = ref(false)

const form = ref({
  name: '',
  address: '',
  telegram_group_id: ''
})

function onGroupIdInput(e) {
  const value = e.target.value
  const valid = /^-?\d*$/.test(value) // допускаем только цифры и минус
  if (valid) {
    form.value.telegram_group_id = value
  }
}

function validate() {
  if (!form.value.name.trim()) return 'Введите название склада'
  if (!form.value.address.trim()) return 'Введите адрес'
  if (!form.value.telegram_group_id.trim()) return 'Введите Telegram Group ID'

  // Телеграм ID должен быть отрицательным
  if (!/^-?\d+$/.test(form.value.telegram_group_id)) {
    return 'Telegram Group ID должен быть числом (например -10012345678)'
  }
  if (!form.value.telegram_group_id.startsWith('-')) {
    return 'Telegram Group ID должен быть отрицательным (начинаться с "-")'
  }

  return null
}

async function createWarehouse() {
  const error = validate()
  if (error) {
    return ElNotification({ title: 'Ошибка', message: error, type: 'error' })
  }

  loading.value = true
  try {
    await $axios.post('/admin/warehouses', {
      name: form.value.name.trim(),
      address: form.value.address.trim(),
      telegram_group_id: Number(form.value.telegram_group_id)
    })

    ElNotification({ title: 'Успех', message: 'Склад создан ✅', type: 'success' })

    form.value = { name: '', address: '', telegram_group_id: '' }

  } catch (e) {
    const msg = e.response?.data?.message || 'Ошибка при создании склада'
    ElNotification({ title: 'Ошибка', message: msg, type: 'error' })
  } finally {
    loading.value = false
  }
}
</script>