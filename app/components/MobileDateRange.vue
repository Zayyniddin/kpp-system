<template>
  <div>
    <!-- Trigger -->
    <button
      @click="open = true"
      class="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-300 text-base flex justify-between items-center active:scale-[.98]"
    >
      <span class="text-gray-700">{{ displayLabel }}</span>
      <span class="text-gray-500 text-sm">📅</span>
    </button>

    <!-- Overlay -->
    <div
      v-if="open"
      class="fixed inset-0 bg-black/40 backdrop-blur-sm z-200 flex items-end"
      @click.self="close"
    >
      <div class="bg-white w-full max-w-md rounded-t-2xl p-4 shadow-xl animate-slideUp">

        <div class="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-3"></div>

        <!-- Header -->
        <div class="flex justify-between items-center mb-4">
          <button @click="close" class="text-gray-500">Отмена</button>
          <span class="font-semibold text-gray-800 text-sm">Выберите период</span>
          <button @click="apply" class="text-blue-600 font-semibold">Готово</button>
        </div>

        <!-- Inputs -->
        <div class="space-y-4">
          <!-- Start -->
          <div>
            <label class="text-xs font-medium text-gray-500 mb-1 block">Дата с:</label>
            <el-date-picker
              v-model="start"
              type="date"
              value-format="YYYY-MM-DD"
              format="YYYY-MM-DD"
              class="w-full"
              :editable="false"
              :clearable="false"
              @mousedown.prevent
            />
          </div>

          <!-- End -->
          <div>
            <label class="text-xs font-medium text-gray-500 mb-1 block">Дата по:</label>
            <el-date-picker
              v-model="end"
              type="date"
              value-format="YYYY-MM-DD"
              format="YYYY-MM-DD"
              class="w-full"
              :editable="false"
              :clearable="false"
              @mousedown.prevent
            />
          </div>
        </div>

        <!-- Quick shortcuts -->
        <div class="grid grid-cols-2 gap-2 mt-5 text-sm">
          <button v-for="btn in buttons" :key="btn.label"
            @click="btn.action"
            class="py-2 bg-gray-100 rounded-xl active:scale-95 text-gray-700 font-medium"
          >
            {{ btn.label }}
          </button>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: Array
})
const emit = defineEmits(["update:modelValue"])

const open = ref(false)
const start = ref(props.modelValue?.[0] || null)
const end   = ref(props.modelValue?.[1] || null)

function close() { open.value = false }

function apply() {
  emit("update:modelValue", [start.value, end.value])
  close()
}

const displayLabel = computed(() =>
  start.value ? `${start.value} → ${end.value || '...'}` : "Выберите период"
)

/* Quick date helpers */
function isoDate(d) { return d.toISOString().slice(0,10) }
function today() { return new Date() }

function setRange(s, e) {
  start.value = isoDate(s)
  end.value   = isoDate(e)
}

/* Buttons */
const buttons = [
  { label: "Сегодня", action: () => setRange(today(), today()) },
  { label: "7 дней", action: () => setRange(
      new Date(Date.now() - 6*86400000), today()
    )
  },
  { label: "30 дней", action: () => setRange(
      new Date(Date.now() - 29*86400000), today()
    )
  },
  { label: "Текущий месяц", action: () => {
      const d = today()
      const s = new Date(d.getFullYear(), d.getMonth(), 1)
      const e = new Date(d.getFullYear(), d.getMonth()+1, 0)
      setRange(s, e)
    }
  },
  { label: "Прошлый месяц", action: () => {
      const d = today()
      const s = new Date(d.getFullYear(), d.getMonth()-1, 1)
      const e = new Date(d.getFullYear(), d.getMonth(), 0)
      setRange(s, e)
    }
  }
]
</script>

<style>
@keyframes slideUp {
  from { transform: translateY(100%); opacity: 0; }
  to   { transform: translateY(0); opacity: 1; }
}
.animate-slideUp { animation: slideUp .25s ease-out; }
</style>