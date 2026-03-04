import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Bet, Task, Goal } from "@/types/models";

interface AppState {
  bets: Bet[];
  tasks: Task[];
  goals: Goal[];
  addBet: (bet: Bet) => void;
  updateBet: (bet: Bet) => void;
  deleteBet: (id: string) => void;
  addTask: (task: Task) => void;
  updateTask: (task: Task) => void;
  deleteTask: (id: string) => void;
  addGoal: (goal: Goal) => void;
  updateGoal: (goal: Goal) => void;
  deleteGoal: (id: string) => void;
}

const AppContext = createContext<AppState | null>(null);

function load<T>(key: string, fallback: T[]): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [bets, setBets] = useState<Bet[]>(() => load<Bet>("tt_bets", []));
  const [tasks, setTasks] = useState<Task[]>(() => load<Task>("tt_tasks", []));
  const [goals, setGoals] = useState<Goal[]>(() => load<Goal>("tt_goals", []));

  useEffect(() => { localStorage.setItem("tt_bets", JSON.stringify(bets)); }, [bets]);
  useEffect(() => { localStorage.setItem("tt_tasks", JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem("tt_goals", JSON.stringify(goals)); }, [goals]);

  const addBet = useCallback((b: Bet) => setBets(p => [b, ...p]), []);
  const updateBet = useCallback((b: Bet) => setBets(p => p.map(x => x.id === b.id ? b : x)), []);
  const deleteBet = useCallback((id: string) => setBets(p => p.filter(x => x.id !== id)), []);
  const addTask = useCallback((t: Task) => setTasks(p => [t, ...p]), []);
  const updateTask = useCallback((t: Task) => setTasks(p => p.map(x => x.id === t.id ? t : x)), []);
  const deleteTask = useCallback((id: string) => setTasks(p => p.filter(x => x.id !== id)), []);
  const addGoal = useCallback((g: Goal) => setGoals(p => [g, ...p]), []);
  const updateGoal = useCallback((g: Goal) => setGoals(p => p.map(x => x.id === g.id ? g : x)), []);
  const deleteGoal = useCallback((id: string) => setGoals(p => p.filter(x => x.id !== id)), []);

  return (
    <AppContext.Provider value={{ bets, tasks, goals, addBet, updateBet, deleteBet, addTask, updateTask, deleteTask, addGoal, updateGoal, deleteGoal }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
