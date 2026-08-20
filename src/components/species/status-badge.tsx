export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    confirmed_infected: "bg-red-100 text-red-800",
    at_risk: "bg-wattle-gold/25 text-yellow-900",
  };
  const labels: Record<string, string> = {
    confirmed_infected: "Confirmed infected",
    at_risk: "At risk",
  };
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
        styles[status] ?? styles.at_risk
      }`}
    >
      {labels[status] ?? status}
    </span>
  );
}
