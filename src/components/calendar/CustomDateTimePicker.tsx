import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Clock, Calendar as CalendarIcon } from 'lucide-react'

interface CustomDateTimePickerProps {
  value: string // format: YYYY-MM-DDTHH:mm
  onChange: (value: string) => void
  isDark: boolean
}

const MONTH_NAMES = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
]

const DAY_NAMES = ['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz']

export function CustomDateTimePicker({
  value,
  onChange,
  isDark,
}: CustomDateTimePickerProps) {
  // Parse incoming value or fallback
  const parsed = useMemo(() => {
    if (!value || !value.includes('T')) {
      const fallback = new Date(2026, 9, 19, 10, 0)
      return {
        year: fallback.getFullYear(),
        month: fallback.getMonth(),
        day: fallback.getDate(),
        hour: 10,
        minute: 0,
      }
    }
    const [datePart, timePart] = value.split('T')
    const [y, m, d] = datePart.split('-').map(Number)
    const [hh, mm] = timePart.split(':').map(Number)
    return {
      year: y,
      month: m - 1, // 0-indexed
      day: d,
      hour: isNaN(hh) ? 10 : hh,
      minute: isNaN(mm) ? 0 : mm,
    }
  }, [value])

  // View month/year state for navigating months
  const [viewDate, setViewDate] = useState(() => new Date(parsed.year, parsed.month, 1))

  const viewYear = viewDate.getFullYear()
  const viewMonth = viewDate.getMonth()

  const handlePrevMonth = () => {
    setViewDate(new Date(viewYear, viewMonth - 1, 1))
  }

  const handleNextMonth = () => {
    setViewDate(new Date(viewYear, viewMonth + 1, 1))
  }

  // Generate calendar grid
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate()
  
  let startDayOfWeek = new Date(viewYear, viewMonth, 1).getDay() - 1
  if (startDayOfWeek === -1) startDayOfWeek = 6

  interface DayCell {
    day: number
    monthOffset: number // -1, 0, 1
    dateString: string
    isCurrentMonth: boolean
    isSelected: boolean
    isToday: boolean
  }

  const selectedDateStr = `${parsed.year}-${String(parsed.month + 1).padStart(2, '0')}-${String(parsed.day).padStart(2, '0')}`
  const todayStr = '2026-10-18'

  const cells: DayCell[] = []

  // Prev month padding
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i
    const m = viewMonth === 0 ? 12 : viewMonth
    const y = viewMonth === 0 ? viewYear - 1 : viewYear
    const ds = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    cells.push({
      day: d,
      monthOffset: -1,
      dateString: ds,
      isCurrentMonth: false,
      isSelected: ds === selectedDateStr,
      isToday: ds === todayStr,
    })
  }

  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    const ds = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    cells.push({
      day: d,
      monthOffset: 0,
      dateString: ds,
      isCurrentMonth: true,
      isSelected: ds === selectedDateStr,
      isToday: ds === todayStr,
    })
  }

  // Next month padding
  const remaining = 7 - (cells.length % 7)
  if (remaining < 7) {
    for (let d = 1; d <= remaining; d++) {
      const m = viewMonth === 11 ? 1 : viewMonth + 2
      const y = viewMonth === 11 ? viewYear + 1 : viewYear
      const ds = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      cells.push({
        day: d,
        monthOffset: 1,
        dateString: ds,
        isCurrentMonth: false,
        isSelected: ds === selectedDateStr,
        isToday: ds === todayStr,
      })
    }
  }

  const handleSelectDay = (cell: DayCell) => {
    const timeStr = `${String(parsed.hour).padStart(2, '0')}:${String(parsed.minute).padStart(2, '0')}`
    onChange(`${cell.dateString}T${timeStr}`)
    if (cell.monthOffset !== 0) {
      const [y, m] = cell.dateString.split('-').map(Number)
      setViewDate(new Date(y, m - 1, 1))
    }
  }

  const handleHourChange = (newHour: number) => {
    const clamped = Math.max(0, Math.min(23, newHour))
    const dateStr = selectedDateStr
    const timeStr = `${String(clamped).padStart(2, '0')}:${String(parsed.minute).padStart(2, '0')}`
    onChange(`${dateStr}T${timeStr}`)
  }

  const handleMinuteChange = (newMinute: number) => {
    const clamped = Math.max(0, Math.min(59, newMinute))
    const dateStr = selectedDateStr
    const timeStr = `${String(parsed.hour).padStart(2, '0')}:${String(clamped).padStart(2, '0')}`
    onChange(`${dateStr}T${timeStr}`)
  }

  return (
    <div
      className={`rounded-2xl border p-4 transition-all ${
        isDark
          ? 'bg-[#15120d] border-[#292217] text-stone-200'
          : 'bg-[#fffdfa] border-[#e8dfd2] text-stone-800 shadow-xs'
      }`}
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Left: Mini Calendar Grid (7 cols) */}
        <div className="md:col-span-7 flex flex-col justify-between">
          {/* Calendar Month Header */}
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-1.5 font-bold text-xs tracking-tight">
              <CalendarIcon className="w-3.5 h-3.5 text-amber-500" />
              <span>{MONTH_NAMES[viewMonth]} {viewYear}</span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                  isDark
                    ? 'border-[#292217] hover:bg-[#201a13] text-stone-300'
                    : 'border-[#dfd6c7] hover:bg-[#f6eee3] text-stone-700'
                }`}
                title="Önceki Ay"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                  isDark
                    ? 'border-[#292217] hover:bg-[#201a13] text-stone-300'
                    : 'border-[#dfd6c7] hover:bg-[#f6eee3] text-stone-700'
                }`}
                title="Sonraki Ay"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Weekday Names */}
          <div className="grid grid-cols-7 text-center text-[11px] font-semibold text-stone-400 mb-1">
            {DAY_NAMES.map((name, i) => (
              <div key={i} className="py-1">
                {name}
              </div>
            ))}
          </div>

          {/* Day Cells Grid */}
          <div className="grid grid-cols-7 gap-1 text-xs">
            {cells.map((cell, idx) => {
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectDay(cell)}
                  className={`h-8 rounded-xl flex items-center justify-center font-medium transition-all relative cursor-pointer ${
                    cell.isSelected
                      ? isDark
                        ? 'bg-amber-500 text-stone-950 font-bold shadow-md shadow-amber-500/20 ring-2 ring-amber-500/30'
                        : 'bg-[#d97706] text-white font-bold shadow-md shadow-[#d97706]/25 ring-2 ring-[#d97706]/30'
                      : !cell.isCurrentMonth
                      ? 'opacity-30 text-stone-500 hover:opacity-70'
                      : isDark
                      ? 'hover:bg-[#261f15] text-stone-300'
                      : 'hover:bg-[#f8f1e6] text-stone-700'
                  }`}
                >
                  <span>{cell.day}</span>
                  {/* Subtle dot for today if not selected */}
                  {cell.isToday && !cell.isSelected && (
                    <span className="absolute bottom-1 w-1 h-1 rounded-full bg-amber-500" />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Right: Modern Amber Time Picker & Presets (5 cols) */}
        <div 
          className={`md:col-span-5 flex flex-col justify-between pt-4 md:pt-0 md:pl-5 border-t md:border-t-0 md:border-l ${
            isDark ? 'border-[#262016]' : 'border-[#eee6dc]'
          }`}
        >
          {/* Time Picker Spinner/Inputs */}
          <div>
            <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              Saat ve Dakika
            </label>

            {/* Amber Digital Clock Input */}
            <div 
              className={`p-3 rounded-xl border flex items-center justify-center gap-2 mb-3 ${
                isDark ? 'bg-[#0c0a07] border-[#292217]' : 'bg-[#faf6f0] border-[#e2d7c7]'
              }`}
            >
              {/* Hour input */}
              <div className="flex flex-col items-center">
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={String(parsed.hour).padStart(2, '0')}
                  onChange={(e) => handleHourChange(parseInt(e.target.value) || 0)}
                  className={`w-12 h-10 text-center font-mono font-bold text-lg rounded-lg border transition-all focus:outline-hidden ${
                    isDark 
                      ? 'bg-[#18140f] border-amber-500/40 text-amber-300 focus:border-amber-500' 
                      : 'bg-white border-[#d97706]/50 text-[#b45309] focus:border-[#d97706]'
                  }`}
                />
                <span className="text-[10px] text-stone-400 mt-1">Saat</span>
              </div>

              <span className="text-xl font-bold font-mono text-amber-500 -mt-3">:</span>

              {/* Minute input */}
              <div className="flex flex-col items-center">
                <input
                  type="number"
                  min="0"
                  max="59"
                  step="5"
                  value={String(parsed.minute).padStart(2, '0')}
                  onChange={(e) => handleMinuteChange(parseInt(e.target.value) || 0)}
                  className={`w-12 h-10 text-center font-mono font-bold text-lg rounded-lg border transition-all focus:outline-hidden ${
                    isDark 
                      ? 'bg-[#18140f] border-amber-500/40 text-amber-300 focus:border-amber-500' 
                      : 'bg-white border-[#d97706]/50 text-[#b45309] focus:border-[#d97706]'
                  }`}
                />
                <span className="text-[10px] text-stone-400 mt-1">Dakika</span>
              </div>
            </div>
          </div>

          {/* Formatted Summary Bar */}
          <div 
            className={`mt-4 p-2.5 rounded-xl border flex items-center justify-between text-xs font-mono ${
              isDark 
                ? 'bg-[#1a1610] border-amber-500/30 text-amber-300' 
                : 'bg-amber-50/80 border-[#fde68a] text-[#b45309]'
            }`}
          >
            <span className="text-[11px] opacity-80">Seçilen:</span>
            <span className="font-bold">
              {parsed.day} {MONTH_NAMES[parsed.month]} {parsed.year}, {String(parsed.hour).padStart(2, '0')}:{String(parsed.minute).padStart(2, '0')}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
