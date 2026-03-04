import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Goal, GoalTerm } from "@/types/models";
import { Plus, X, Trash2, Target } from "lucide-react";

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
                {termGoals.map(goal => (
                  <button key={goal.id} onClick={() => setDetail(goal)}
                    className="ios-card p-3 text-left active:scale-[0.97] transition-transform">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4 text-primary" />
                      <p className="text-sm font-semibold text-foreground truncate">{goal.objetivo}</p>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${goal.progreso}%` }} />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">{goal.progreso}%</p>
                  </button>
                ))}
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
          <div className="bg-card w-full max-w-lg rounded-t-2xl p-5 pb-12 animate-slide-up safe-bottom" onClick={e => e.stopPropagation()}>
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
            <p className="text-xs text-muted-foreground mb-2">Progreso: {detail.progreso}%</p>
            <input type="range" min={0} max={100} value={detail.progreso}
              onChange={e => {
                const updated = { ...detail, progreso: parseInt(e.target.value) };
                updateGoal(updated);
                setDetail(updated);
              }}
              className="w-full accent-primary" />
          </div>
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

  const save = () => {
    if (!objetivo.trim()) return;
    addGoal({ id: crypto.randomUUID(), objetivo: objetivo.trim(), plazo, motivacion: motivacion.trim(), progreso: 0 });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/30 animate-fade-in" onClick={onClose}>
      <div className="bg-card w-full max-w-lg rounded-t-2xl p-5 pb-12 animate-slide-up safe-bottom max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground">Nuevo Objetivo</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        <div className="space-y-3">
          <input value={objetivo} onChange={e => setObjetivo(e.target.value)} placeholder="¿Cuál es tu objetivo?"
            className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" autoFocus />
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
          <textarea value={motivacion} onChange={e => setMotivacion(e.target.value)} placeholder="¿Por qué es importante para ti?"
            rows={3}
            className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
          <button onClick={save}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm active:scale-[0.98] transition-transform">
            Crear Objetivo
          </button>
        </div>
      </div>
    </div>
  );
}
