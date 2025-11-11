<template>
  <!-- DESKTOP MODE -->
  <div v-if="!isMobile" class="space-y-2 w-full">
    <label class="block text-sm font-semibold text-gray-700">Период</label>

    <div class="flex gap-2">
      <input
        v-model="start"
        type="date"
        class="w-1/2 px-3 py-2 rounded-xl border border-gray-300 focus:border-blue-500"
        @change="emitRange"
      />
      <input
        v-model="end"
        type="date"
        class="w-1/2 px-3 py-2 rounded-xl border border-gray-300 focus:border-blue-500"
        @change="emitRange"
      />
    </div>
  </div>

  <!-- MOBILE MODE -->
  <div v-else>
    <button
      @click="open = true"
      class="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 text-base flex justify-between items-center active:scale-[.98]"
    >
      <span class="text-gray-700">
        {{ display }}
      </span>
      <span class="text-gray-500 text-sm">📅</span>
    </button>

    <!-- Overlay -->
    <div
      v-if="open"
      @click.self="close"
      class="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex justify-center items-end"
    >
      <div class="bg-white w-full max-w-md rounded-t-2xl shadow-xl p-4 animate-slideUp">
        <div class="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-3"></div>

        <div class="flex justify-between items-center mb-3">
          <button @click="close" class="text-gray-500">Отмена</button>

          <div class="bg-gray-100 rounded-full p-1 text-sm flex gap-1">
            <button
              :class="view=='days' ? 'bg-white shadow font-semibold px-3 py-1 rounded-full' : 'px-3 py-1 text-gray-600'"
              @click="view='days'"
            >Дни</button>
            <button
              :class="view=='months' ? 'bg-white shadow font-semibold px-3 py-1 rounded-full' : 'px-3 py-1 text-gray-600'"
              @click="view='months'"
            >Месяцы</button>
            <button
              :class="view=='years' ? 'bg-white shadow font-semibold px-3 py-1 rounded-full' : 'px-3 py-1 text-gray-600'"
              @click="view='years'"
            >Годы</button>
          </div>

          <button @click="apply" class="text-blue-600 font-semibold">Готово</button>
        </div>

        <!-- QUICK BUTTONS -->
        <div v-if="view==='days'" class="flex gap-2 mb-3 overflow-x-auto no-scrollbar">
          <button
            v-for="btn in quick"
            :key="btn.label"
            @click="btn.action"
            class="px-3 py-2 rounded-lg text-sm border active:scale-95 whitespace-nowrap"
          >
            {{ btn.label }}
          </button>
        </div>

        <!-- NAV -->
        <div class="flex items-center justify-between mb-2">
          <button @click="prev" class="px-3 py-2 rounded-lg border text-sm active:scale-95">‹</button>
          <div class="text-sm font-semibold text-gray-800">
            <template v-if="view==='days'">
              {{ monthTitle(prevMonth) }} — {{ monthTitle(currentMonth) }}
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

        <!-- DAYS VIEW (two months) -->
        <div v-if="view==='days'" class="space-y-4">
          <MonthGrid :title="monthTitle(prevMonth)" :month="prevMonth" :start="start" :end="end" @select="selectDay"/>
          <MonthGrid :title="monthTitle(currentMonth)" :month="currentMonth" :start="start" :end="end" @select="selectDay"/>
        </div>

        <!-- MONTHS VIEW -->
        <div v-else-if="view==='months'" class="grid grid-cols-3 gap-2 mt-2">
          <button
            v-for="m in 12"
            :key="m"
            @click="selectMonth(baseYear, m-1)"
            class="py-3 rounded-lg border text-sm active:scale-95"
            :class="monthClass(baseYear, m-1)"
          >
            {{ monthName(m-1, 'short') }}
          </button>
        </div>

        <!-- YEARS VIEW -->
        <div v-else class="grid grid-cols-3 gap-2 mt-2">
          <button
            v-for="y in yearsList"
            :key="y"
            @click="selectYear(y)"
            class="py-3 rounded-lg border text-sm active:scale-95"
            :class="yearClass(y)"
          >
            {{ y }}
          </button>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { useDevice } from '#imports'

const device = useDevice()
const isMobile = computed(() => device.isMobileOrTablet)

