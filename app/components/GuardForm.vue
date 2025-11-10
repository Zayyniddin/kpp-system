<template>
	<div class="space-y-6">
		<div class="bg-white/80 backdrop-blur rounded-2xl shadow-lg p-2">
			<div class="grid grid-cols-2 gap-2">
				<button
					@click="mode = 'entry'"
					:class="[
						'py-4 px-4 rounded-xl font-semibold text-base transition-all',
						mode === 'entry'
							? 'bg-green-500 text-white shadow-md'
							: 'bg-gray-100 text-gray-600',
					]"
				>
					↓ Въезд
				</button>
				<button
					@click="mode = 'exit'"
					:class="[
						'py-4 px-4 rounded-xl font-semibold text-base transition-all',
						mode === 'exit'
							? 'bg-red-500 text-white shadow-md'
							: 'bg-gray-100 text-gray-600',
					]"
				>
					↑ Выезд
				</button>
			</div>
		</div>

		<!-- ENTRY -->
		<div
			v-if="mode === 'entry'"
			class="bg-white/80 backdrop-blur rounded-2xl shadow-lg p-6 space-y-4"
		>
			<!-- Plate -->
			<div>
				<label class="block text-sm font-medium text-gray-700 mb-2"
					>Номер машины*</label
				>
				<input
					v-model="entryForm.plate_number"
					@input="formatPlate"
					type="text"
					placeholder="А123БВ777"
					class="w-full px-4 py-4 rounded-xl border-2"
					:class="inputClass('plate_number')"
				/>
				<p v-if="errors.plate_number" class="text-sm text-red-500 mt-1">
					{{ errors.plate_number }}
				</p>
			</div>

			<!-- Project -->
			<div>
				<label class="block text-sm font-medium text-gray-700 mb-2"
					>Проект*</label
				>
				<select
					v-model="entryForm.project"
					class="w-full px-4 py-4 rounded-xl border-2"
					:class="inputClass('project')"
				>
					<option value="">Выберите проект</option>
					<option value="project-a">Проект А</option>
					<option value="project-b">Проект Б</option>
					<option value="project-c">Проект В</option>
				</select>
				<p v-if="errors.project" class="text-sm text-red-500 mt-1">
					{{ errors.project }}
				</p>
			</div>

			<!-- Driver -->
			<div>
				<label class="block text-sm font-medium text-gray-700 mb-2"
					>ФИО водителя*</label
				>
				<input
					v-model="entryForm.driver_name"
					type="text"
					placeholder="Иванов Иван"
					class="w-full px-4 py-4 rounded-xl border-2"
					:class="inputClass('driver_name')"
				/>
				<p v-if="errors.driver_name" class="text-sm text-red-500 mt-1">
					{{ errors.driver_name }}
				</p>
			</div>

			<!-- Phone -->
			<div>
				<label class="block text-sm font-medium text-gray-700 mb-2"
					>Телефон*</label
				>
				<input
					v-model="phoneInput"
					@input="formatPhone"
					type="tel"
					placeholder="+998 ** *** ** **"
					class="w-full px-4 py-4 rounded-xl border-2"
					:class="inputClass('driver_phone')"
				/>
				<p v-if="errors.driver_phone" class="text-sm text-red-500 mt-1">
					{{ errors.driver_phone }}
				</p>
			</div>

			<!-- Comment (optional) -->
			<div>
				<label class="block text-sm font-medium text-gray-700 mb-2"
					>Комментарий</label
				>
				<textarea
					v-model="entryForm.comment"
					rows="3"
					placeholder="Дополнительная информация..."
					class="w-full px-4 py-4 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none text-base resize-none"
				></textarea>
			</div>

			<!-- Submit -->
			<button
				@click="handleEntry"
				:disabled="loading"
				class="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-5 px-6 rounded-xl shadow-lg transition-all text-lg active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
			>
				<span v-if="!loading">✓ Подтвердить въезд</span>

				<div v-else class="flex items-center gap-2">
					<div
						class="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"
					></div>
					<span>Отправляем...</span>
				</div>
			</button>
		</div>

		<!-- EXIT -->
		<div
			v-else
			class="bg-white/80 backdrop-blur rounded-2xl shadow-lg p-6 space-y-4"
		>
			<div>
				<label class="block text-sm font-medium text-gray-700 mb-2"
					>Номер пропуска*</label
				>
				<input
					v-model="exitForm.passNumber"
					type="text"
					placeholder="12345"
					class="w-full px-4 py-4 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none text-base"
				/>
			</div>

			<button
				@click="handleExit"
				:disabled="exitLoading"
				class="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-5 px-6 rounded-xl shadow-lg transition-all text-lg active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
			>
				<span v-if="!exitLoading">✓ Подтвердить выезд</span>

				<div v-else class="flex items-center gap-2">
					<div
						class="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"
					></div>
					<span>Отправляем...</span>
				</div>
			</button>
		</div>
	</div>
