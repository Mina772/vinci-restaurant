export default function Spinner({ label = "Loading" }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16" role="status">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-ink-muted border-t-gold" />
      <span className="text-sm text-gray-400">{label}…</span>
    </div>
  );
}
