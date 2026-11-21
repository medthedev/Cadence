import { useId } from 'react'
import { addDays, toDateKey } from '../../lib/date'

export interface ChartPoint {
  label: string
  value: number
  hint?: string
}

export interface DonutSegment {
  label: string
  value: number
  color: string
}

interface ChartProps {
  points: ChartPoint[]
  height?: number
  format?: (value: number) => string
  color?: string
  labelEvery?: number
  emptyText?: string
}

function chartLabel(points: ChartPoint[], index: number, every: number): string {
  if (index === points.length - 1) return points[index].label
  return index % every === 0 ? points[index].label : ''
}

export function BarChart({
  points,
  height = 170,
  format = (value) => String(Math.round(value)),
  color = 'var(--accent)',
  labelEvery,
  emptyText = 'Nothing to plot yet. Add some activity and it will appear here.',
}: ChartProps) {
  const max = points.reduce((best, point) => Math.max(best, point.value), 0)
  if (max <= 0) return <div className="chart-empty">{emptyText}</div>

  const every = labelEvery ?? Math.max(1, Math.ceil(points.length / 9))

  return (
    <div className="bar-chart" style={{ height }}>
      <div className="bar-chart__grid" aria-hidden="true">
        <span /><span /><span />
      </div>
      <div className="bar-chart__plot">
        {points.map((point, index) => (
          <div className="bar-chart__col" key={`${point.label}-${index}`}>
            <div className="bar-chart__slot">
              <div
                className={`bar-chart__bar ${point.value <= 0 ? 'bar-chart__bar--empty' : ''}`}
                style={{ height: `${point.value <= 0 ? 3 : Math.max(4, (point.value / max) * 100)}%`, background: color }}
                title={`${point.label}: ${format(point.value)}${point.hint ? ` · ${point.hint}` : ''}`}
              />
            </div>
            <span className="bar-chart__label">{chartLabel(points, index, every)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function TrendChart({
  points,
  height = 170,
  format = (value) => String(Math.round(value)),
  color = 'var(--accent)',
  labelEvery,
  emptyText = 'Nothing to plot yet. Add some activity and it will appear here.',
}: ChartProps) {
  const gradientId = useId().replace(/:/g, '')
  const max = points.reduce((best, point) => Math.max(best, point.value), 0)
  if (max <= 0) return <div className="chart-empty">{emptyText}</div>

  const coords = points.map((point, index) => ({
    x: points.length === 1 ? 100 : (index / (points.length - 1)) * 100,
    y: 94 - (point.value / max) * 86,
  }))
  const line = coords.map((coord, index) => `${index === 0 ? 'M' : 'L'}${coord.x.toFixed(2)},${coord.y.toFixed(2)}`).join(' ')
  const area = `${line} L100,100 L0,100 Z`
  const every = labelEvery ?? Math.max(1, Math.ceil(points.length / 9))

  return (
    <div className="trend-chart" style={{ height }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label="Trend over time">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.28" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[25, 50, 75].map((y) => (
          <line key={y} x1="0" y1={y} x2="100" y2={y} className="trend-chart__grid" vectorEffect="non-scaling-stroke" />
        ))}
        <path d={area} fill={`url(#${gradientId})`} />
        <path d={line} fill="none" stroke={color} strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        {coords.map((coord, index) => (
          <circle
            key={`${points[index].label}-${index}`}
            cx={coord.x}
            cy={coord.y}
            r="2.25"
            fill={color}
            vectorEffect="non-scaling-stroke"
          >
            <title>{`${points[index].label}: ${format(points[index].value)}`}</title>
          </circle>
        ))}
      </svg>
      <div className="trend-chart__labels" aria-hidden="true">
        {points.map((point, index) => (
          <span key={`${point.label}-${index}`}>{chartLabel(points, index, every)}</span>
        ))}
      </div>
    </div>
  )
}

interface DonutChartProps {
  segments: DonutSegment[]
  format?: (value: number) => string
  centerLabel?: string
  centerValue?: string
}

const DONUT_RADIUS = 15.9155

export function DonutChart({
  segments,
  format = (value) => String(Math.round(value)),
  centerLabel,
  centerValue,
}: DonutChartProps) {
  const visible = segments.filter((segment) => segment.value > 0)
  const total = visible.reduce((sum, segment) => sum + segment.value, 0)
  const shareOf = (segment: DonutSegment) => total > 0 ? (segment.value / total) * 100 : 0
  const ringSegments = visible.map((segment, index) => ({
    segment,
    share: shareOf(segment),
    offset: visible.slice(0, index).reduce((sum, item) => sum + shareOf(item), 0),
  }))

  return (
    <div className="donut">
      <div className="donut__figure">
        <svg viewBox="0 0 42 42" role="img" aria-label={centerLabel ?? 'Breakdown'}>
          <circle cx="21" cy="21" r={DONUT_RADIUS} className="donut__track" />
          <g transform="rotate(-90 21 21)">
            {total > 0 && ringSegments.map(({ segment, share, offset }) => {
              const drawn = Math.max(0, share - 0.9)
              return (
                <circle
                  key={segment.label}
                  cx="21"
                  cy="21"
                  r={DONUT_RADIUS}
                  fill="transparent"
                  stroke={segment.color}
                  strokeWidth="5"
                  strokeDasharray={`${drawn} ${100 - drawn}`}
                  strokeDashoffset={-offset}
                >
                  <title>{`${segment.label}: ${format(segment.value)}`}</title>
                </circle>
              )
            })}
          </g>
        </svg>
        {(centerValue || centerLabel) && (
          <div className="donut__center">
            {centerValue && <strong>{centerValue}</strong>}
            {centerLabel && <span>{centerLabel}</span>}
          </div>
        )}
      </div>
      {visible.length > 0 && (
        <ul className="donut__legend">
          {visible.map((segment) => (
            <li key={segment.label}>
              <span className="donut__swatch" style={{ background: segment.color }} />
              <span className="donut__legend-label">{segment.label}</span>
              <strong>{format(segment.value)}</strong>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function heatLevel(score: number): number {
  if (score <= 0) return 0
  if (score < 5) return 1
  if (score < 12) return 2
  if (score < 24) return 3
  return 4
}

interface YearHeatmapProps {
  year: number
  counts: Record<string, number>
  onSelect?: (key: string) => void
}

interface HeatDay {
  key: string
  level: number
  inYear: boolean
  weekday: number
  score: number
}

export function YearHeatmap({ year, counts, onSelect }: YearHeatmapProps) {
  const end = new Date(year, 11, 31)
  const first = new Date(year, 0, 1)
  const days: HeatDay[] = []
  const cursor = addDays(first, -first.getDay())

  while (cursor < end || cursor.getDay() !== 6) {
    const key = toDateKey(cursor)
    const score = counts[key] ?? 0
    days.push({
      key,
      level: heatLevel(score),
      inYear: cursor.getFullYear() === year,
      weekday: cursor.getDay(),
      score,
    })
    cursor.setDate(cursor.getDate() + 1)
  }

  const weeks: HeatDay[][] = []
  for (let index = 0; index < days.length; index += 7) weeks.push(days.slice(index, index + 7))

  const monthLabels: Array<{ label: string; week: number }> = []
  let previousMonth = -1
  weeks.forEach((week, weekIndex) => {
    const day = week.find((item) => item.inYear)
    if (!day) return
    const month = new Date(`${day.key}T00:00:00`).getMonth()
    if (month !== previousMonth) {
      monthLabels.push({ label: new Date(year, month, 1).toLocaleDateString(undefined, { month: 'short' }), week: weekIndex })
      previousMonth = month
    }
  })

  return (
    <div className="year-heat">
      <div className="year-heat__months" style={{ gridTemplateColumns: `repeat(${weeks.length}, var(--heat-cell))` }}>
        {monthLabels.map((month) => (
          <span key={`${month.label}-${month.week}`} style={{ gridColumn: month.week + 1 }}>{month.label}</span>
        ))}
      </div>
      <div className="year-heat__body">
        <div className="year-heat__weekdays" aria-hidden="true">
          <span>Mon</span><span>Wed</span><span>Fri</span>
        </div>
        <div className="year-heat__weeks">
          {weeks.map((week, weekIndex) => (
            <div className="year-heat__week" key={weekIndex}>
              {week.map((day) => (
                <button
                  key={day.key}
                  type="button"
                  className={`heat-square heat-square--${day.level} ${day.inYear ? '' : 'heat-square--outside'}`}
                  title={`${day.key}: ${day.score} pts`}
                  disabled={!day.inYear || !onSelect}
                  onClick={() => onSelect?.(day.key)}
                  aria-label={`${day.key}, ${day.score} activity points`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="year-heat__legend">
        <span>Less</span>
        {[0, 1, 2, 3, 4].map((level) => (
          <i key={level} className={`heat-square heat-square--${level}`} />
        ))}
        <span>More</span>
      </div>
    </div>
  )
}
