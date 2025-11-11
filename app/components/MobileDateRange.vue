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
        <!-- Drag bar -->
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

          <button @click="apply" class="text-blue-600 font-semibold">Готово</button>
        </div>

        <!-- Quick buttons (только для дней) -->
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
        <!-- DAYS: два месяца — прошлый СВЕРХУ, текущий СНИЗУ -->
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

        <!-- MONTHS: сетка 12 месяцев выбранного года -->
        <div v-else-if="view==='months'" class="grid grid-cols-3 gap-2 mt-2">
          <button
            v-for="m in 12"
            :key="m"
            class="py-3 rounded-lg border text-sm active:scale-95"
            :class="monthCellClass(baseYear, m-1)"
            @click="selectMonth(baseYear, m-1)"
          >{{ ruMonth(m-1, 'short') }}</button>
        </div>

        <!-- YEARS: сетка лет (страницы по 12 лет) -->
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
const props = defineProps({ modelValue: Array })
const emit = defineEmits(['update:modelValue'])

/* STATE */
const open = ref(false)
const view = ref('days') // 'days' | 'months' | 'years'

const range = ref(props.modelValue || [])
const start = ref(range.value?.[0] || null)
const end   = ref(range.value?.[1] || null)

/* BASE MONTH NAV (для days) — текущий месяц снизу, прошлый сверху */
const today = new Date()
const baseMonth = ref(new Date(today.getFullYear(), today.getMonth(), 1)) // текущий
const baseMonthPrev = computed(() => new Date(baseMonth.value.getFullYear(), baseMonth.value.getMonth()-1, 1))

/* MONTHS VIEW */
const baseYear = ref(today.getFullYear())

/* YEARS VIEW */
const yearsPageSize = 12
const yearsRangeStart = ref(Math.floor(today.getFullYear() / yearsPageSize) * yearsPageSize)
const yearsPage = computed(() => Array.from({length: yearsPageSize}, (_,i) => yearsRangeStart.value + i))

/* UTILS */
function close(){ open.value = false }
function apply(){
  emit('update:modelValue', [start.value, end.value])
  close()
}
const display = computed(() => start.value ? `${start.value} — ${end.value}` : 'Выберите период')

function fmt(date){ return date.toISOString().slice(0,10) }
function firstOfMonth(y,m){ return new Date(y,m,1) }
function lastOfMonth(y,m){ return new Date(y,m+1,0) }

function ruMonth(m, variant='long'){
  const namesLong = ['январь','февраль','март','апрель','май','июнь','июль','август','сентябрь','октябрь','ноябрь','декабрь']
  const namesShort = ['янв','фев','мар','апр','май','июн','июл','авг','сен','окт','ноя','дек']
  return variant==='short' ? namesShort[m] : namesLong[m]
}
function monthTitle(d){ return `${ruMonth(d.getMonth())} ${d.getFullYear()}` }

/* DAY SELECTION */
function onSelectDay(isoDate){
  if (!start.value || (start.value && end.value)){
    start.value = isoDate
    end.value = null
  } else if (new Date(isoDate) >= new Date(start.value)) {
    end.value = isoDate
  } else {
    end.value = start.value
    start.value = isoDate
  }
}

/* MONTH / YEAR selection -> заполняем диапазоны */
function selectMonth(y, m){
  const s = firstOfMonth(y,m)
  const e = lastOfMonth(y,m)
  start.value = fmt(s)
  end.value = fmt(e)
  view.value = 'days'
  // Сдвигаем базовый месяц на выбранный — чтобы был снизу, а прошлый сверху
  baseMonth.value = new Date(y, m, 1)
}
function monthCellClass(y,m){
  const s = start.value ? new Date(start.value) : null
  const e = end.value   ? new Date(end.value)   : null
  const thisStart = firstOfMonth(y,m)
  const thisEnd   = lastOfMonth(y,m)
  const inRange = s && e && thisEnd >= s && thisStart <= e
  const exact = s && e && s.getFullYear()===y && s.getMonth()===m && e.getFullYear()===y && e.getMonth()===m
  return [
    inRange ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-300 text-gray-700',
    exact ? 'bg-blue-600 !text-white !border-blue-600 font-semibold' : ''
  ]
}

