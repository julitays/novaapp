export function Page({ title, actions, children }) {
  return (
    <div className="px-6 pb-10">
      <div className="flex items-center justify-between py-4">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <div className="flex gap-2">{actions}</div>
      </div>
      {children}
    </div>
  );
}
