import { formatDate, getWeekdayName } from '../../lib/date'
import type { CalendarWeek, MonthLabel } from '../../lib/date'

interface ContributionGridProps {
  weeks: CalendarWeek[]
  monthLabels: MonthLabel[]
  getLevel: (dateKey: string) => number
  getDescription: (dateKey: string) => string
  onDayClick?: (dateKey: string) => void
}

const WEEKDAYS_WITH_LABELS = new Set([1, 3, 5])

export function ContributionGrid({
  weeks,
  monthLabels,
  getLevel,
  getDescription,
  onDayClick,
}: ContributionGridProps) {
  return (
    <div className="heatmap">
      <div className="heatmap__scroll">
        <div className="heatmap__inner">
          <div className="heatmap__months" style={{ gridTemplateColumns: `repeat(${weeks.length}, var(--heat-cell))` }}>
            {monthLabels.map((label) => (
              <span key={`${label.label}-${label.weekIndex}`} style={{ gridColumn: label.weekIndex + 1 }}>
                {label.label}
              </span>
            ))}
          </div>

          <div className="heatmap__body">
            <div className="heatmap__weekdays">
              {Array.from({ length: 7 }, (_, index) => (
                <span key={index}>{WEEKDAYS_WITH_LABELS.has(index) ? getWeekdayName(index) : ''}</span>
              ))}
            </div>

            <div className="heatmap__grid">
              {weeks.map((week, weekIndex) => (
                <div className="heatmap__week" key={weekIndex}>
                  {week.days.map((day) => {
                    const level = day.isFuture ? 0 : getLevel(day.key)
                    const description = getDescription(day.key)
                    return (
                      <button
                        key={day.key}
                        type="button"
                        className={`heat-cell heat-cell--${level} ${
                          day.isToday ? 'heat-cell--today' : ''
                        } ${day.isFuture ? 'heat-cell--future' : ''}`}
                        title={`${description} on ${formatDate(day.key)}`}
                        aria-label={`${description} on ${formatDate(day.key)}`}
                        disabled={!onDayClick || day.isFuture}
                        tabIndex={day.isToday && onDayClick ? 0 : -1}
                        onClick={() => onDayClick?.(day.key)}
                      />
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="heatmap__legend">
        <span>Less</span>
        <div className="heatmap__legend-swatches">
          {[0, 1, 2, 3, 4].map((level) => (
            <span key={level} className={`heat-cell heat-cell--${level}`} />
          ))}
        </div>
        <span>More</span>
        <span className="heatmap__legend-note">Last 12 months</span>
      </div>
    </div>
  )
}
