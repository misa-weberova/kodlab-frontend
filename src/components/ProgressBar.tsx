interface ProgressBarProps {
  completed: number;
  total: number;
  showText?: boolean;
}

export default function ProgressBar({ completed, total, showText = true }: ProgressBarProps) {
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="progress-container">
      <div className="progress-bar">
        <div
          className="progress-bar-fill"
          style={{ width: `${percent}%` }}
        />
      </div>
      {showText && (
        <span className="progress-text">
          {completed}/{total} ({percent}%)
        </span>
      )}
    </div>
  );
}
