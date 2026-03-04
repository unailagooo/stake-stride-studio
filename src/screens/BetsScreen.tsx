import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Bet, BetCategory, BetResult, calcBenefit } from "@/types/models";
import { Plus, X, TrendingUp, Target, BarChart3, Percent } from "lucide-react";
import { BetFormModal } from "@/components/BetFormModal";

const FILTERS = ["Todas", "Pendientes", "Canal Telegram", "Personales", "Observación"] as const;

function resultColor(r: BetResult) {
  switch (r) {
    case "Ganada": return "text-success";
    case "Perdida": return "text-destructive";
    default: return "text-pending";
  }
}

function resultBg(r: BetResult) {
  switch (r) {
    case "Ganada": return "bg-success/10 text-success";
    case "Perdida": return "bg-destructive/10 text-destructive";
    default: return "bg-muted text-muted-foreground";
  }
}

export default function BetsScreen() {
  const { bets, deleteBet } = useApp();
  const [filter, setFilter] = useState<string>("Todas");
  const [showForm, setShowForm] = useState(false);
  const [editBet, setEditBet] = useState<Bet | null>(null);

  const filtered = bets.filter(b => {
    if (filter === "Todas") return true;
    if (filter === "Pendientes") return b.resultado === "Pendiente";
    if (filter === "Canal Telegram") return b.categoria === "Canal Telegram";
    if (filter === "Personales") return b.categoria === "Personal";
    if (filter === "Observación") return b.categoria === "En Observación";
    return true;
  });

  // Dashboard metrics by category
  const categories: BetCategory[] = ["Canal Telegram", "Personal", "En Observación"];
  
  const getMetrics = (catBets: Bet[]) => {
    const resolved = catBets.filter(b => b.resultado !== "Pendiente" && b.resultado !== "Nula");
    const totalStake = resolved.reduce((s, b) => s + b.stake, 0);
    const totalBenefit = catBets.reduce((s, b) => s + calcBenefit(b), 0);
    const avgCuota = catBets.length > 0 ? catBets.reduce((s, b) => s + b.cuota, 0) / catBets.length : 0;
    const roi = totalStake > 0 ? (totalBenefit / totalStake) * 100 : 0;
    const wins = catBets.filter(b => b.resultado === "Ganada").length;
    const losses = catBets.filter(b => b.resultado === "Perdida").length;
    const winRate = (wins + losses) > 0 ? (wins / (wins + losses)) * 100 : 0;
    return { totalBenefit, avgCuota, roi, winRate, total: catBets.length };
  };

  const allMetrics = getMetrics(bets);

  return (
    <div className="pb-4">
      <div className="px-4 pt-2 pb-3">
        <h1 className="text-2xl font-bold text-foreground">Apuestas</h1>
      </div>

      {/* Dashboard */}
      <div className="px-4 mb-4">
        <div className="ios-card p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Beneficio</p>
                <p className={`text-base font-bold ${allMetrics.totalBenefit >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {allMetrics.totalBenefit >= 0 ? '+' : ''}{allMetrics.totalBenefit.toFixed(2)}€
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Percent className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">ROI</p>
                <p className={`text-base font-bold ${allMetrics.roi >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {allMetrics.roi.toFixed(1)}%
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Cuota Media</p>
                <p className="text-base font-bold text-foreground">{allMetrics.avgCuota.toFixed(2)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
                <Target className="w-4 h-4 text-success" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Win Rate</p>
                <p className="text-base font-bold text-foreground">{allMetrics.winRate.toFixed(0)}%</p>
              </div>
            </div>
          </div>

          {/* Per-category mini stats */}
          <div className="border-t border-border pt-3 space-y-2">
            {categories.map(cat => {
              const m = getMetrics(bets.filter(b => b.categoria === cat));
              if (m.total === 0) return null;
              return (
                <div key={cat} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{cat}</span>
                  <div className="flex gap-3">
                    <span className={m.totalBenefit >= 0 ? 'text-success font-medium' : 'text-destructive font-medium'}>
                      {m.totalBenefit >= 0 ? '+' : ''}{m.totalBenefit.toFixed(2)}€
                    </span>
                    <span className="text-muted-foreground">ROI {m.roi.toFixed(1)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 mb-3 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filter === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground ios-card"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Bet list */}
      <div className="px-4 space-y-2">
        {filtered.length === 0 && (
          <div className="ios-card p-8 text-center">
            <p className="text-muted-foreground text-sm">No hay apuestas</p>
          </div>
        )}
        {filtered.map(bet => (
          <div
            key={bet.id}
            className="ios-card p-3 flex items-center gap-3 active:scale-[0.98] transition-transform cursor-pointer"
            onClick={() => { setEditBet(bet); setShowForm(true); }}
          >
            <div className={`w-2 h-10 rounded-full flex-shrink-0 ${
              bet.resultado === "Ganada" ? "bg-success" :
              bet.resultado === "Perdida" ? "bg-destructive" : "bg-pending"
            }`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{bet.partido}</p>
              <p className="text-xs text-muted-foreground">{bet.pronostico}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {new Date(bet.fecha).toLocaleDateString("es-ES", { day: "numeric", month: "short" })} · {bet.categoria}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-sm font-bold text-foreground">@{bet.cuota.toFixed(2)}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${resultBg(bet.resultado)}`}>
                {bet.resultado}
              </span>
              {(bet.resultado === "Ganada" || bet.resultado === "Perdida") && (
                <p className={`text-xs font-semibold mt-0.5 ${calcBenefit(bet) >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {calcBenefit(bet) >= 0 ? '+' : ''}{calcBenefit(bet).toFixed(2)}€
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* FAB */}
      <button
        onClick={() => { setEditBet(null); setShowForm(true); }}
        className="fixed bottom-20 right-4 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center active:scale-95 transition-transform z-40"
      >
        <Plus className="w-6 h-6" />
      </button>

      {showForm && (
        <BetFormModal
          bet={editBet}
          onClose={() => { setShowForm(false); setEditBet(null); }}
          onDelete={editBet ? () => { deleteBet(editBet.id); setShowForm(false); setEditBet(null); } : undefined}
        />
      )}
    </div>
  );
}
