<template>
  <div class="pt-28 pb-10 px-4">
    <transition name="fade-slide" mode="out-in">
      <component
        :is="currentComponent"
        @back="goBack"
        @navigate="navigateTo"
      />
    </transition>
  </div>
</template>

<script setup>
import AdminMenu from './AdminMenu.vue'
import WarehouseList from './WarehouseList.vue'
import CreateWarehouse from './CreateWarehouse.vue'
import UsersList from './UsersList.vue'
import CreateUser from './CreateUser.vue'
import EntryHistory from './EntryHistory.vue'
import ExitHistory from './ExitHistory.vue'
import ReportsPage from './ReportsPage.vue'

const adminScreen = ref('menu')

const screens = {
  menu: AdminMenu,
  warehouses: WarehouseList,
  'create-warehouse': CreateWarehouse,
  users: UsersList,
  'create-user': CreateUser,
  entries: EntryHistory,
  exits: ExitHistory,
  reports: ReportsPage
}

const currentComponent = computed(() => screens[adminScreen.value])

function navigateTo(screen) {
  adminScreen.value = screen
}

function goBack() {
  adminScreen.value = 'menu'
}
</script>

<style>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all .25s;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>