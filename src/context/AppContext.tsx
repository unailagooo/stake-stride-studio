import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Bet, Task, Goal, BetFolder, DEFAULT_FOLDERS } from "@/types/models";

interface AppState {
  bets: Bet[];
  tasks: Task[];
  goals: Goal[];
  folders: BetFolder[];
  addBet: (bet: Bet) => void;
  updateBet: (bet: Bet) => void;
  deleteBet: (id: string) => void;
  addTask: (task: Task) => void;
  updateTask: (task: Task) => void;
  deleteTask: (id: string) => void;
  addGoal: (goal: Goal) => void;
  updateGoal: (goal: Goal) => void;
  deleteGoal: (id: string) => void;
  addFolder: (folder: BetFolder) => void;
  deleteFolder: (id: string) => void;
  updateFolder: (folder: BetFolder) => void;
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
  const [folders, setFolders] = useState<BetFolder[]>(() => load<BetFolder>("tt_folders", DEFAULT_FOLDERS));

  useEffect(() => { localStorage.setItem("tt_bets", JSON.stringify(bets)); }, [bets]);
  useEffect(() => { localStorage.setItem("tt_tasks", JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem("tt_goals", JSON.stringify(goals)); }, [goals]);
  useEffect(() => { localStorage.setItem("tt_folders", JSON.stringify(folders)); }, [folders]);

  const addBet = useCallback((b: Bet) => setBets(p => [b, ...p]), []);
  const updateBet = useCallback((b: Bet) => setBets(p => p.map(x => x.id === b.id ? b : x)), []);
  const deleteBet = useCallback((id: string) => setBets(p => p.filter(x => x.id !== id)), []);
  const addTask = useCallback((t: Task) => setTasks(p => [t, ...p]), []);
  const updateTask = useCallback((t: Task) => setTasks(p => p.map(x => x.id === t.id ? t : x)), []);
  const deleteTask = useCallback((id: string) => setTasks(p => p.filter(x => x.id !== id)), []);
  const addGoal = useCallback((g: Goal) => setGoals(p => [g, ...p]), []);
  const updateGoal = useCallback((g: Goal) => setGoals(p => p.map(x => x.id === g.id ? g : x)), []);
  const deleteGoal = useCallback((id: string) => setGoals(p => p.filter(x => x.id !== id)), []);
  const addFolder = useCallback((f: BetFolder) => setFolders(p => [...p, f]), []);
  const deleteFolder = useCallback((id: string) => {
    setFolders(p => p.filter(x => x.id !== id));
    setBets(p => p.filter(x => x.folderId !== id));
  }, []);
  const updateFolder = useCallback((f: BetFolder) => setFolders(p => p.map(x => x.id === f.id ? f : x)), []);

  return (
    <AppContext.Provider value={{ bets, tasks, goals, folders, addBet, updateBet, deleteBet, addTask, updateTask, deleteTask, addGoal, updateGoal, deleteGoal, addFolder, deleteFolder, updateFolder }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
