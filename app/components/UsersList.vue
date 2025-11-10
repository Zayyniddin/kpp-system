<template>
  <div class="space-y-6">

    <!-- Title -->
    <div class="flex justify-between items-center">
      <h2 class="text-xl font-bold text-gray-800">👥 Пользователи</h2>
    </div>

    <!-- Search -->
    <div>
      <input
        v-model="search"
        type="text"
        placeholder="🔍 Поиск по имени или телефону..."
        class="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 focus:border-blue-600 outline-none text-base transition shadow-sm"
      />
    </div>

    <!-- Loader -->
    <div v-if="loading" class="space-y-2">
      <div v-for="n in 4" :key="n" class="h-16 bg-gray-200/60 animate-pulse rounded-xl"></div>
    </div>

    <!-- Empty -->
    <div
      v-else-if="filteredUsers.length === 0"
      class="p-6 text-center text-gray-500 bg-white rounded-xl shadow-sm"
    >
      😕 Пользователи не найдены
    </div>

    <!-- User cards -->
    <div v-else class="space-y-3 pb-24">

      <div
        v-for="u in filteredUsers"
        :key="u.id"
        class="bg-white rounded-xl shadow-sm border border-gray-200 p-4 active:scale-[.99] transition"
      >

        <!-- Header -->
        <div class="flex justify-between items-center mb-1">
          <h3 class="font-semibold text-gray-900 text-base">{{ u.full_name }}</h3>
          <button
            @click="confirmDelete(u)"
            class="text-red-600 text-sm font-medium hover:underline active:scale-95 transition"
          >
            🗑 удалить
          </button>
        </div>

        <!-- Phone -->
        <div class="text-sm text-gray-700 flex items-center gap-1">
          📞 <a :href="`tel:+${u.phone_number}`" class="text-blue-600 font-medium">
            {{ formatPhone(u.phone_number) }}
          </a>
        </div>

        <!-- Badges -->
        <div class="flex flex-wrap gap-2 mt-2">

          <!-- role -->
          <span class="px-2 py-0.5 rounded-md text-xs bg-blue-100 text-blue-700 flex items-center gap-1">
            🧑‍💼 {{ roleLabel(u.role) }}
          </span>

          <!-- warehouse -->
          <span class="px-2 py-0.5 rounded-md text-xs bg-green-100 text-green-700 flex items-center gap-1">
            🏢 {{ warehouseName(u.warehouse_id) }}
          </span>

          <!-- status -->
          <span
            class="px-2 py-0.5 rounded-md text-xs flex items-center gap-1"
            :class="u.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-600'"
          >
            {{ u.is_active ? 'Активен ✅' : 'Отключен ❌' }}
          </span>

        </div>
      </div>
    </div>

    <!-- Delete modal -->
    <el-dialog v-model="deleteDialog.show" width="320px" align-center>
      <div class="text-center space-y-3 py-2">
        <div class="text-lg font-semibold">Удалить пользователя?</div>
        <div class="text-sm text-gray-500">
          {{ deleteDialog.user?.full_name }}
        </div>

        <div class="flex gap-2 mt-4">
          <button
            class="flex-1 py-2 bg-gray-200 rounded-lg font-medium"
            @click="deleteDialog.show = false"
          >Отмена</button>

          <button
            class="flex-1 py-2 bg-red-600 text-white rounded-lg font-medium active:scale-95"
            @click="deleteUser"
          >Удалить</button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue"
import { ElNotification } from "element-plus"
import { useAxios } from "~/composables/useAxios"

const $axios = useAxios()

const users = ref([])
const warehouses = ref([])

const loading = ref(true)
const search = ref("")

// modal state
const deleteDialog = ref({ show: false, user: null })

async function loadUsers() {
  loading.value = true
  try {
    const { data } = await $axios.get("/admin/users")
    users.value = data
  } finally {
    loading.value = false
  }
}

async function loadWarehouses() {
  const { data } = await $axios.get("/admin/warehouses")
  warehouses.value = data
}

const filteredUsers = computed(() => {
  const s = search.value.toLowerCase()
  return users.value.filter(u =>
    u.full_name.toLowerCase().includes(s) ||
    u.phone_number.includes(s)
  )
})

function warehouseName(id) {
  return warehouses.value.find(w => w.id === id)?.name || `ID: ${id}`
}

function roleLabel(r) {
  return r === "admin"
    ? "Админ"
    : r === "guard"
    ? "Охранник"
    : "Диспетчер"
}

function formatPhone(phone) {
  if (phone.startsWith("998") && phone.length === 12) {
    return `+${phone.slice(0, 3)} ${phone.slice(3, 5)} ${phone.slice(5, 8)} ${phone.slice(8, 10)} ${phone.slice(10, 12)}`
  }
  return phone
}

function confirmDelete(u) {
  deleteDialog.value = { show: true, user: u }
}

async function deleteUser() {
  const id = deleteDialog.value.user.id
  deleteDialog.value.show = false

  try {
    await $axios.delete(`/admin/users/${id}`)
    users.value = users.value.filter(u => u.id !== id)
    ElNotification({ title: "Удалено", message: "Пользователь удалён", type: "success" })
  } catch {
    ElNotification({ title: "Ошибка", message: "Не удалось удалить", type: "error" })
  }
}

onMounted(() => {
  loadWarehouses()
  loadUsers()
})
</script>