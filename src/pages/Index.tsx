import { useState } from "react";
import { BarChart3, CheckSquare, Calendar, Target } from "lucide-react";
import BetsScreen from "@/screens/BetsScreen";
import TasksScreen from "@/screens/TasksScreen";
import CalendarScreen from "@/screens/CalendarScreen";
import GoalsScreen from "@/screens/GoalsScreen";
import { AppProvider } from "@/context/AppContext";

const TABS = [
  { id: "bets", label: "Apuestas", icon: BarChart3 },
  { id: "tasks", label: "Tareas", icon: CheckSquare },
  { id: "calendar", label: "Calendario", icon: Calendar },
  { id: "goals", label: "Objetivos", icon: Target },
] as const;

type TabId = typeof TABS[number]["id"];

function AppShell() {
  const [tab, setTab] = useState<TabId>("bets");

  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto relative">
      <div className="fixed top-2 left-1/2 -translate-x-1/2 z-[100] px-4 py-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full shadow-lg pointer-events-none">
        VERSIÓN V2.1 - CARGADA
      </div>
      <div className="pb-16 overflow-y-auto" style={{ minHeight: "100dvh" }}>
        {tab === "bets" && <BetsScreen />}
        {tab === "tasks" && <TasksScreen />}
        {tab === "calendar" && <CalendarScreen />}
        {tab === "goals" && <GoalsScreen />}
      </div>

      {/* Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border safe-bottom z-40">
        <div className="max-w-lg mx-auto flex">
          {TABS.map(t => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className="flex-1 flex flex-col items-center py-2 gap-0.5 transition-colors">
                <Icon className={`w-5 h-5 ${active ? "text-primary" : "text-muted-foreground"}`} />
                <span className={`text-[10px] font-medium ${active ? "text-primary" : "text-muted-foreground"}`}>{t.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

const Index = () => (
  <AppProvider>
    <AppShell />
  </AppProvider>
);

export default Index;
