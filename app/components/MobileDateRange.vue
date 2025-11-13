<template>
  <div>
    <!-- Trigger -->
    <button
      @click="open = true"
      class="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 text-base flex justify-between items-center active:scale-[.98]"
    >
      <span class="text-gray-700">{{ display }}</span>
      <span class="text-gray-500 text-sm">📅</span>
    </button>

    <!-- Overlay -->
    <div
      v-if="open"
      @click.self="close"
      class="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex justify-center items-end"
    >
      <!-- Bottom Sheet -->
      <div class="bg-white w-full max-w-md rounded-t-2xl shadow-xl p-4 animate-slideUp">
        <div class="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-3"></div>

        <!-- Header -->
        <div class="flex justify-between items-center mb-3">

          <button @click="close" class="text-gray-500">Отмена</button>

          <!-- View switch -->
          <div class="bg-gray-100 rounded-full p-1 text-sm flex gap-1">
            <button
              class="px-3 py-1 rounded-full"
              :class="view==='days' ? 'bg-white shadow font-semibold' : 'text-gray-600'"
              @click="view='days'"
            >Дни</button>
            <button
              class="px-3 py-1 rounded-full"
              :class="view==='months' ? 'bg-white shadow font-semibold' : 'text-gray-600'"
              @click="view='months'"
            >Месяцы</button>
            <button
              class="px-3 py-1 rounded-full"
              :class="view==='years' ? 'bg-white shadow font-semibold' : 'text-gray-600'"
              @click="view='years'"
            >Годы</button>
          </div>

          <div class="flex items-center gap-3">

            <!-- ✅ CLEAR BUTTON -->
            <button
              v-if="start || end"
              @click="clearDates"
              class="text-red-500 font-medium text-sm"
            >
              Очистить
            </button>

            <button @click="apply" class="text-blue-600 font-semibold">
              Готово
            </button>
          </div>

        </div>

        <!-- QUICK buttons -->
        <div v-if="view==='days'" class="flex gap-2 mb-3 overflow-x-auto no-scrollbar">
          <button v-for="btn in quick" :key="btn.label"
            class="px-3 py-2 rounded-lg text-sm border active:scale-95 whitespace-nowrap"
            @click="btn.action"
          >{{ btn.label }}</button>
        </div>

        <!-- NAV -->
        <div class="flex items-center justify-between mb-2">
          <button @click="prev" class="px-3 py-2 rounded-lg border text-sm active:scale-95">‹</button>
          <div class="text-sm font-semibold text-gray-800">
            <template v-if="view==='days'">
              {{ ruMonth(baseMonthPrev.getMonth()) }} {{ baseMonthPrev.getFullYear() }} — {{ ruMonth(baseMonth.getMonth()) }} {{ baseMonth.getFullYear() }}
            </template>
            <template v-else-if="view==='months'">
              {{ baseYear }}
            </template>
            <template v-else>
              {{ yearsRangeStart }}–{{ yearsRangeStart + yearsPageSize - 1 }}
            </template>
          </div>
          <button @click="next" class="px-3 py-2 rounded-lg border text-sm active:scale-95">›</button>
        </div>

        <!-- CONTENT -->
        <div v-if="view==='days'" class="space-y-4">
          <MonthGrid
            :title="monthTitle(baseMonthPrev)"
            :month="baseMonthPrev"
            :start="start"
            :end="end"
            @select="onSelectDay"
          />
          <MonthGrid
            :title="monthTitle(baseMonth)"
            :month="baseMonth"
            :start="start"
            :end="end"
            @select="onSelectDay"
          />
        </div>

        <div v-else-if="view==='months'" class="grid grid-cols-3 gap-2 mt-2">
          <button
            v-for="m in 12"
            :key="m"
            class="py-3 rounded-lg border text-sm active:scale-95"
            :class="monthCellClass(baseYear, m-1)"
            @click="selectMonth(baseYear, m-1)"
          >{{ ruMonth(m-1, 'short') }}</button>
        </div>

        <div v-else class="grid grid-cols-3 gap-2 mt-2">
          <button
            v-for="y in yearsPage"
            :key="y"
            class="py-3 rounded-lg border text-sm active:scale-95"
            :class="yearCellClass(y)"
            @click="selectYear(y)"
          >{{ y }}</button>
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
function clearDates() {
  start.value = null
  end.value = null
  emit('update:modelValue', [])
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