import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Bet, BetCategory, BetResult } from "@/types/models";
import { X, Trash2 } from "lucide-react";

interface Props {
  bet: Bet | null;
  onClose: () => void;
  onDelete?: () => void;
}

const CATEGORIES: BetCategory[] = ["Canal Telegram", "Personal", "En Observación"];
const RESULTS: BetResult[] = ["Pendiente", "Ganada", "Perdida", "Nula"];

export function BetFormModal({ bet, onClose, onDelete }: Props) {
  const { addBet, updateBet } = useApp();
  const [fecha, setFecha] = useState(bet?.fecha || new Date().toISOString().slice(0, 10));
  const [partido, setPartido] = useState(bet?.partido || "");
  const [pronostico, setPronostico] = useState(bet?.pronostico || "");
  const [cuota, setCuota] = useState(bet?.cuota.toString() || "");
  const [stake, setStake] = useState(bet?.stake.toString() || "");
  const [categoria, setCategoria] = useState<BetCategory>(bet?.categoria || "Canal Telegram");
  const [resultado, setResultado] = useState<BetResult>(bet?.resultado || "Pendiente");

  const save = () => {
    if (!partido.trim() || !cuota || !stake) return;
    const data: Bet = {
      id: bet?.id || crypto.randomUUID(),
      fecha, partido: partido.trim(), pronostico: pronostico.trim(),
      cuota: parseFloat(cuota), stake: parseFloat(stake),
      categoria, resultado,
    };
    bet ? updateBet(data) : addBet(data);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/30 animate-fade-in" onClick={onClose}>
      <div className="bg-card w-full max-w-lg rounded-t-2xl p-5 pb-8 animate-slide-up safe-bottom max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground">{bet ? "Editar Apuesta" : "Nueva Apuesta"}</h2>
          <div className="flex gap-2">
            {onDelete && (
              <button onClick={onDelete} className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center">
                <Trash2 className="w-4 h-4 text-destructive" />
              </button>
            )}
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Partido *</label>
            <input value={partido} onChange={e => setPartido(e.target.value)} placeholder="Ej: Real Madrid vs Barcelona"
              className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Pronóstico</label>
            <input value={pronostico} onChange={e => setPronostico(e.target.value)} placeholder="Ej: Over 2.5 goles"
              className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Fecha</label>
              <input type="date" value={fecha} onChange={e => setFecha(e.target.value)}
                className="w-full px-2 py-2.5 rounded-lg bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Cuota *</label>
              <input type="number" step="0.01" value={cuota} onChange={e => setCuota(e.target.value)} placeholder="1.85"
                className="w-full px-2 py-2.5 rounded-lg bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Stake *</label>
              <input type="number" step="0.01" value={stake} onChange={e => setStake(e.target.value)} placeholder="10"
                className="w-full px-2 py-2.5 rounded-lg bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Categoría</label>
            <div className="flex gap-2">
              {CATEGORIES.map(c => (
                <button key={c} onClick={() => setCategoria(c)}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${categoria === c ? 'bg-primary text-primary-foreground' : 'bg-background border border-border text-muted-foreground'}`}>
                  {c === "Canal Telegram" ? "Telegram" : c === "En Observación" ? "Observación" : c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Resultado</label>
            <div className="grid grid-cols-4 gap-2">
              {RESULTS.map(r => (
                <button key={r} onClick={() => setResultado(r)}
                  className={`py-2 rounded-lg text-xs font-medium transition-colors ${
                    resultado === r
                      ? r === "Ganada" ? "bg-success text-success-foreground"
                        : r === "Perdida" ? "bg-destructive text-destructive-foreground"
                        : "bg-primary text-primary-foreground"
                      : "bg-background border border-border text-muted-foreground"
                  }`}>
                  {r}
                </button>
              ))}
            </div>
          </div>

          <button onClick={save}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm mt-2 active:scale-[0.98] transition-transform">
            {bet ? "Guardar Cambios" : "Añadir Apuesta"}
          </button>
        </div>
      </div>
    </div>
  );
}