// model
const props = defineProps({ modelValue: Array })
const emit = defineEmits(['update:modelValue'])

const start = ref(props.modelValue?.[0] || null)
const end   = ref(props.modelValue?.[1] || null)
const open  = ref(false)
const view  = ref('days')

// QUICK BUTTONS
const quick = [
  { label:'Сегодня', action:()=>{ let d=new Date(); s(d); e(d) }},
  { label:'7 дней',  action:()=>{ let ed=new Date(); let sd=new Date(Date.now()-6*86400000); s(sd); e(ed) }},
  { label:'30 дней', action:()=>{ let ed=new Date(); let sd=new Date(Date.now()-29*86400000); s(sd); e(ed) }},
]

// DATES
const today = new Date()
const currentMonth = ref(new Date(today.getFullYear(), today.getMonth(), 1))
const prevMonth = computed(() => new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth()-1,1))

function s(d){ start.value = iso(d) }
function e(d){ end.value = iso(d) }
function iso(d){ return d.toISOString().slice(0,10) }

function monthName(m,short){
  const long = ['январь','февраль','март','апрель','май','июнь','июль','август','сентябрь','октябрь','ноябрь','декабрь']
  const shortArr = ['янв','фев','мар','апр','май','июн','июл','авг','сен','окт','ноя','дек']
  return short ? shortArr[m] : long[m]
}

function monthTitle(d){ return `${monthName(d.getMonth())} ${d.getFullYear()}` }

function selectDay(d){
  if (!start.value || end.value){
    start.value = d; end.value = null
  } else if (new Date(d) >= new Date(start.value)){
    end.value = d
  } else {
    end.value = start.value
    start.value = d
  }
}

// YEAR + MONTH SELECT
const baseYear = ref(today.getFullYear())
const yearsPageSize = 12
const yearsRangeStart = ref(Math.floor(baseYear.value / yearsPageSize) * yearsPageSize)
const yearsList = computed(()=>Array.from({length:yearsPageSize},(_,i)=>yearsRangeStart.value+i))

function selectMonth(y,m){
  s(new Date(y,m,1))
  e(new Date(y,m+1,0))
  currentMonth.value = new Date(y,m,1)
  view.value='days'
}
function selectYear(y){
  s(new Date(y,0,1))
  e(new Date(y,11,31))
  baseYear.value = y
  currentMonth.value = new Date(y,11,1)
  view.value='months'
}

// NAV
function prev(){
  if(view.value==='days') currentMonth.value = new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth()-1,1)
  else if(view.value==='months') baseYear.value--
  else yearsRangeStart.value-=yearsPageSize
}
function next(){
  if(view.value==='days') currentMonth.value = new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth()+1,1)
  else if(view.value==='months') baseYear.value++
  else yearsRangeStart.value+=yearsPageSize
}

// STYLES
function inRange(y,m){
  let s=start.value?new Date(start.value):null, e=end.value?new Date(end.value):null
  let ms=new Date(y,m,1), me=new Date(y,m+1,0)
  return s&&e&&me>=s&&ms<=e
}

function monthClass(y,m){
  return [
    'border-gray-300 text-gray-700',
    inRange(y,m) ? 'bg-blue-50 border-blue-300 text-blue-700' : '',
  ]
}

function yearClass(y){
  let s=start.value?new Date(start.value).getFullYear():null, e=end.value?new Date(end.value).getFullYear():null
  return [
    'border-gray-300 text-gray-700',
    s && e && y>=s && y<=e ? 'bg-blue-50 border-blue-300 text-blue-700' : ''
  ]
}

// UI
const display = computed(()=> start.value ? `${start.value} — ${end.value}` : 'Выберите период')

function apply(){
  emit('update:modelValue',[start.value,end.value])
  open.value=false
}
function close(){ open.value=false }
function emitRange(){
  emit('update:modelValue',[start.value,end.value])
}
</script>

<style scoped>
@keyframes slideUp { from{transform:translateY(100%);opacity:0} to{transform:translateY(0);opacity:1}}
.animate-slideUp { animation: slideUp .25s ease-out; }
.no-scrollbar::-webkit-scrollbar { display: none; }
</style>