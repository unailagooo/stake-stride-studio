export type BetCategory = "Canal Telegram" | "Personal" | "En Observación";
export type BetResult = "Pendiente" | "Ganada" | "Perdida" | "Nula";
export type TaskPriority = "Alta" | "Media" | "Baja";
export type TaskStatus = "Pendiente" | "Hecho";
export type GoalTerm = "Corto" | "Medio" | "Largo";

export interface Bet {
  id: string;
  fecha: string; // ISO date string
  partido: string;
  pronostico: string;
  cuota: number;
  stake: number;
  categoria: BetCategory;
  resultado: BetResult;
}

export interface Task {
  id: string;
  tarea: string;
  estado: TaskStatus;
  prioridad: TaskPriority;
  fechaLimite: string; // ISO date string
}

export interface Goal {
  id: string;
  objetivo: string;
  plazo: GoalTerm;
  motivacion: string;
  progreso: number; // 0-100
}

export function calcBenefit(bet: Bet): number {
  switch (bet.resultado) {
    case "Ganada": return (bet.cuota * bet.stake) - bet.stake;
    case "Perdida": return -bet.stake;
    default: return 0;
  }
}
