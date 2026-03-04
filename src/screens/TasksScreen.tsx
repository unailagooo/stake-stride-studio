import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Task, TaskPriority } from "@/types/models";
import { Plus, X, Trash2, Circle, CheckCircle2 } from "lucide-react";

const PRIORITY_STYLES: Record<TaskPriority, string> = {
  Alta: "bg-destructive/10 text-destructive",
  Media: "bg-warning/10 text-warning-foreground",
  Baja: "bg-muted text-muted-foreground",
};

const PRIORITY_DOT: Record<TaskPriority, string> = {
  Alta: "bg-destructive",
  Media: "bg-warning",
  Baja: "bg-pending",
};

export default function TasksScreen() {
  const { tasks, addTask, updateTask, deleteTask } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [nombre, setNombre] = useState("");
  const [prioridad, setPrioridad] = useState<TaskPriority>("Media");
  const [fechaLimite, setFechaLimite] = useState(new Date().toISOString().slice(0, 10));

  const pending = tasks.filter(t => t.estado === "Pendiente").sort((a, b) => {
    const order: Record<TaskPriority, number> = { Alta: 0, Media: 1, Baja: 2 };
    return order[a.prioridad] - order[b.prioridad];
  });
  const done = tasks.filter(t => t.estado === "Hecho");

  const toggle = (task: Task) => {
    updateTask({ ...task, estado: task.estado === "Pendiente" ? "Hecho" : "Pendiente" });
  };

  const saveTask = () => {
    if (!nombre.trim()) return;
    addTask({ id: crypto.randomUUID(), tarea: nombre.trim(), estado: "Pendiente", prioridad, fechaLimite });
    setNombre(""); setShowForm(false);
  };

  return (
    <div className="pb-4">
      <div className="px-4 pt-2 pb-3 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Tareas</h1>
        <button onClick={() => setShowForm(true)} className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
          <Plus className="w-4 h-4 text-primary-foreground" />
        </button>
      </div>

      <div className="px-4 space-y-2">
        {pending.length === 0 && done.length === 0 && (
          <div className="ios-card p-8 text-center">
            <p className="text-muted-foreground text-sm">No hay tareas</p>
          </div>
        )}

        {pending.map(task => (
          <div key={task.id} className="ios-card p-3 flex items-center gap-3">
            <button onClick={() => toggle(task)} className="flex-shrink-0">
              <Circle className="w-5 h-5 text-muted-foreground" />
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{task.tarea}</p>
              <p className="text-[10px] text-muted-foreground">
                {new Date(task.fechaLimite).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${PRIORITY_DOT[task.prioridad]}`} />
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${PRIORITY_STYLES[task.prioridad]}`}>
                {task.prioridad}
              </span>
            </div>
            <button onClick={() => deleteTask(task.id)} className="flex-shrink-0 opacity-40">
              <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </div>
        ))}

        {done.length > 0 && (
          <>
            <p className="text-xs text-muted-foreground pt-3 pb-1 font-medium">Completadas ({done.length})</p>
            {done.map(task => (
              <div key={task.id} className="ios-card p-3 flex items-center gap-3 opacity-60">
                <button onClick={() => toggle(task)} className="flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                </button>
                <p className="text-sm text-muted-foreground line-through flex-1">{task.tarea}</p>
                <button onClick={() => deleteTask(task.id)} className="flex-shrink-0 opacity-40">
                  <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Quick add form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/30 animate-fade-in" onClick={() => setShowForm(false)}>
          <div className="bg-card w-full max-w-lg rounded-t-2xl p-5 pb-12 animate-slide-up safe-bottom" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground">Nueva Tarea</h2>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <div className="space-y-3">
              <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="¿Qué necesitas hacer?"
                className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                autoFocus />
              <div className="flex gap-2">
                <input type="date" value={fechaLimite} onChange={e => setFechaLimite(e.target.value)}
                  className="flex-1 px-3 py-2.5 rounded-lg bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Prioridad</label>
                <div className="flex gap-2">
                  {(["Alta", "Media", "Baja"] as TaskPriority[]).map(p => (
                    <button key={p} onClick={() => setPrioridad(p)}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${prioridad === p ? "bg-primary text-primary-foreground" : "bg-background border border-border text-muted-foreground"
                        }`}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={saveTask}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm active:scale-[0.98] transition-transform">
                Añadir Tarea
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
