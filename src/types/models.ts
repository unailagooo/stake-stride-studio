export type BetResult = "Pendiente" | "Ganada" | "Perdida" | "Nula";
export type TaskPriority = "Alta" | "Media" | "Baja";
export type TaskStatus = "Pendiente" | "Hecho";
export type GoalTerm = "Corto" | "Medio" | "Largo";

export interface BetFolder {
  id: string;
  name: string;
  hasStake: boolean; // false for folders like "Descartadas" (no stake tracking)
}

export interface BetLeg {
  id: string;
  partido: string;
  pronostico: string;
  cuota: number;
  resultado: BetResult;
}

export interface Bet {
  id: string;
  folderId: string;
  type: "simple" | "combined";
  fecha: string; // ISO date string
  hora?: string; // Optional time string "HH:mm"
  // Simple bet fields
  partido: string;
  pronostico: string;
  cuota: number;
  // Combined bet fields
  legs?: BetLeg[];
  // Common
  stake: number;
  resultado: BetResult;
}

export type RecurrenceType = "Ninguna" | "Diaria" | "Semanal" | "Mensual" | "Personalizada";

export interface TaskRecurrence {
  type: RecurrenceType;
  days?: number[]; // 0-6 (Sunday-Saturday) for weekly custom
}

export interface Subtask {
  id: string;
  texto: string;
  completada: boolean;
}

export interface Task {
  id: string;
  tarea: string;
  estado: TaskStatus;
  prioridad: TaskPriority;
  fechaLimite?: string; // Optional
  hora?: string; // Optional
  recurrencia?: TaskRecurrence;
  categoria?: string; // Icon or name
  subtareas?: Subtask[];
}

export interface Milestone {
  id: string;
  texto: string;
  completado: boolean;
}

export interface Goal {
  id: string;
  objetivo: string;
  plazo: GoalTerm;
  motivacion: string;
  progreso: number;
  fechaObjetivo?: string; // ISO date for countdown
  hitos?: Milestone[];
}

// For combined bets, cuota = product of all leg cuotas
export function getCombinedCuota(bet: Bet): number {
  if (bet.type === "simple") return bet.cuota || 0;
  // If we have a stored cuota and it's not 0, and we either have no legs or the user manually edited it
  // Actually, the simplest way to allow override is to check if bet.cuota is set and use it.
  // We'll update getCombinedCuota to return the stored bet.cuota if it's > 0, 
  // falling back to calculation only if bet.cuota is 0/undefined.
  if (bet.cuota && bet.cuota > 0) return bet.cuota;
  if (!bet?.legs || bet.legs.length === 0) return 0;
  return bet.legs.reduce((acc, leg) => acc * (leg.cuota || 0), 1);
}

// Result for combined: all won=Ganada, any lost=Perdida, else Pendiente/Nula
export function getCombinedResult(bet: Bet): BetResult {
  if (bet.type === "simple") return bet.resultado || "Pendiente";
  if (!bet?.legs || bet.legs.length === 0) return bet.resultado || "Pendiente";
  if (bet.legs.some(l => l && l.resultado === "Perdida")) return "Perdida";
  if (bet.legs.every(l => l && l.resultado === "Ganada")) return "Ganada";
  if (bet.legs.every(l => l && l.resultado === "Nula")) return "Nula";
  return "Pendiente";
}

export function calcBenefit(bet: Bet): number {
  if (!bet) return 0;
  const resultado = bet.type === "combined" ? getCombinedResult(bet) : bet.resultado;
  const cuota = bet.type === "combined" ? getCombinedCuota(bet) : bet.cuota;
  const stake = bet.stake || 0;

  switch (resultado) {
    case "Ganada": return (cuota * stake) - stake;
    case "Perdida": return -stake;
    default: return 0;
  }
}

// Keep BetCategory for backwards compat but it's no longer primary
export type BetCategory = "Canal Telegram" | "Personal" | "En Observación";

export const DEFAULT_FOLDERS: BetFolder[] = [
  { id: "telegram", name: "Canal Telegram", hasStake: true },
  { id: "personal", name: "Personal", hasStake: true },
  { id: "observacion", name: "En Observación", hasStake: true },
];