function selectYear(y){
  const s = new Date(y,0,1)
  const e = new Date(y,11,31)
  start.value = fmt(s)
  end.value = fmt(e)
  view.value = 'months'
  baseYear.value = y
  // также полезно подвинуть baseMonth (days view) к декабрю y
  baseMonth.value = new Date(y, 11, 1)
}
function yearCellClass(y){
  const s = start.value ? new Date(start.value) : null
  const e = end.value   ? new Date(end.value)   : null
  const inRange = s && e && y >= s.getFullYear() && y <= e.getFullYear()
  const exact = s && e && s.getFullYear()===y && e.getFullYear()===y
  return [
    inRange ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-300 text-gray-700',
    exact ? 'bg-blue-600 !text-white !border-blue-600 font-semibold' : ''
  ]
}

/* NAV */
function prev(){
  if (view.value==='days'){
    baseMonth.value = new Date(baseMonth.value.getFullYear(), baseMonth.value.getMonth()-1, 1)
  } else if (view.value==='months'){
    baseYear.value -= 1
  } else {
    yearsRangeStart.value -= yearsPageSize
  }
}
function next(){
  if (view.value==='days'){
    baseMonth.value = new Date(baseMonth.value.getFullYear(), baseMonth.value.getMonth()+1, 1)
  } else if (view.value==='months'){
    baseYear.value += 1
  } else {
    yearsRangeStart.value += yearsPageSize
  }
}

/* QUICK (для дней) */
function toIso(d){ return d.toISOString().slice(0,10) }
const quick = [
  { label:'Сегодня', action:()=>{ const d=new Date(); start.value=toIso(d); end.value=toIso(d)} },
  { label:'7 дней',  action:()=>{ const e=new Date(); const s=new Date(Date.now()-6*86400000); start.value=toIso(s); end.value=toIso(e)} },
  { label:'30 дней', action:()=>{ const e=new Date(); const s=new Date(Date.now()-29*86400000); start.value=toIso(s); end.value=toIso(e)} },
]
</script>

<script>
// внутренний саб-компонент сетки месяца (минимум логики — только рендер)
export default {
  components: {
    MonthGrid: {
      props: ['title','month','start','end'],
      emits: ['select'],
      computed: {
        days(){ return ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'] },
        grid(){
          const y = this.month.getFullYear()
          const m = this.month.getMonth()
          const first = new Date(y,m,1)
          const startDay = (first.getDay()+6)%7 // Monday-first
          const daysCount = new Date(y,m+1,0).getDate()
          const cells = []
          for(let i=0;i<startDay;i++) cells.push({ empty:true, key:'e'+i })
          for(let d=1; d<=daysCount; d++){
            const date = new Date(y,m,d).toISOString().slice(0,10)
            cells.push({ d, date, empty:false, key:date })
          }
          return cells
        }
      },
      methods:{
        cls(date){
          if (!date || this.empty) return ''
          const s = this.start ? new Date(this.start) : null
          const e = this.end   ? new Date(this.end)   : null
          const cur = new Date(date)
          const isStart = s && cur.getTime()===s.getTime()
          const isEnd   = e && cur.getTime()===e.getTime()
          const inRange = s && e && cur >= s && cur <= e
          return [
            'p-2 rounded-lg text-sm text-center',
            inRange ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100',
            (isStart||isEnd) ? 'bg-blue-600 !text-white font-semibold' : ''
          ].join(' ')
        }
      },
      template: `
        <div>
          <div class="font-semibold text-center text-gray-800 mb-1">{{ title }}</div>
          <div class="grid grid-cols-7 text-xs text-gray-500 mb-1 text-center">
            <span v-for="d in days" :key="d">{{ d }}</span>
          </div>
          <div class="grid grid-cols-7 gap-1">
            <template v-for="c in grid" :key="c.key">
              <div v-if="c.empty"></div>
              <button v-else :class="cls(c.date)" @click="$emit('select', c.date)">{{ c.d }}</button>
            </template>
          </div>
        </div>
      `
    }
  }
}
</script>

<style>
@keyframes slideUp {
  from { transform: translateY(100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
.animate-slideUp { animation: slideUp .25s ease-out; }
.no-scrollbar::-webkit-scrollbar { display: none; }
</style>