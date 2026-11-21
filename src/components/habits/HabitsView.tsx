import { useMemo, useState } from 'react'
import { buildCalendar, todayKey } from '../../lib/date'
import { createId } from '../../lib/id'
import { useAppData } from '../../store/context'
import { HabitDetail } from './HabitDetail'
import { HabitDialog } from './HabitDialog'
import type { HabitChanges } from './HabitDialog'
import { HabitOverview } from './HabitOverview'
import { HabitRail, OVERVIEW_ID } from './HabitRail'

type DialogState = { mode: 'create' } | { mode: 'edit'; habitId: string } | null

export function HabitsView() {
  const { data, dispatch } = useAppData()
  const [selectedId, setSelectedId] = useState<string>(OVERVIEW_ID)
  const [dialog, setDialog] = useState<DialogState>(null)
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
        habit: { id: createId(), createdAt: today, completedDates: [], ...changes },
      })
    }
    setDialog(null)
  }

  return (
    <div className="habits-layout">
      <HabitRail
        habits={data.habits}
        selectedId={selectedId}
        today={today}
        onSelect={setSelectedId}
        onToggleToday={(id) => dispatch({ type: 'habit/toggleDate', id, date: today })}
        onAdd={() => setDialog({ mode: 'create' })}
      />

      {selectedHabit ? (
        <HabitDetail
          habit={selectedHabit}
          today={today}
          weeks={weeks}
          monthLabels={monthLabels}
          onToggleDate={(date) => dispatch({ type: 'habit/toggleDate', id: selectedHabit.id, date })}
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
