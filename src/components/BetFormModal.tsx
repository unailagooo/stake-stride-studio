import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Bet, BetLeg, BetResult } from "@/types/models";
import { X, Trash2, Plus, Minus } from "lucide-react";

interface Props {
  bet: Bet | null;
  folderId: string;
  betType: "simple" | "combined";
  hasStake: boolean;
  onClose: () => void;
  onDelete?: () => void;
}

const RESULTS: BetResult[] = ["Pendiente", "Ganada", "Perdida", "Nula"];

export function BetFormModal({ bet, folderId, betType, hasStake, onClose, onDelete }: Props) {
  const { addBet, updateBet } = useApp();
  const isEdit = !!bet;
  const type = isEdit ? bet.type : betType;

  // Simple fields
  const [fecha, setFecha] = useState(bet?.fecha || new Date().toISOString().slice(0, 10));
  const [hora, setHora] = useState(bet?.hora || "");
  const [partido, setPartido] = useState(bet?.partido || "");
  const [pronostico, setPronostico] = useState(bet?.pronostico || "");
  const [cuota, setCuota] = useState(bet?.cuota.toString() || "");
  const [stake, setStake] = useState(bet?.stake.toString() || "");
  const [resultado, setResultado] = useState<BetResult>(bet?.resultado || "Pendiente");

  // Combined fields
  const [legs, setLegs] = useState<BetLeg[]>(
    bet?.legs || [
      { id: crypto.randomUUID(), partido: "", pronostico: "", cuota: 0, resultado: "Pendiente" },
      { id: crypto.randomUUID(), partido: "", pronostico: "", cuota: 0, resultado: "Pendiente" },
    ]
  );

  const addLeg = () => {
    setLegs([...legs, { id: crypto.randomUUID(), partido: "", pronostico: "", cuota: 0, resultado: "Pendiente" }]);
  };

  const removeLeg = (id: string) => {
    if (legs.length <= 2) return;
    setLegs(legs.filter(l => l.id !== id));
  };

  const updateLeg = (id: string, field: keyof BetLeg, value: any) => {
    setLegs(legs.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  const save = () => {
    if (type === "simple") {
      if (!partido.trim() || !cuota) return;
      const data: Bet = {
        id: bet?.id || crypto.randomUUID(),
        folderId,
        type: "simple",
        fecha,
        hora: hora || undefined,
        partido: partido.trim(),
        pronostico: pronostico.trim(),
        cuota: parseFloat(cuota) || 0,
        stake: hasStake ? parseFloat(stake || "0") || 0 : 0,
        resultado,
      };
      isEdit ? updateBet(data) : addBet(data);
    } else {
      const validLegs = legs.filter(l => l.partido.trim() && l.cuota > 0);
      if (validLegs.length < 2) return;
      const combinedCuota = validLegs.reduce((acc, l) => acc * l.cuota, 1);
      const data: Bet = {
        id: bet?.id || crypto.randomUUID(),
        folderId,
        type: "combined",
        fecha,
        hora: hora || undefined,
        partido: validLegs.map(l => l.partido).join(" + "),
        pronostico: validLegs.map(l => l.pronostico).join(" | "),
        cuota: combinedCuota,
        stake: hasStake ? parseFloat(stake || "0") || 0 : 0,
        resultado: "Pendiente",
        legs: validLegs,
      };
      isEdit ? updateBet(data) : addBet(data);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/30 animate-fade-in" onClick={onClose}>
      <div className="bg-card w-full max-w-lg rounded-t-2xl p-5 pb-12 animate-slide-up safe-bottom max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground">
            {isEdit ? "Editar" : "Nueva"} {type === "combined" ? "Combinada" : "Apuesta"}
          </h2>
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
          {type === "simple" ? (
            <>
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Cuota *</label>
                  <input type="number" step="0.01" value={cuota} onChange={e => setCuota(e.target.value)} placeholder="1.85"
                    className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                {hasStake && (
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Stake</label>
                    <input type="number" step="0.01" value={stake} onChange={e => setStake(e.target.value)} placeholder="10"
                      className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Fecha</label>
                  <input type="date" value={fecha} onChange={e => setFecha(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Hora</label>
                  <input type="time" value={hora} onChange={e => setHora(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Combined bet legs */}
              <div className="space-y-3">
                {legs.map((leg, i) => (
                  <div key={leg.id} className="bg-background rounded-lg p-3 border border-border space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-muted-foreground">Selección {i + 1}</p>
                      {legs.length > 2 && (
                        <button onClick={() => removeLeg(leg.id)} className="text-destructive">
                          <Minus className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <input value={leg.partido} onChange={e => updateLeg(leg.id, "partido", e.target.value)}
                      placeholder="Partido" className="w-full px-2 py-2 rounded-md bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
                    <div className="grid grid-cols-2 gap-2">
                      <input value={leg.pronostico} onChange={e => updateLeg(leg.id, "pronostico", e.target.value)}
                        placeholder="Pronóstico" className="w-full px-2 py-2 rounded-md bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
                      <input type="number" step="0.01" value={leg.cuota || ""} onChange={e => updateLeg(leg.id, "cuota", parseFloat(e.target.value) || 0)}
                        placeholder="Cuota" className="w-full px-2 py-2 rounded-md bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
                    </div>
                    {isEdit && (
                      <div className="grid grid-cols-4 gap-1">
                        {RESULTS.map(r => (
                          <button key={r} onClick={() => updateLeg(leg.id, "resultado", r)}
                            className={`py-1.5 rounded text-[10px] font-medium transition-colors ${leg.resultado === r
                              ? r === "Ganada" ? "bg-success text-success-foreground"
                                : r === "Perdida" ? "bg-destructive text-destructive-foreground"
                                  : "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                              }`}>
                            {r}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                <button onClick={addLeg} className="w-full py-2 rounded-lg border border-dashed border-border text-xs text-muted-foreground font-medium flex items-center justify-center gap-1">
                  <Plus className="w-3 h-3" /> Añadir selección
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Fecha</label>
                  <input type="date" value={fecha} onChange={e => setFecha(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Hora</label>
                  <input type="time" value={hora} onChange={e => setHora(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {hasStake && (
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Stake</label>
                    <input type="number" step="0.01" value={stake} onChange={e => setStake(e.target.value)} placeholder="10"
                      className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                )}
                <div className="flex items-end pb-3">
                  <div className="text-[10px] text-muted-foreground">
                    Cuota combinada: <span className="font-bold text-foreground">
                      @{legs.filter(l => l.cuota > 0).reduce((a, l) => a * l.cuota, 1).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Result selector (simple bets only) */}
          {type === "simple" && (
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Resultado</label>
              <div className="grid grid-cols-4 gap-2">
                {RESULTS.map(r => (
                  <button key={r} onClick={() => setResultado(r)}
                    className={`py-2 rounded-lg text-xs font-medium transition-colors ${resultado === r
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
          )}

          <button onClick={save}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm mt-2 active:scale-[0.98] transition-transform">
            {isEdit ? "Guardar Cambios" : type === "combined" ? "Añadir Combinada" : "Añadir Apuesta"}
          </button>
        </div>
      </div>
    </div>
  );
}
