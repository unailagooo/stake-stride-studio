import { useState } from "react";
import { motion } from "framer-motion";
import { useApp } from "@/context/AppContext";
import { BetFolder, calcBenefit, getCombinedCuota, getCombinedResult } from "@/types/models";
import { Plus, Folder, Trash2, TrendingUp, Target, BarChart3, Percent, ChevronRight, X, ToggleLeft, ToggleRight } from "lucide-react";
import BetsFolderScreen from "@/screens/BetsFolderScreen";
import { SwipeableItem } from "@/components/SwipeableItem";

export default function BetsScreen() {
  const { bets, folders, addFolder, deleteFolder } = useApp();
  const [openFolder, setOpenFolder] = useState<BetFolder | null>(null);
  const [showNewFolder, setShowNewFolder] = useState(false);

  if (openFolder) {
    return <BetsFolderScreen folder={openFolder} onBack={() => setOpenFolder(null)} />;
  }

  // General metrics (all folders with stake)
  const stakeFolderIds = folders.filter(f => f.hasStake).map(f => f.id);
  const stakeBets = bets.filter(b => stakeFolderIds.includes(b.folderId));
  const resolved = stakeBets.filter(b => {
    const r = b.type === "combined" ? getCombinedResult(b) : b.resultado;
    return r !== "Pendiente" && r !== "Nula";
  });
  const totalStake = resolved.reduce((s, b) => s + (b.stake || 0), 0);
  const totalBenefit = stakeBets.reduce((s, b) => s + calcBenefit(b), 0);
  const avgCuota = stakeBets.length > 0
    ? stakeBets.reduce((s, b) => s + (b.type === "combined" ? getCombinedCuota(b) : (b.cuota || 0)), 0) / stakeBets.length
    : 0;
  const roi = totalStake > 0 ? (totalBenefit / totalStake) * 100 : 0;
  const wins = stakeBets.filter(b => (b.type === "combined" ? getCombinedResult(b) : b.resultado) === "Ganada").length;
  const losses = stakeBets.filter(b => (b.type === "combined" ? getCombinedResult(b) : b.resultado) === "Perdida").length;
  const winRate = (wins + losses) > 0 ? (wins / (wins + losses)) * 100 : 0;

  return (
    <div className="pb-4">
      <div className="px-4 pt-2 pb-3 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Apuestas</h1>
        <button onClick={() => setShowNewFolder(true)} className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
          <Plus className="w-4 h-4 text-primary-foreground" />
        </button>
      </div>

      {/* General Dashboard */}
      <div className="px-4 mb-4">
        <div className="ios-card p-4">
          <p className="text-xs text-muted-foreground font-medium mb-3">Métricas Generales</p>
          <div className="grid grid-cols-2 gap-3">
            <MetricItem icon={TrendingUp} label="Beneficio" value={`${(totalBenefit || 0) >= 0 ? '+' : ''}${(totalBenefit || 0).toFixed(2)}€`} positive={(totalBenefit || 0) >= 0} />
            <MetricItem icon={Percent} label="ROI" value={`${(roi || 0).toFixed(1)}%`} positive={(roi || 0) >= 0} />
            <MetricItem icon={BarChart3} label="Cuota Media" value={(avgCuota || 0).toFixed(2)} />
            <MetricItem icon={Target} label="Win Rate" value={`${(winRate || 0).toFixed(0)}%`} />
          </div>
        </div>
      </div>

      {/* Folders */}
      <div className="px-4 space-y-2">
        {folders.map(folder => {
          const folderBets = bets.filter(b => b.folderId === folder.id);
          const folderBenefit = folderBets.reduce((s, b) => s + calcBenefit(b), 0);
          const pending = folderBets.filter(b => (b.type === "combined" ? getCombinedResult(b) : b.resultado) === "Pendiente").length;

          return (
            <SwipeableItem key={folder.id} onDelete={() => deleteFolder(folder.id)}>
              <button onClick={() => setOpenFolder(folder)}
                className="ios-card p-4 w-full text-left flex items-center gap-3 active:scale-[0.98] transition-transform">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${folder.hasStake ? 'bg-primary/10' : 'bg-muted'}`}>
                  <Folder className={`w-5 h-5 ${folder.hasStake ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{folder.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {folderBets.length} apuestas{pending > 0 ? ` · ${pending} pendientes` : ''}
                    {!folder.hasStake && ' · Sin stake'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {folder.hasStake && folderBets.length > 0 && (
                    <span className={`text-xs font-semibold ${folderBenefit >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {folderBenefit >= 0 ? '+' : ''}{folderBenefit.toFixed(2)}€
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </button>
            </SwipeableItem>
          );
        })}

        {folders.length === 0 && (
          <div className="ios-card p-8 text-center">
            <p className="text-muted-foreground text-sm">No hay carpetas. Crea una para empezar.</p>
          </div>
        )}
      </div>

      {showNewFolder && <NewFolderModal onClose={() => setShowNewFolder(false)} />}
    </div>
  );
}

function MetricItem({ icon: Icon, label, value, positive }: { icon: any; label: string; value: string; positive?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p>
        <p className={`text-base font-bold ${positive === undefined ? 'text-foreground' : positive ? 'text-success' : 'text-destructive'}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

function NewFolderModal({ onClose }: { onClose: () => void }) {
  const { addFolder } = useApp();
  const [name, setName] = useState("");
  const [hasStake, setHasStake] = useState(true);

  const save = () => {
    if (!name.trim()) return;
    addFolder({ id: crypto.randomUUID(), name: name.trim(), hasStake });
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
        className="bg-card w-full max-w-lg rounded-t-2xl p-5 pb-12 animate-slide-up safe-bottom" onClick={e => e.stopPropagation()}>
        <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mb-4 opacity-40 shrink-0" />
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground">Nueva Carpeta</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        <div className="space-y-3">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Nombre de la carpeta"
            className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" autoFocus />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Controlar stake</p>
              <p className="text-xs text-muted-foreground">Desactiva para carpetas como "Descartadas"</p>
            </div>
            <button onClick={() => setHasStake(!hasStake)} className="text-primary">
              {hasStake ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8 text-muted-foreground" />}
            </button>
          </div>
          <button onClick={save}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm active:scale-[0.98] transition-transform">
            Crear Carpeta
          </button>
        </div>
      </motion.div>
    </div>
  );
}
