export default function GlassLoader({ label = 'Memuat data...' }) {
  return (
    <div className="flex items-center justify-center py-12 px-4 animate-page-in">
      <div className="liquid-glass rounded-3xl px-8 py-7 flex flex-col items-center gap-4 text-center max-w-xs w-full">
        <div className="relative w-14 h-14 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20 border-t-emerald-600 border-r-amber-400 animate-spin" />
          <img
            src="/logo/kabinet-bumi-cakrawala.png"
            alt="Loading"
            className="w-8 h-8 object-contain animate-pulse"
          />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-800">{label}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Kabinet Bumi Cakrawala 2026</p>
        </div>
      </div>
    </div>
  );
}
