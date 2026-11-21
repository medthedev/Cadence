import { useMemo, useState } from 'react'
import { buildCalendar, todayKey } from '../../lib/date'
import { createId } from '../../lib/id'
import { useAppData } from '../../store/context'
import type { HabitTemplate } from '../../data/habitLibrary'
import { HabitDetail } from './HabitDetail'
import { HabitDialog } from './HabitDialog'
import type { HabitChanges } from './HabitDialog'
import { HabitLibraryDialog } from './HabitLibraryDialog'
import { HabitOverview } from './HabitOverview'
import { HabitRail, OVERVIEW_ID } from './HabitRail'

type DialogState = { mode: 'create' } | { mode: 'edit'; habitId: string } | null

export function HabitsView() {
  const { data, dispatch } = useAppData()
  const [selectedId, setSelectedId] = useState<string>(OVERVIEW_ID)
  const [dialog, setDialog] = useState<DialogState>(null)
  const [libraryOpen, setLibraryOpen] = useState(false)
  const { weeks, monthLabels } = useMemo(() => buildCalendar(), [])
  const today = todayKey()

  const selectedHabit = data.habits.find((habit) => habit.id === selectedId)
  const dialogHabit = dialog?.mode === 'edit'
    ? data.habits.find((habit) => habit.id === dialog.habitId)
    : undefined

  function handleSubmit(changes: HabitChanges) {
    if (dialog?.mode === 'edit' && dialogHabit) {
      dispatch({ type: 'habit/update', id: dialogHabit.id, changes })
    } else {
      dispatch({
        type: 'habit/add',
        habit: {
          id: createId(),
          createdAt: today,
          completedDates: [],
          ...changes,
          waterLog: changes.kind === 'water' ? {} : undefined,
          prayerLog: changes.kind === 'prayer' ? {} : undefined,
        },
      })
    }
    setDialog(null)
  }

  function handleAddFromLibrary(template: HabitTemplate) {
    const id = createId()
    dispatch({
      type: 'habit/add',
      habit: {
        id,
        name: template.name,
        emoji: template.emoji,
        color: template.color,
        weeklyGoal: template.weeklyGoal,
        createdAt: today,
        completedDates: [],
        kind: template.kind,
        waterTarget: template.kind === 'water' ? (template.waterTarget ?? 2) : undefined,
        waterLog: template.kind === 'water' ? {} : undefined,
        prayerLog: template.kind === 'prayer' ? {} : undefined,
        source: template.category,
      },
    })
    setSelectedId(id)
    setLibraryOpen(false)
  }

  return (
    <div className="habits-layout">
      <HabitRail
        habits={data.habits}
        selectedId={selectedId}
        today={today}
        onSelect={setSelectedId}
        onToggleToday={(id) => dispatch({ type: 'habit/toggleDate', id, date: today })}
        onLogWater={(id, liters) => dispatch({ type: 'habit/logWater', id, date: today, liters })}
        onAdd={() => setDialog({ mode: 'create' })}
        onBrowseLibrary={() => setLibraryOpen(true)}
      />

      {selectedHabit ? (
        <HabitDetail
          habit={selectedHabit}
          today={today}
          weeks={weeks}
          monthLabels={monthLabels}
          onToggleDate={(date) => dispatch({ type: 'habit/toggleDate', id: selectedHabit.id, date })}
          onLogWater={(date, liters) => dispatch({ type: 'habit/logWater', id: selectedHabit.id, date, liters })}
          onTogglePrayer={(date, prayer) => dispatch({ type: 'habit/togglePrayer', id: selectedHabit.id, date, prayer })}
          onEdit={() => setDialog({ mode: 'edit', habitId: selectedHabit.id })}
          onDelete={() => {
            dispatch({ type: 'habit/delete', id: selectedHabit.id })
            setSelectedId(OVERVIEW_ID)
            setDialog(null)
          }}
        />
      ) : (
        <HabitOverview
          habits={data.habits}
          today={today}
          weeks={weeks}
          monthLabels={monthLabels}
          onSelectHabit={setSelectedId}
          onBrowseLibrary={() => setLibraryOpen(true)}
        />
      )}

      {libraryOpen && (
        <HabitLibraryDialog
          addedNames={data.habits.map((habit) => habit.name)}
          onClose={() => setLibraryOpen(false)}
          onAdd={handleAddFromLibrary}
        />
      )}

      {dialog && (
        <HabitDialog
          habit={dialogHabit}
          onClose={() => setDialog(null)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  )
}
