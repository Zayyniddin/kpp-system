<template>
  <div class="space-y-3">
    <h2 class="text-2xl font-bold text-gray-800 mb-4">Администрирование</h2>

    <div
      v-for="item in items"
      :key="item.key"
      @click="$emit('navigate', item.key)"
      class="bg-white/90 backdrop-blur rounded-xl shadow p-5 flex justify-between items-center active:scale-95 transition cursor-pointer"
    >
      <span class="text-lg font-semibold">{{ item.label }}</span>
      <span class="text-gray-400 text-xl">›</span>
    </div>
  </div>
</template>

<script setup>
const items = [
  { key: 'warehouses', label: '📦 Склады' },
  { key: 'create-warehouse', label: '➕ Создать склад' },
  { key: 'users', label: '👥 Пользователи' },
  { key: 'create-user', label: '➕ Создать пользователя' },
  { key: 'entries', label: '🚛 История въездов' },
  { key: 'exits', label: '🚚 История выездов' },
  { key: 'reports', label: '📄 Отчёты' }
]
</script>