</template>

<script setup>
import { ElNotification } from 'element-plus'
import { useAxios } from '~/composables/useAxios'

const $axios = useAxios()

const mode = ref('entry')
const loading = ref(false)
const exitLoading = ref(false)
const phoneInput = ref('')

const entryForm = ref({
	plate_number: '',
	project: '',
	driver_name: '',
	driver_phone: '',
	comment: '',
})

const exitForm = ref({ passNumber: '' })
const errors = ref({})

function inputClass(key) {
	return errors.value[key]
		? 'border-red-500 focus:border-red-500'
		: 'border-gray-200 focus:border-blue-500'
}

function formatPlate() {
	entryForm.value.plate_number = entryForm.value.plate_number.toUpperCase()
}

async function handleExit() {
	if (!exitForm.value.passNumber) {
		return ElNotification({
			title: 'Ошибка',
			message: 'Введите номер пропуска',
			type: 'error',
			duration: 3000,
		})
	}

	exitLoading.value = true
	try {
		await $axios.post('/guard/exit', null, {
			params: { pass_number: exitForm.value.passNumber }
		})

		ElNotification({
			title: 'Успех',
			message: 'Выезд зарегистрирован ✅',
			type: 'success',
			duration: 2500,
		})

		exitForm.value.passNumber = ''

	} catch (err) {
		const message =
			err.response?.data?.message ||
			err.response?.data?.error ||
			'Ошибка сервера, попробуйте снова'

		ElNotification({
			title: 'Ошибка',
			message,
			type: 'error',
			duration: 4000,
		})
	} finally {
		exitLoading.value = false
	}
}

function formatPhone(e) {
	let digits = e.target.value.replace(/\D/g, '')
	if (digits.startsWith('998')) digits = digits.slice(3)
	if (digits.length > 9) digits = digits.slice(0, 9)

	const formatted = `+998 ${digits.slice(0, 2)} ${digits.slice(
		2,
		5
	)} ${digits.slice(5, 7)} ${digits.slice(7, 9)}`.trim()
	phoneInput.value = formatted
	entryForm.value.driver_phone = `998${digits}`
}

function validate() {
	errors.value = {}
	if (!entryForm.value.plate_number)
		errors.value.plate_number = 'Введите номер авто'
	if (!entryForm.value.project) errors.value.project = 'Выберите проект'
	if (!entryForm.value.driver_name)
		errors.value.driver_name = 'Введите имя водителя'
	if (
		!entryForm.value.driver_phone ||
		entryForm.value.driver_phone.length !== 12
	)
		errors.value.driver_phone = 'Введите корректный номер телефона'

	return Object.keys(errors.value).length === 0
}

async function handleEntry() {
	if (!validate()) return

	loading.value = true
	try {
		await $axios.post('/guard/entry', entryForm.value)

		ElNotification({
			title: 'Успех',
			message: 'Въезд зарегистрирован ✅',
			type: 'success',
			duration: 2500,
		})

		entryForm.value = {
			plate_number: '',
			project: '',
			driver_name: '',
			driver_phone: '',
			comment: '',
		}
		phoneInput.value = ''
	} catch (err) {
		const message =
			err.response?.data?.message ||
			err.response?.data?.error ||
			'Ошибка сервера, попробуйте снова'

		ElNotification({
			title: 'Ошибка',
			message,
			type: 'error',
			duration: 4000,
		})
	} finally {
		loading.value = false
	}
}
</script>
