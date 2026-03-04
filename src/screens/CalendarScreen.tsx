import { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { calcBenefit } from "@/types/models";

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1; // Monday first
}

const WEEKDAYS = ["L", "M", "X", "J", "V", "S", "D"];
const MONTHS = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

export default function CalendarScreen() {
  const { bets, tasks } = useApp();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string>(today.toISOString().slice(0, 10));

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfWeek(year, month);

  // Dates with events
  const eventDates = useMemo(() => {
    const dates = new Set<string>();
    bets.forEach(b => dates.add(b.fecha));
    tasks.forEach(t => dates.add(t.fechaLimite));
    return dates;
  }, [bets, tasks]);

  const selectedBets = bets.filter(b => b.fecha === selectedDate);
  const selectedTasks = tasks.filter(t => t.fechaLimite === selectedDate);

  const prev = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const next = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const todayStr = today.toISOString().slice(0, 10);

  return (
    <div className="pb-4">
      <div className="px-4 pt-2 pb-3">
        <h1 className="text-2xl font-bold text-foreground">Calendario</h1>
      </div>

      {/* Calendar */}
      <div className="px-4 mb-4">
        <div className="ios-card p-4">
          <div className="flex items-center justify-between mb-3">
            <button onClick={prev} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <ChevronLeft className="w-4 h-4 text-foreground" />
            </button>
            <span className="text-sm font-semibold text-foreground">{MONTHS[month]} {year}</span>
            <button onClick={next} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <ChevronRight className="w-4 h-4 text-foreground" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-0">
            {WEEKDAYS.map(d => (
              <div key={d} className="text-center text-[10px] text-muted-foreground font-medium py-1">{d}</div>
            ))}
            {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const isSelected = dateStr === selectedDate;
              const isToday = dateStr === todayStr;
              const hasEvent = eventDates.has(dateStr);

              return (
                <button key={day} onClick={() => setSelectedDate(dateStr)}
                  className="flex flex-col items-center py-1.5">
                  <span className={`w-8 h-8 flex items-center justify-center rounded-full text-sm transition-colors ${
                    isSelected ? "bg-primary text-primary-foreground font-bold" :
                    isToday ? "bg-primary/10 text-primary font-semibold" :
                    "text-foreground"
                  }`}>
                    {day}
                  </span>
                  {hasEvent && <div className={`w-1 h-1 rounded-full mt-0.5 ${isSelected ? "bg-primary-foreground" : "bg-primary"}`} />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Day agenda */}
      <div className="px-4">
        <p className="text-xs text-muted-foreground mb-2 font-medium">
          {new Date(selectedDate + "T00:00:00").toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}
        </p>

        {selectedBets.length === 0 && selectedTasks.length === 0 && (
          <div className="ios-card p-6 text-center">
            <p className="text-sm text-muted-foreground">Sin eventos este día</p>
          </div>
        )}

        <div className="space-y-2">
          {selectedBets.map(bet => (
            <div key={bet.id} className="ios-card p-3 flex items-center gap-3">
              <div className={`w-2 h-8 rounded-full ${
                bet.resultado === "Ganada" ? "bg-success" : bet.resultado === "Perdida" ? "bg-destructive" : "bg-pending"
              }`} />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">🏟 Apuesta</p>
                <p className="text-sm font-medium text-foreground truncate">{bet.partido}</p>
              </div>
              <span className="text-xs font-medium text-muted-foreground">@{bet.cuota.toFixed(2)}</span>
            </div>
          ))}
          {selectedTasks.map(task => (
            <div key={task.id} className="ios-card p-3 flex items-center gap-3">
              <div className={`w-2 h-8 rounded-full ${
                task.prioridad === "Alta" ? "bg-destructive" : task.prioridad === "Media" ? "bg-warning" : "bg-pending"
              }`} />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">📋 Tarea</p>
                <p className={`text-sm font-medium ${task.estado === "Hecho" ? "text-muted-foreground line-through" : "text-foreground"}`}>{task.tarea}</p>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                task.estado === "Hecho" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
              }`}>{task.estado}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
