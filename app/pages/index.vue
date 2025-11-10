<template>
	<div
		class="min-h-screen bg-linear-to-br from-blue-50 via-blue-100 to-blue-200"
	>
		<!-- Header (только когда авторизованы и не грузимся) -->
		<AppHeader
			v-if="!loading && interfaceRole"
			:title="interfaceRole"
			:roleName="interfaceRole"
			:isAdmin="userRole === 'admin'"
			@roleSwitch="switchRole"
		/>

		<!-- Loader -->
		<div v-if="loading" class="flex items-center justify-center min-h-screen">
			<div class="flex flex-col items-center gap-3 animate-fade">
				<div
					class="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"
				></div>
				<p class="text-lg font-medium text-gray-700">Проверяем доступ...</p>
			</div>
		</div>

		<!-- Access denied -->
		<div
			v-else-if="!userRole"
			class="flex items-center justify-center min-h-screen p-4"
		>
			<div
				class="bg-white/80 backdrop-blur rounded-2xl shadow-2xl p-8 max-w-md w-full text-center"
			>
				<div class="text-6xl mb-4">🚫</div>
				<h1 class="text-2xl font-bold text-gray-800 mb-3">Доступ запрещен</h1>
				<p class="text-gray-600 mb-6">
					Авторизация не удалась. Откройте приложение через Telegram.
				</p>
			</div>
		</div>

		<!-- Authenticated -->
		<div
			v-else
			class="pt-32 pb-24 px-4 container mx-auto max-w-2xl safe-area-bottom"
		>
			<GuardForm v-if="interfaceRole === 'guard'" />
			<DispatcherForm v-else-if="interfaceRole === 'dispatcher'" />

			<div v-else-if="interfaceRole === 'admin'" class="space-y-6">
				<!-- If we're in menu mode — show menu -->
				<div v-if="adminTab === 'menu'" class="space-y-4">
					<div class="space-y-3">
						<div
							v-for="item in items"
							:key="item.key"
							@click="adminTab = item.key"
							class="bg-white/90 backdrop-blur rounded-xl shadow px-5 py-4 flex justify-between items-center active:scale-95 transition cursor-pointer"
						>
							<div class="text-lg font-semibold">{{ item.label }}</div>
							<div class="text-gray-500 text-xl">›</div>
						</div>
					</div>
				</div>

				<!-- Админ экраны -->
				<transition name="fade-slide" mode="out-in">
					<div v-if="adminTab !== 'menu'">
						<!-- Back button -->
						<button
							@click="adminTab = 'menu'"
							class="flex items-center gap-2 text-blue-600 font-medium px-1 mb-2"
						>
							<span class="text-xl">‹</span> Назад
							{{ adminTab }}
						</button>

						<!-- Dynamic content -->
						<div class="mt-2">
							<WarehouseList v-if="adminTab === 'warehouses'" />
							<CreateWarehouse v-else-if="adminTab === 'create-warehouse'" />
							<UsersList v-else-if="adminTab === 'users'" />
							<AdminUsers v-else-if="adminTab === 'create-user'" />
							<EntryHistory v-else-if="adminTab === 'entries'" />
							<ExitHistory v-else-if="adminTab === 'exits'" />
							<AdminReports v-else-if="adminTab === 'reports'" />
						</div>
					</div>
				</transition>
			</div>
		</div>
	</div>
</template>

<script setup>
import AppHeader from '~/components/AppHeader.vue'
import { useAxios } from '~/composables/useAxios'

const $axios = useAxios()

const loading = ref(true)
const userRole = ref(null)
const interfaceRole = ref(null)
const adminTab = ref('menu')

const items = [
  { key: 'warehouses', label: '📦 Склады' },
  { key: 'create-warehouse', label: '➕ Создать склад' },
  { key: 'users', label: '👥 Пользователи' },
  { key: 'create-user', label: '➕ Создать пользователя' },
  { key: 'entries', label: '🚛 История въездов' },
  { key: 'exits', label: '🚚 История выездов' },
  { key: 'reports', label: '📄 Отчёты' },
]

// UI переключение ролей для админа
function switchRole(role) {
  interfaceRole.value = role
}

async function authenticate() {
  try {
    // читаем telegram_id из query
    const params = new URLSearchParams(window.location.search)
    const telegramId = params.get('telegram_id')

    if (!telegramId) {
      console.warn('No telegram_id in URL')
      userRole.value = null
      return
    }

    const gen = await $axios.post('/auth/generate-code', null, {
      params: { telegram_id: telegramId }
    })

    const login = await $axios.get('/auth/login-by-code', {
      params: { code: gen.data.code }
    })

    const { access_token, user } = login.data

    localStorage.setItem('access_token', access_token)
    localStorage.setItem('user', JSON.stringify(user))
    localStorage.setItem('roles', JSON.stringify([user.role]))

    userRole.value = user.role
    interfaceRole.value = user.role === 'admin' ? 'admin' : user.role

  } catch (err) {
    console.error('Auth failed:', err)
    userRole.value = null
  } finally {
    loading.value = false
  }
}

onMounted(authenticate)
</script>

<style>
.safe-area-bottom {
	padding-bottom: max(6rem, env(safe-area-inset-bottom) + 6rem);
}

.animate-fade {
	animation: fade 0.4s ease-in-out;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
	transition: all 0.25s ease;
}
.fade-slide-enter-from {
	opacity: 0;
	transform: translateX(12px);
}
.fade-slide-leave-to {
	opacity: 0;
	transform: translateX(-12px);
}

@keyframes fade {
	from {
		opacity: 0;
	}

	to {
		opacity: 1;
	}
}
</style>
