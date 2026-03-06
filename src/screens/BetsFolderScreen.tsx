import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Bet, BetFolder, BetResult, calcBenefit, getCombinedCuota, getCombinedResult } from "@/types/models";
import { ArrowLeft, Plus, Trash2, TrendingUp, Target, BarChart3, Percent, Filter, ArrowUpDown, CheckSquare, Square, Copy, X as CloseIcon } from "lucide-react";
import { BetFormModal } from "@/components/BetFormModal";
import { motion } from "framer-motion";
import { SwipeableItem } from "@/components/SwipeableItem";

function resultBg(r: BetResult) {
  switch (r) {
    case "Ganada": return "bg-success/10 text-success";
    case "Perdida": return "bg-destructive/10 text-destructive";
    default: return "bg-muted text-muted-foreground";
  }
}

interface Props {
  folder: BetFolder;
  onBack: () => void;
}

export default function BetsFolderScreen({ folder, onBack }: Props) {
  const { bets, deleteBet, deleteFolder, duplicateBets } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editBet, setEditBet] = useState<Bet | null>(null);
  const [betType, setBetType] = useState<"simple" | "combined">("simple");
  const [showDelete, setShowDelete] = useState(false);
  const [filterResult, setFilterResult] = useState<BetResult | "Todas">("Todas");
  const [sortBy, setSortBy] = useState<"fecha" | "cuota" | "stake">("fecha");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Selection state
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showFolderSelector, setShowFolderSelector] = useState(false);

  const filteredBets = bets
    .filter(b => b.folderId === folder.id)
    .filter(b => {
      if (filterResult === "Todas") return true;
      const r = b.type === "combined" ? getCombinedResult(b) : b.resultado;
      return r === filterResult;
    })
    .sort((a, b) => {
      let valA, valB;
      if (sortBy === "fecha") {
        valA = new Date(`${a.fecha}T${a.hora || '00:00'}`).getTime();
        valB = new Date(`${b.fecha}T${b.hora || '00:00'}`).getTime();
      } else if (sortBy === "cuota") {
        valA = a.type === "combined" ? getCombinedCuota(a) : a.cuota;
        valB = b.type === "combined" ? getCombinedCuota(b) : b.cuota;
      } else {
        valA = a.stake || 0;
        valB = b.stake || 0;
      }
      return sortOrder === "asc" ? valA - valB : valB - valA;
    });

  const folderBets = bets.filter(b => b.folderId === folder.id);

  // Metrics
  const resolved = folderBets.filter(b => {
    const r = b.type === "combined" ? getCombinedResult(b) : b.resultado;
    return r !== "Pendiente" && r !== "Nula";
  });
  const totalStake = resolved.reduce((s, b) => s + b.stake, 0);
  const totalBenefit = folderBets.reduce((s, b) => s + calcBenefit(b), 0);
  const avgCuota = folderBets.length > 0
    ? folderBets.reduce((s, b) => s + (b.type === "combined" ? getCombinedCuota(b) : b.cuota), 0) / folderBets.length
    : 0;
  const roi = totalStake > 0 ? (totalBenefit / totalStake) * 100 : 0;
  const wins = folderBets.filter(b => (b.type === "combined" ? getCombinedResult(b) : b.resultado) === "Ganada").length;
  const losses = folderBets.filter(b => (b.type === "combined" ? getCombinedResult(b) : b.resultado) === "Perdida").length;
  const winRate = (wins + losses) > 0 ? (wins / (wins + losses)) * 100 : 0;

  const handleDelete = () => {
    deleteFolder(folder.id);
    onBack();
  };

  const openNewBet = (type: "simple" | "combined") => {
    setBetType(type);
    setEditBet(null);
    setShowForm(true);
  };

  return (
    <div className="pb-4">
      <div className="px-4 pt-2 pb-3 flex items-center gap-2">
        <button onClick={onBack} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
          <ArrowLeft className="w-4 h-4 text-foreground" />
        </button>
        <h1 className="text-xl font-bold text-foreground flex-1 truncate">{folder.name}</h1>
        <button onClick={() => { setIsSelectMode(!isSelectMode); setSelectedIds([]); }}
          className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-colors ${isSelectMode ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
          {isSelectMode ? "Cancelar" : "Seleccionar"}
        </button>
        {!isSelectMode && (
          <button onClick={() => setShowDelete(true)} className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
            <Trash2 className="w-4 h-4 text-destructive" />
          </button>
        )}
      </div>

      {/* Folder Metrics */}
      {folder.hasStake && folderBets.length > 0 && !isSelectMode && (
        <div className="px-4 mb-4">
          <div className="ios-card p-4">
            <div className="grid grid-cols-2 gap-3">
              <MetricItem icon={TrendingUp} label="Beneficio" value={`${totalBenefit >= 0 ? '+' : ''}${totalBenefit.toFixed(2)}€`} positive={totalBenefit >= 0} />
              <MetricItem icon={Percent} label="ROI" value={`${roi.toFixed(1)}%`} positive={roi >= 0} />
              <MetricItem icon={BarChart3} label="Cuota Media" value={avgCuota.toFixed(2)} />
              <MetricItem icon={Target} label="Win Rate" value={`${winRate.toFixed(0)}%`} />
            </div>
          </div>
        </div>
      )}

      {/* Filters & Sorting */}
      {!isSelectMode && (
        <div className="px-4 mb-4 space-y-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {(["Todas", "Pendiente", "Ganada", "Perdida", "Nula"] as const).map(res => (
              <button key={res} onClick={() => setFilterResult(res)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${filterResult === res ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}>
                {res}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground uppercase font-bold">Ordenar por</span>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-xs font-semibold text-foreground focus:outline-none">
                <option value="fecha">Fecha</option>
                <option value="cuota">Cuota</option>
                <option value="stake">Stake</option>
              </select>
            </div>
            <button onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="flex items-center gap-1 text-xs font-semibold text-primary">
              <ArrowUpDown className="w-3 h-3" />
              {sortOrder === "asc" ? "Ascendente" : "Descendente"}
            </button>
          </div>
        </div>
      )}

      {/* Bet list */}
      <motion.div
        className="px-4 space-y-2"
        drag="x"
        dragConstraints={{ left: 0, right: 100 }}
        dragElastic={0.2}
        onDragEnd={(_, info) => {
          if (info.offset.x > 80) onBack();
        }}
      >
        {filteredBets.length === 0 && (
          <div className="ios-card p-8 text-center">
            <p className="text-muted-foreground text-sm">
              {folderBets.length === 0 ? "No hay apuestas en esta carpeta" : "No hay apuestas con este filtro"}
            </p>
          </div>
        )}
        {filteredBets.map(bet => {
          const resultado = bet.type === "combined" ? getCombinedResult(bet) : bet.resultado;
          const cuota = bet.type === "combined" ? getCombinedCuota(bet) : bet.cuota;
          const benefit = calcBenefit(bet);
          const isSelected = selectedIds.includes(bet.id);
          const toggleSelect = () => {
            if (selectedIds.includes(bet.id)) setSelectedIds(selectedIds.filter(id => id !== bet.id));
            else setSelectedIds([...selectedIds, bet.id]);
          };

          const itemContent = (
            <div
              className={`ios-card p-3 flex items-center gap-3 active:scale-[0.98] transition-transform cursor-pointer border-2 ${isSelected ? 'border-primary' : 'border-transparent'}`}
              onClick={() => {
                if (isSelectMode) toggleSelect();
                else { setEditBet(bet); setBetType(bet.type); setShowForm(true); }
              }}>
              {isSelectMode ? (
                <div className="flex-shrink-0">
                  {isSelected ? <CheckSquare className="w-5 h-5 text-primary" /> : <Square className="w-5 h-5 text-muted-foreground" />}
                </div>
              ) : (
                <div className={`w-2 h-10 rounded-full flex-shrink-0 ${resultado === "Ganada" ? "bg-success" :
                  resultado === "Perdida" ? "bg-destructive" : "bg-pending"
                  }`} />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  {bet.type === "combined" && (
                    <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">COMBI</span>
                  )}
                  <p className="text-sm font-semibold text-foreground truncate">
                    {bet.type === "combined" && bet.legs ? bet.legs.map(l => l.partido).join(" + ") : bet.partido}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {bet.type === "combined" && bet.legs ? bet.legs.map(l => l.pronostico).join(" | ") : bet.pronostico}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {new Date(bet.fecha).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                  {bet.hora ? ` · ${bet.hora}` : ''}
                  {bet.type === "combined" && bet.legs ? ` · ${bet.legs.length} selecciones` : ''}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold text-foreground">@{(cuota || 0).toFixed(2)}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${resultBg(resultado)}`}>
                  {resultado}
                </span>
                {folder.hasStake && (resultado === "Ganada" || resultado === "Perdida") && (
                  <p className={`text-xs font-semibold mt-0.5 ${(benefit || 0) >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {(benefit || 0) >= 0 ? '+' : ''}{(benefit || 0).toFixed(2)}€
                  </p>
                )}
              </div>
            </div>
          );

          if (isSelectMode) return <div key={bet.id}>{itemContent}</div>;

          return (
            <SwipeableItem key={bet.id} onDelete={() => deleteBet(bet.id)}>
              {itemContent}
            </SwipeableItem>
          );
        })}
      </motion.div>

      {/* Add buttons or selection action */}
      {isSelectMode ? (
        <div className="fixed bottom-20 left-4 right-4 z-40 animate-slide-up">
          <button
            disabled={selectedIds.length === 0}
            onClick={() => setShowFolderSelector(true)}
            className="w-full h-14 rounded-2xl bg-primary text-primary-foreground shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50 disabled:scale-100 font-bold">
            <Copy className="w-5 h-5" />
            Duplicar {selectedIds.length} {selectedIds.length === 1 ? 'apuesta' : 'apuestas'}
          </button>
        </div>
      ) : (
        <div className="fixed bottom-20 right-4 flex flex-col gap-2 z-40">
          <button onClick={() => openNewBet("combined")}
            className="w-auto px-4 h-10 rounded-full bg-accent text-accent-foreground shadow-lg flex items-center gap-2 active:scale-95 transition-transform text-xs font-medium">
            <Plus className="w-4 h-4" /> Combinada
          </button>
          <button onClick={() => openNewBet("simple")}
            className="w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center active:scale-95 transition-transform">
            <Plus className="w-6 h-6" />
          </button>
        </div>
      )}

      {showForm && (
        <BetFormModal
          bet={editBet}
          folderId={folder.id}
          betType={betType}
          hasStake={folder.hasStake}
          onClose={() => { setShowForm(false); setEditBet(null); }}
          onDelete={editBet ? () => { deleteBet(editBet.id); setShowForm(false); setEditBet(null); } : undefined}
        />
      )}

      {/* Delete confirmation (normal mode) */}
      {showDelete && !isSelectMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 animate-fade-in" onClick={() => setShowDelete(false)}>
          <div className="bg-card rounded-2xl p-5 mx-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-foreground mb-2">Eliminar carpeta</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Se eliminarán todas las apuestas de "{folder.name}". Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-2">
              <button onClick={() => setShowDelete(false)} className="flex-1 py-2.5 rounded-xl bg-muted text-foreground font-medium text-sm">
                Cancelar
              </button>
              <button onClick={handleDelete} className="flex-1 py-2.5 rounded-xl bg-destructive text-destructive-foreground font-medium text-sm">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Folder Selector for duplication */}
      {showFolderSelector && (
        <FolderSelectorModal
          onClose={() => setShowFolderSelector(false)}
          selectedCount={selectedIds.length}
          currentFolderId={folder.id}
          onConfirm={(targetId) => {
            duplicateBets(selectedIds, targetId);
            setIsSelectMode(false);
            setSelectedIds([]);
            setShowFolderSelector(false);
          }}
        />
      )}
    </div>
  );
}

// Separate component for folder selection
function FolderSelectorModal({ onClose, onConfirm, selectedCount, currentFolderId }: {
  onClose: () => void,
  onConfirm: (id: string) => void,
  selectedCount: number,
  currentFolderId: string
}) {
  const { folders } = useApp();

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/30 animate-fade-in" onClick={onClose}>
      <div className="bg-card w-full max-w-lg rounded-t-2xl p-5 pb-10 animate-slide-up safe-bottom" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-foreground">Duplicar a...</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
            <CloseIcon className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          Selecciona la carpeta de destino para las {selectedCount} {selectedCount === 1 ? 'apuesta' : 'apuestas'}.
        </p>
        <div className="space-y-2 max-h-[60vh] overflow-y-auto no-scrollbar">
          {folders.map(f => (
            <button key={f.id}
              disabled={f.id === currentFolderId}
              onClick={() => onConfirm(f.id)}
              className={`w-full p-4 rounded-xl text-left flex items-center justify-between transition-colors ${f.id === currentFolderId ? 'opacity-50 grayscale' : 'bg-muted active:bg-muted/80'}`}>
              <span className="font-semibold text-sm">{f.name}</span>
              {f.id === currentFolderId && <span className="text-[10px] text-muted-foreground">(Actual)</span>}
            </button>
          ))}
        </div>
      </div>
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
