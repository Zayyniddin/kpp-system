<template>
  <div>
    <h2 class="text-xl font-bold mb-4">➕ Добавить пользователя</h2>

    <div class="space-y-4 bg-white/90 backdrop-blur p-5 rounded-2xl shadow">

      <!-- Имя -->
      <div>
        <label class="text-sm text-gray-700 mb-1 block">Имя *</label>
        <input
          v-model="form.full_name"
          type="text"
          placeholder="Например: Иван Иванов"
          class="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none"
        />
      </div>

      <!-- Телефон -->
      <div>
        <label class="text-sm text-gray-700 mb-1 block">Телефон *</label>
        <input
          v-model="phoneInput"
          @input="formatPhone"
          type="tel"
          placeholder="+998 ** *** ** **"
          class="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none"
        />
      </div>

      <!-- Роль -->
      <div>
        <label class="text-sm text-gray-700 mb-1 block">Роль *</label>
        <select
          v-model="form.role"
          class="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none"
        >
          <option value="">Выберите роль</option>
          <option value="admin">Админ</option>
          <option value="guard">Охранник</option>
          <option value="dispatcher">Диспетчер</option>
        </select>
      </div>

      <!-- Склад -->
      <div>
        <label class="text-sm text-gray-700 mb-1 block">Склад *</label>
        <select
          v-model="form.warehouse_id"
          class="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none"
        >
          <option value="">Выберите склад</option>
          <option
            v-for="w in warehouses"
            :key="w.id"
            :value="w.id"
          >
            {{ w.name }} — {{ w.address }}
          </option>
        </select>
      </div>

      <!-- Submit -->
      <button
        @click="createUser"
        :disabled="loading"
        class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 rounded-xl shadow active:scale-95 flex items-center justify-center gap-2 disabled:opacity-60"
      >
        <span v-if="!loading">Создать пользователя</span>

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

const warehouses = ref([])
const loading = ref(false)

const form = ref({
  full_name: '',
  phone_number: '', // здесь лежит 998********
  role: '',
  warehouse_id: ''
})

const phoneInput = ref("") // красивый формат +998 ** *** ** **


function formatPhone(e) {
  let digits = e.target.value.replace(/\D/g, '')

  // убираем 998 если ввели вручную
  if (digits.startsWith('998')) digits = digits.slice(3)

  // ограничиваем только 9 цифрами после 998
  if (digits.length > 9) digits = digits.slice(0, 9)

  // формат отображения
  const formatted =
    `+998 ${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 7)} ${digits.slice(7, 9)}`
      .trim()
      .replace(/\s+$/, '')

  phoneInput.value = formatted
  form.value.phone_number = `998${digits}`
}

async function loadWarehouses() {
  try {
    const { data } = await $axios.get('/admin/warehouses')
    warehouses.value = data
  } catch {
    ElNotification({
      title: 'Ошибка',
      message: 'Не удалось загрузить список складов',
      type: 'error'
    })
  }
}

function validate() {
  if (!form.value.full_name.trim()) return 'Введите имя'
  if (form.value.phone_number.length !== 12) return 'Введите корректный номер'
  if (!form.value.role) return 'Выберите роль'
  if (!form.value.warehouse_id) return 'Выберите склад'
  return null
}

async function createUser() {
  const err = validate()
  if (err) {
    return ElNotification({ title: 'Ошибка', message: err, type: 'error' })
  }

  loading.value = true
  try {
    await $axios.post('/admin/users', {
      full_name: form.value.full_name.trim(),
      phone_number: form.value.phone_number,
      role: form.value.role,
      warehouse_id: form.value.warehouse_id
    })

    ElNotification({
      title: 'Успех',
      message: 'Пользователь создан ✅',
      type: 'success'
    })

    form.value = { full_name: '', phone_number: '', role: '', warehouse_id: '' }
    phoneInput.value = ''

  } catch (e) {
    ElNotification({
      title: 'Ошибка',
      message: e.response?.data?.message || 'Ошибка создания пользователя',
      type: 'error'
    })
  } finally {
    loading.value = false
  }
}

onMounted(loadWarehouses)
</script>