import { Plus, X, Trash2, Target, CheckCircle2, Circle, Clock } from "lucide-react";
import { Goal, GoalTerm, Milestone } from "@/types/models";
import { SwipeableItem } from "@/components/SwipeableItem";
import { motion } from "framer-motion";
import { useApp } from "@/context/AppContext";
import { useState } from "react";

const TERMS: GoalTerm[] = ["Corto", "Medio", "Largo"];
const TERM_LABELS: Record<GoalTerm, string> = { Corto: "Corto Plazo", Medio: "Medio Plazo", Largo: "Largo Plazo" };

export default function GoalsScreen() {
  const { goals, addGoal, updateGoal, deleteGoal } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [detail, setDetail] = useState<Goal | null>(null);

  return (
    <div className="pb-4">
      <div className="px-4 pt-2 pb-3 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Objetivos</h1>
        <button onClick={() => setShowForm(true)} className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
          <Plus className="w-4 h-4 text-primary-foreground" />
        </button>
      </div>

      <div className="px-4 space-y-4">
        {TERMS.map(term => {
          const termGoals = goals.filter(g => g.plazo === term);
          if (termGoals.length === 0) return null;
          return (
            <div key={term}>
              <p className="text-xs text-muted-foreground font-medium mb-2">{TERM_LABELS[term]}</p>
              <div className="grid grid-cols-2 gap-2">
                {termGoals.map(goal => {
                  const today = new Date();
                  const targetDate = goal.fechaObjetivo ? new Date(goal.fechaObjetivo) : null;
                  const daysLeft = targetDate ? Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : null;

                  return (
                    <SwipeableItem key={goal.id} onDelete={() => deleteGoal(goal.id)}>
                      <button onClick={() => setDetail(goal)}
                        className="ios-card p-3 text-left active:scale-[0.97] transition-transform relative overflow-hidden w-full h-full">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 max-w-[70%]">
                            <Target className="w-4 h-4 text-primary shrink-0" />
                            <p className="text-sm font-semibold text-foreground truncate">{goal.objetivo}</p>
                          </div>
                          {daysLeft !== null && (
                            <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold ${daysLeft < 0 ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
                              <Clock className="w-2.5 h-2.5" />
                              {daysLeft < 0 ? 'Expirado' : `${daysLeft}d`}
                            </div>
                          )}
                        </div>
                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${goal.progreso}%` }} />
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <p className="text-[10px] text-muted-foreground">{goal.progreso}%</p>
                          {goal.hitos && goal.hitos.length > 0 && (
                            <p className="text-[9px] text-muted-foreground font-medium">
                              {goal.hitos.filter(h => h.completado).length}/{goal.hitos.length} hitos
                            </p>
                          )}
                        </div>
                      </button>
                    </SwipeableItem>
                  );
                })}
              </div>
            </div>
          );
        })}

        {goals.length === 0 && (
          <div className="ios-card p-8 text-center">
            <p className="text-muted-foreground text-sm">No hay objetivos</p>
          </div>
        )}
      </div>

      {/* Detail modal */}
      {detail && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/30 animate-fade-in" onClick={() => setDetail(null)}>
          <motion.div
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.y > 100) setDetail(null);
            }}
            className="bg-card w-full max-w-lg rounded-t-2xl p-5 pb-12 animate-slide-up safe-bottom" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mb-4 opacity-40 shrink-0" />
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground">{detail.objetivo}</h2>
              <div className="flex gap-2">
                <button onClick={() => { deleteGoal(detail.id); setDetail(null); }}
                  className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center">
                  <Trash2 className="w-4 h-4 text-destructive" />
                </button>
                <button onClick={() => setDetail(null)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-1">Motivación</p>
            <p className="text-sm text-foreground mb-4 leading-relaxed">{detail.motivacion || "Sin motivación definida."}</p>

            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <p className="text-xs text-muted-foreground">Progreso manual: {detail.progreso}%</p>
                {detail.fechaObjetivo && (
                  <p className="text-[10px] text-primary font-bold">Fecha: {new Date(detail.fechaObjetivo).toLocaleDateString()}</p>
                )}
              </div>
              <input type="range" min={0} max={100} value={detail.progreso}
                onChange={e => {
                  const updated = { ...detail, progreso: parseInt(e.target.value) };
                  updateGoal(updated);
                  setDetail(updated);
                }}
                className="w-full accent-primary" />
            </div>

            {/* Milestones section in detail */}
            <div className="pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-3">Hitos del Objetivo</p>
              <div className="space-y-2">
                {detail.hitos && detail.hitos.length > 0 ? (
                  detail.hitos.map(h => (
                    <div key={h.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50"
                      onClick={() => {
                        const newHitos = detail.hitos?.map(item => item.id === h.id ? { ...item, completado: !item.completado } : item);
                        const updated = { ...detail, hitos: newHitos };
                        updateGoal(updated);
                        setDetail(updated);
                      }}>
                      {h.completado ? <CheckCircle2 className="w-4 h-4 text-success" /> : <Circle className="w-4 h-4 text-muted-foreground/40" />}
                      <span className={`text-sm ${h.completado ? 'text-muted-foreground line-through' : 'text-foreground'}`}>{h.texto}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-4 bg-muted/20 rounded-xl italic">
                    No has definido hitos para este objetivo.
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* New goal form */}
      {showForm && <GoalForm onClose={() => setShowForm(false)} />}
    </div>
  );
}

function GoalForm({ onClose }: { onClose: () => void }) {
  const { addGoal } = useApp();
  const [objetivo, setObjetivo] = useState("");
  const [plazo, setPlazo] = useState<GoalTerm>("Corto");
  const [motivacion, setMotivacion] = useState("");
  const [fecha, setFecha] = useState("");
  const [tempHito, setTempHito] = useState("");
  const [hitos, setHitos] = useState<Milestone[]>([]);

  const addHito = () => {
    if (!tempHito.trim()) return;
    setHitos([...hitos, { id: crypto.randomUUID(), texto: tempHito.trim(), completado: false }]);
    setTempHito("");
  };

  const save = () => {
    if (!objetivo.trim()) return;
    addGoal({
      id: crypto.randomUUID(),
      objetivo: objetivo.trim(),
      plazo,
      motivacion: motivacion.trim(),
      progreso: 0,
      fechaObjetivo: fecha || undefined,
      hitos: hitos.length > 0 ? hitos : undefined
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/30 animate-fade-in" onClick={onClose}>
      <motion.div
        drag="y"
        dragConstraints={{ top: 0 }}
        dragElastic={0.2}
        onDragEnd={(_, info) => {
          if (info.offset.y > 100) onClose();
        }}
        className="bg-card w-full max-w-lg rounded-t-2xl p-5 pb-12 animate-slide-up safe-bottom max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mb-4 opacity-40 shrink-0" />
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground">Nuevo Objetivo</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        <div className="space-y-4">
          <input value={objetivo} onChange={e => setObjetivo(e.target.value)} placeholder="¿Cuál es tu objetivo?"
            className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" autoFocus />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Plazo</label>
              <div className="flex gap-2">
                {TERMS.map(t => (
                  <button key={t} onClick={() => setPlazo(t)}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${plazo === t ? "bg-primary text-primary-foreground" : "bg-background border border-border text-muted-foreground"}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Fecha Objetivo</label>
              <input type="date" value={fecha} onChange={e => setFecha(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </div>

          <textarea value={motivacion} onChange={e => setMotivacion(e.target.value)} placeholder="¿Por qué es importante para ti?"
            rows={2}
            className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none" />

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Hitos (pasos para lograrlo)</label>
            <div className="flex gap-2 mb-2">
              <input value={tempHito} onChange={e => setTempHito(e.target.value)} placeholder="Ej: Ahorrar 500€..."
                className="flex-1 px-3 py-2 rounded-lg bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              <button onClick={addHito} className="px-3 py-2 rounded-lg bg-muted text-foreground text-xs font-bold">Añadir</button>
            </div>
            <div className="space-y-1.5 max-h-32 overflow-y-auto no-scrollbar">
              {hitos.map(h => (
                <div key={h.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                  <span className="text-xs text-foreground">{h.texto}</span>
                  <button onClick={() => setHitos(hitos.filter(item => item.id !== h.id))} className="text-destructive">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button onClick={save}
            className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-sm mt-2 active:scale-[0.98] transition-transform">
            Crear Objetivo
          </button>
        </div>
      </motion.div>
    </div>
  );
}
