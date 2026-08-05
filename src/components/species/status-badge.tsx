export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    confirmed_infected: "bg-red-100 text-red-800",
    at_risk: "bg-wattle-gold/25 text-yellow-900",
    historically_affected: "bg-zinc-200 text-zinc-700",
    no_known_risk: "bg-zinc-100 text-zinc-500",
  };
  const labels: Record<string, string> = {
    confirmed_infected: "Confirmed infected",
    at_risk: "At risk",
    historically_affected: "Historically affected",
    no_known_risk: "No known risk",
  };
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
        styles[status] ?? styles.no_known_risk
      }`}
    >
      {labels[status] ?? status}
    </span>
  );
}
