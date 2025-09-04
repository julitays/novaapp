export default function Card({ children, className = "" }) {
  return (
    <div className={`rounded-3xl bg-white shadow-card border border-slate-100 ${className}`}>
      {children}
    </div>
  );
}
