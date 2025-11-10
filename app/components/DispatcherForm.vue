<template>
  <div class="space-y-6">
    <div class="bg-white/80 backdrop-blur rounded-2xl shadow-lg p-6 space-y-4">
      <h2 class="text-lg font-bold text-gray-800 mb-4">Создание пропуска</h2>

      <!-- Номер пропуска -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Номер пропуска*</label>
        <input
          v-model="form.pass_number"
          type="text"
          placeholder="12345"
          class="w-full px-4 py-4 rounded-xl border-2"
          :class="inputClass('pass_number')"
        />
        <p v-if="errors.pass_number" class="text-xs text-red-500 mt-1">{{ errors.pass_number }}</p>
      </div>

      <!-- Места -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Количество мест*</label>
        <input
          v-model="form.places_count"
          type="number"
          placeholder="10"
          class="w-full px-4 py-4 rounded-xl border-2"
          :class="inputClass('places_count')"
        />
        <p v-if="errors.places_count" class="text-xs text-red-500 mt-1">{{ errors.places_count }}</p>
      </div>

      <!-- Direction -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Направление*</label>
        <select
          v-model="form.direction"
          class="w-full px-4 py-4 rounded-xl border-2"
          :class="inputClass('direction')"
        >
          <option value="">Выберите направление</option>
          <option value="import">Импорт</option>
          <option value="export">Экспорт</option>
        </select>
        <p v-if="errors.direction" class="text-xs text-red-500 mt-1">{{ errors.direction }}</p>
      </div>

      <!-- Project -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Проект*</label>
        <select
          v-model="form.project"
          class="w-full px-4 py-4 rounded-xl border-2"
          :class="inputClass('project')"
        >
          <option value="">Выберите проект</option>
          <option value="project-a">Проект А</option>
          <option value="project-b">Проект Б</option>
          <option value="project-c">Проект В</option>
        </select>
        <p v-if="errors.project" class="text-xs text-red-500 mt-1">{{ errors.project }}</p>
      </div>

      <!-- Comment -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Комментарий (опционально)</label>
        <textarea
          v-model="form.comment"
          rows="3"
          placeholder="Дополнительная информация..."
          class="w-full px-4 py-4 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none text-base resize-none"
        ></textarea>
      </div>

      <!-- Submit -->
      <button
        @click="handleSubmit"
        :disabled="loading"
        class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-5 px-6 rounded-xl shadow-lg transition-all text-lg active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <span v-if="!loading">✓ Создать пропуск</span>
        <div v-else class="flex items-center gap-2">
          <div class="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          <span>Создаем...</span>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ElNotification } from "element-plus"
import { useAxios } from '~/composables/useAxios'

const $axios = useAxios()

const loading = ref(false)

const form = ref({
  pass_number: '',
  places_count: '',
  direction: '',
  project: '',
  comment: ''
})

const errors = ref({})

function inputClass(key) {
  return errors.value[key]
    ? "border-red-500 focus:border-red-500"
    : "border-gray-200 focus:border-blue-500"
}

function validate() {
  errors.value = {}

  if (!form.value.pass_number) errors.value.pass_number = "Введите номер пропуска"
  if (!form.value.places_count) errors.value.places_count = "Введите количество мест"
  if (!form.value.direction) errors.value.direction = "Выберите направление"
  if (!form.value.project) errors.value.project = "Выберите проект"

  return Object.keys(errors.value).length === 0
}

async function handleSubmit() {
  if (!validate()) return

  loading.value = true
  try {
    await $axios.post('/dispatcher/create-pass', form.value)

    ElNotification({
      title: "Успех",
      message: "Пропуск создан ✅",
      type: "success",
      duration: 2500
    })

    form.value = { pass_number: '', places_count: '', direction: '', project: '', comment: '' }
  } catch (err) {
    const msg = err.response?.data?.message || err.response?.data?.error || "Ошибка сервера"
    ElNotification({
      title: "Ошибка",
      message: msg,
      type: "error",
      duration: 4000
    })
  } finally {
    loading.value = false
  }
}
</script>