import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Task, TaskPriority, Subtask, TaskRecurrence } from "@/types/models";
import { Plus, X, Trash2, Circle, CheckCircle2, ListTodo, Repeat } from "lucide-react";

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

const RECURRENCE_TYPES = ["Ninguna", "Diaria", "Semanal", "Mensual", "Personalizada"] as const;

export default function TasksScreen() {
  const { tasks, addTask, updateTask, deleteTask, taskCategories, addTaskCategory, deleteTaskCategory } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [nombre, setNombre] = useState("");
  const [prioridad, setPrioridad] = useState<TaskPriority>("Media");
  const [fechaLimite, setFechaLimite] = useState<string | undefined>(new Date().toISOString().slice(0, 10));
  const [hora, setHora] = useState<string>("");
  const [categoria, setCategoria] = useState("Gestión");
  const [recurrencia, setRecurrencia] = useState<TaskRecurrence>({ type: "Ninguna" });
  const [tempSubtask, setTempSubtask] = useState("");
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);

  const [filterCat, setFilterCat] = useState<string>("Todas");
  const [sortBy, setSortBy] = useState<"Fecha" | "Prioridad" | "Nombre">("Prioridad");

  const [showCatManager, setShowCatManager] = useState(false);
  const [newCatName, setNewCatName] = useState("");

  const toggle = (task: Task) => {
    if (task.estado === "Pendiente") {
      if (task.recurrencia && task.recurrencia.type !== "Ninguna") {
        const current = task.fechaLimite ? new Date(task.fechaLimite) : new Date();

        if (task.recurrencia.type === "Diaria") {
          current.setDate(current.getDate() + 1);
        } else if (task.recurrencia.type === "Semanal") {
          current.setDate(current.getDate() + 7);
        } else if (task.recurrencia.type === "Mensual") {
          current.setMonth(current.getMonth() + 1);
        } else if (task.recurrencia.type === "Personalizada" && task.recurrencia.days && task.recurrencia.days.length > 0) {
          const today = current.getDay();
          const sortedDays = [...task.recurrencia.days].sort((a, b) => a - b);
          let nextDay = sortedDays.find(d => d > today);
          if (nextDay === undefined) nextDay = sortedDays[0];

          const diff = nextDay > today ? nextDay - today : 7 - today + nextDay;
          current.setDate(current.getDate() + (diff === 0 ? 7 : diff));
        } else {
          // If custom but no days selected, just mark as done
          updateTask({ ...task, estado: "Hecho" });
          return;
        }

        updateTask({
          ...task,
          fechaLimite: current.toISOString().slice(0, 10),
          estado: "Pendiente"
        });
      } else {
        updateTask({ ...task, estado: "Hecho" });
      }
    } else {
      updateTask({ ...task, estado: "Pendiente" });
    }
  };

  const toggleSubtask = (task: Task, subId: string) => {
    const newSubs = task.subtareas?.map(s => s.id === subId ? { ...s, completada: !s.completada } : s);
    updateTask({ ...task, subtareas: newSubs });
  };

  const saveTask = () => {
    if (!nombre.trim()) return;
    addTask({
      id: crypto.randomUUID(),
      tarea: nombre.trim(),
      estado: "Pendiente",
      prioridad,
      fechaLimite,
      hora: hora || undefined,
      categoria,
      recurrencia,
      subtareas: subtasks
    });
    setNombre(""); setSubtasks([]); setRecurrencia({ type: "Ninguna" }); setHora(""); setShowForm(false);
  };

  const addSubtask = () => {
    if (!tempSubtask.trim()) return;
    setSubtasks([...subtasks, { id: crypto.randomUUID(), texto: tempSubtask.trim(), completada: false }]);
    setTempSubtask("");
  };

  const filteredTasks = tasks.filter(t => filterCat === "Todas" || t.categoria === filterCat);
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === "Nombre") return a.tarea.localeCompare(b.tarea);
    if (sortBy === "Prioridad") {
      const order: Record<TaskPriority, number> = { Alta: 0, Media: 1, Baja: 2 };
      return order[a.prioridad] - order[b.prioridad];
    }
    if (sortBy === "Fecha") {
      const dateA = a.fechaLimite ? new Date(a.fechaLimite).getTime() : Infinity;
      const dateB = b.fechaLimite ? new Date(b.fechaLimite).getTime() : Infinity;
      return dateA - dateB;
    }
    return 0;
  });

  const pendingTasks = sortedTasks.filter(t => t.estado === "Pendiente");
  const doneTasks = sortedTasks.filter(t => t.estado === "Hecho");

  return (
    <div className="pb-20 no-scrollbar">
      <div className="px-4 pt-2 pb-3 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Tareas</h1>
        <button onClick={() => setShowForm(true)} className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
          <Plus className="w-4 h-4 text-primary-foreground" />
        </button>
      </div>

      <div className="px-4 mb-4 flex gap-2 overflow-x-auto no-scrollbar py-1">
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
          className="px-3 py-1.5 rounded-full bg-muted text-[11px] font-bold text-muted-foreground outline-none border-none ring-1 ring-border whitespace-nowrap">
          <option value="Todas">Todas las categorías</option>
          {taskCategories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value as any)}
          className="px-3 py-1.5 rounded-full bg-muted text-[11px] font-bold text-muted-foreground outline-none border-none ring-1 ring-border">
          <option value="Prioridad">Prioridad</option>
          <option value="Fecha">Fecha</option>
          <option value="Nombre">Nombre</option>
        </select>
      </div>

      <div className="px-4 space-y-2">
        {pendingTasks.length === 0 && doneTasks.length === 0 && (
          <div className="ios-card p-8 text-center">
            <p className="text-muted-foreground text-sm">No hay tareas</p>
          </div>
        )}

        {pendingTasks.map(task => {
          const doneSubs = task.subtareas?.filter(s => s.completada).length || 0;
          const totalSubs = task.subtareas?.length || 0;
          const hasDate = !!task.fechaLimite;

          return (
            <div key={task.id} className="ios-card p-3 space-y-3">
              <div className="flex items-center gap-3">
                <button onClick={() => toggle(task)} className="flex-shrink-0">
                  <Circle className="w-5 h-5 text-muted-foreground" />
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <ListTodo className="w-3 h-3 text-primary-foreground/40" />
                    <p className="text-sm font-medium text-foreground truncate">{task.tarea}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-primary/70">{task.categoria}</span>
                    {hasDate && (
                      <p className={`text-[10px] font-medium ${task.fechaLimite && new Date(task.fechaLimite).getTime() < new Date().setHours(0, 0, 0, 0) ? 'text-destructive' : 'text-muted-foreground'}`}>
                        {new Date(task.fechaLimite!).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                        {task.hora && ` • ${task.hora}`}
                      </p>
                    )}
                    {task.recurrencia && task.recurrencia.type !== "Ninguna" && (
                      <div className="flex items-center gap-1 text-[10px] text-primary font-medium">
                        <Repeat className="w-2.5 h-2.5" />
                        {task.recurrencia.type === "Personalizada" ? "Pers." : task.recurrencia.type}
                      </div>
                    )}
                  </div>
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

              {totalSubs > 0 && (
                <div className="pl-8 space-y-1.5">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Subtareas ({doneSubs}/{totalSubs})</p>
                    <div className="w-20 h-1 bg-muted rounded-full">
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(doneSubs / totalSubs) * 100}%` }} />
                    </div>
                  </div>
                  {task.subtareas?.map(sub => (
                    <div key={sub.id} className="flex items-center gap-2 cursor-pointer" onClick={() => toggleSubtask(task, sub.id)}>
                      {sub.completada ? <CheckCircle2 className="w-3.5 h-3.5 text-success" /> : <Circle className="w-3.5 h-3.5 text-muted-foreground/40" />}
                      <span className={`text-xs ${sub.completada ? 'text-muted-foreground line-through' : 'text-foreground'}`}>{sub.texto}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {doneTasks.length > 0 && (
          <>
            <p className="text-xs text-muted-foreground pt-3 pb-1 font-medium">Completadas ({doneTasks.length})</p>
            {doneTasks.map(task => (
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

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/30 animate-fade-in" onClick={() => setShowForm(false)}>
          <div className="bg-card w-full max-w-lg rounded-t-2xl p-5 pb-10 animate-slide-up safe-bottom shadow-[0_-8px_30px_rgb(0,0,0,0.12)]" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground">Nueva Tarea</h2>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto no-scrollbar p-1">
              <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="¿Qué necesitas hacer?"
                className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                autoFocus />

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-xs text-muted-foreground block font-medium">Fecha {fechaLimite ? "" : "(Opcional)"}</label>
                    {fechaLimite && <button onClick={() => setFechaLimite(undefined)} className="text-[10px] text-destructive font-bold">Quitar</button>}
                  </div>
                  <input type="date" value={fechaLimite || ""} onChange={e => setFechaLimite(e.target.value || undefined)}
                    className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground block font-medium">Hora (Opcional)</label>
                  <input type="time" value={hora} onChange={e => setHora(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1 block font-medium">Recurrencia</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {RECURRENCE_TYPES.map(opt => (
                    <button key={opt} onClick={() => setRecurrencia({ type: opt, days: opt === "Personalizada" ? [] : undefined })}
                      className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all ${recurrencia.type === opt ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
                      {opt}
                    </button>
                  ))}
                </div>

                {recurrencia.type === "Personalizada" && (
                  <div className="flex justify-between items-center p-2 rounded-xl bg-muted/30 border border-border/50 animate-fade-in">
                    {["D", "L", "M", "Mi", "J", "V", "S"].map((day, idx) => {
                      const isSelected = recurrencia.days?.includes(idx);
                      return (
                        <button key={day}
                          onClick={() => {
                            const newDays = isSelected
                              ? recurrencia.days?.filter(d => d !== idx)
                              : [...(recurrencia.days || []), idx];
                            setRecurrencia({ ...recurrencia, days: newDays });
                          }}
                          className={`w-8 h-8 rounded-full text-[10px] font-bold flex items-center justify-center transition-all ${isSelected ? "bg-primary text-primary-foreground scale-110 shadow-md" : "bg-background border border-border text-muted-foreground hover:border-primary/50"}`}>
                          {day}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs text-muted-foreground block font-medium">Categoría</label>
                  <button onClick={() => setShowCatManager(true)} className="text-[10px] text-primary font-bold">Gestionar</button>
                </div>
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                  {taskCategories.map(cat => (
                    <button key={cat} onClick={() => setCategoria(cat)}
                      className={`px-3 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${categoria === cat ? "bg-primary text-primary-foreground shadow-sm" : "bg-background border border-border text-muted-foreground hover:border-primary/50"}`}>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1 block font-medium">Prioridad</label>
                <div className="flex gap-2">
                  {(["Alta", "Media", "Baja"] as TaskPriority[]).map(p => (
                    <button key={p} onClick={() => setPrioridad(p)}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${prioridad === p ? "bg-primary text-primary-foreground shadow-sm" : "bg-background border border-border text-muted-foreground hover:border-primary/50"}`}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1 block font-medium">Subtareas</label>
                <div className="flex gap-2 mb-2">
                  <input value={tempSubtask} onChange={e => setTempSubtask(e.target.value)} placeholder="Nueva subtarea..."
                    className="flex-1 px-3 py-2 rounded-lg bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    onKeyDown={e => e.key === 'Enter' && addSubtask()} />
                  <button onClick={addSubtask} className="px-4 py-2 rounded-lg bg-muted text-foreground text-xs font-bold hover:bg-muted/80 transition-colors">Añadir</button>
                </div>
                <div className="space-y-1.5 max-h-32 overflow-y-auto no-scrollbar">
                  {subtasks.map(sub => (
                    <div key={sub.id} className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 border border-border/5 animate-fade-in">
                      <span className="text-xs text-foreground font-medium">{sub.texto}</span>
                      <button onClick={() => setSubtasks(subtasks.filter(s => s.id !== sub.id))} className="text-destructive/70 hover:text-destructive">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <button onClick={saveTask}
                className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-sm mt-2 active:scale-[0.98] transition-all shadow-lg hover:shadow-primary/20">
                Crear Tarea
              </button>
            </div>
          </div>
        </div>
      )}

      {showCatManager && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-foreground/20 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setShowCatManager(false)}>
          <div className="bg-card w-full max-w-sm rounded-[2rem] p-6 shadow-2xl animate-scale-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-foreground text-lg">Gestionar Categorías</h3>
              <button onClick={() => setShowCatManager(false)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex gap-2 mb-5">
              <input value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="Nueva categoría..."
                className="flex-1 px-4 py-3 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                onKeyDown={e => e.key === 'Enter' && (newCatName.trim() && (addTaskCategory(newCatName.trim()), setNewCatName("")))} />
              <button
                onClick={() => { if (newCatName.trim()) { addTaskCategory(newCatName.trim()); setNewCatName(""); } }}
                className="w-12 h-12 bg-primary text-primary-foreground rounded-xl flex items-center justify-center shadow-lg active:scale-95 transition-transform"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto no-scrollbar">
              {taskCategories.map(cat => (
                <div key={cat} className="flex items-center justify-between px-4 py-3 rounded-2xl bg-muted/30 border border-border/50 group hover:border-primary/30 transition-colors">
                  <span className="text-sm font-semibold text-foreground/80">{cat}</span>
                  <button onClick={() => deleteTaskCategory(cat)} className="text-destructive/40 hover:text-destructive p-2 group-hover:opacity-100 transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
