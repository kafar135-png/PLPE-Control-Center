interface TimeRangeProps {
  range: string;
  onChange: (range: "7D" | "30D" | "90D" | "ALL") => void;
}

const ranges = [
  "7D",
  "30D",
  "90D",
  "ALL",
] as const;

function TimeRange({
  range,
  onChange,
}: TimeRangeProps) {
  return (
    <div className="portfolio-ranges">
      {ranges.map((item) => (
        <button
          key={item}
          className={
            item === range
              ? "range-btn active"
              : "range-btn"
          }
          onClick={() => onChange(item)}
        >
          {item}
        </button>
      ))}
    </div>
  );
}

export default TimeRange;