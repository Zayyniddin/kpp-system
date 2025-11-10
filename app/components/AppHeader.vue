<template>
  <div class="fixed top-0 left-0 right-0 z-50 bg-linear-to-r from-blue-500 to-blue-600 text-white shadow-lg">
    <div class="container mx-auto px-4 py-4 safe-area-top">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-xl font-bold">{{ title }}</h1>
          <p class="text-xs opacity-90 mt-1">{{ roleNameDisplay }}</p>
        </div>

        <!-- Role selector only for admin -->
        <div v-if="isAdmin" class="relative">
          <select
            v-model="selected"
            @change="emit('roleSwitch', selected)"
            class="bg-white/20 backdrop-blur px-3 py-1.5 rounded-full text-sm font-medium
                   text-white pr-6 appearance-none cursor-pointer border border-white/30"
          >
            <option v-for="r in roles" :key="r" :value="r" class="text-black">
              {{ capitalize(r) }}
            </option>
          </select>
          <span class="absolute right-2 top-2 text-white text-xs">▼</span>
        </div>

        <!-- Regular role badge -->
        <div v-else class="bg-white/20 backdrop-blur px-3 py-1.5 rounded-full text-sm font-medium">
          {{ roleIcon }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  title: String,
  roleName: String,
  isAdmin: Boolean
})

const emit = defineEmits(['roleSwitch'])

const roles = ['admin', 'guard', 'dispatcher']
const selected = ref(props.roleName)

const roleIcon = computed(() => {
  const icons = {
    guard: '🧑‍✈️',
    dispatcher: '🧑‍💼',
    admin: '👑'
  }
  return icons[props.roleName] || '👤'
})

const roleNameDisplay = computed(() => ({
  guard: 'Guard',
  dispatcher: 'Dispatcher',
  admin: 'Admin'
}[props.roleName] || props.roleName))

const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1)
</script>

<style scoped>
.safe-area-top {
  padding-top: max(1rem, env(safe-area-inset-top));
}
</style>