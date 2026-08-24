interface ProgressRingProps {
  completed: number
  total: number
}

export function ProgressRing({ completed, total }: ProgressRingProps) {
  const percentage = total ? Math.round((completed / total) * 100) : 0
  return (
    <div className="progress-ring" style={{ '--progress': `${percentage * 3.6}deg` } as React.CSSProperties} aria-label={`${completed} of ${total} tasks complete`}>
      <div className="progress-ring__inner">
        <strong>{completed}</strong>
        <span>of {total}</span>
      </div>
    </div>
  )
}
