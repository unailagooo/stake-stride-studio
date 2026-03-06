import React, { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { Bet, getCombinedCuota, getCombinedResult, calcBenefit } from '@/types/models';
import { Share2, Download, X, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
    bet: Bet;
    folderName: string;
    onClose: () => void;
}

export const TicketGenerator: React.FC<Props> = ({ bet, folderName, onClose }) => {
    const ticketRef = useRef<HTMLDivElement>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const resultado = bet.type === 'combined' ? getCombinedResult(bet) : bet.resultado;
    const cuota = bet.type === 'combined' ? getCombinedCuota(bet) : bet.cuota;
    const benefit = calcBenefit(bet);

    const handleDownload = async () => {
        if (!ticketRef.current) return;
        setIsGenerating(true);
        try {
            const dataUrl = await toPng(ticketRef.current, { quality: 0.95, cacheBust: true });
            const link = document.createElement('a');
            link.download = `ticket-${bet.partido.replace(/\s+/g, '-').toLowerCase()}.png`;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error('Error generating ticket:', err);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleShare = async () => {
        if (!ticketRef.current) return;
        setIsGenerating(true);
        try {
            const dataUrl = await toPng(ticketRef.current, { quality: 0.95, cacheBust: true });
            const blob = await (await fetch(dataUrl)).blob();
            const file = new File([blob], 'ticket.png', { type: 'image/png' });

            if (navigator.share) {
                await navigator.share({
                    files: [file],
                    title: 'Mi Apuesta - Tipster Tracker',
                    text: `Mira mi apuesta en ${bet.partido} @${cuota.toFixed(2)}`,
                });
            } else {
                // Fallback to download
                handleDownload();
            }
        } catch (err) {
            console.error('Error sharing ticket:', err);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in" onClick={onClose}>
            <div className="w-full max-w-sm" onClick={e => e.stopPropagation()}>
                <div className="flex justify-end mb-4">
                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white backdrop-blur-md">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Ticket Preview Container */}
                <div className="overflow-hidden rounded-3xl shadow-2xl mb-6">
                    <div
                        ref={ticketRef}
                        className="relative w-full aspect-[3/4] p-8 flex flex-col bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#0f172a] text-white"
                    >
                        {/* Background elements */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[80px] rounded-full -mr-20 -mt-20" />
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-600/10 blur-[60px] rounded-full -ml-10 -mb-10" />

                        {/* Header */}
                        <div className="relative z-10 flex items-center justify-between mb-8">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                                    <div className="w-4 h-4 rounded-sm border-2 border-white" />
                                </div>
                                <div>
                                    <h3 className="text-xs font-black tracking-tighter uppercase leading-none">Tipster</h3>
                                    <p className="text-[10px] font-bold text-primary leading-none">Tracker</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 bg-white/5 backdrop-blur-md px-2 py-1 rounded-full border border-white/10">
                                <CheckCircle2 className="w-3 h-3 text-success" />
                                <span className="text-[8px] font-bold uppercase tracking-wider">Verificado</span>
                            </div>
                        </div>

                        {/* Bet Info */}
                        <div className="relative z-10 flex-1 flex flex-col justify-center text-center space-y-6">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">{folderName}</p>
                                <h2 className="text-2xl font-black leading-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70">
                                    {bet.partido}
                                </h2>
                            </div>

                            <div className="p-6 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-xl relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-none" />
                                <p className="text-primary font-black uppercase tracking-wider text-xs mb-1">Pronóstico</p>
                                <p className="text-xl font-bold">{bet.pronostico}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md">
                                    <p className="text-[10px] font-bold uppercase text-white/40 mb-1">Cuota</p>
                                    <p className="text-2xl font-black">@{cuota.toFixed(2)}</p>
                                </div>
                                <div className="p-4 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md">
                                    <p className="text-[10px] font-bold uppercase text-white/40 mb-1">Stake</p>
                                    <p className="text-2xl font-black">{bet.stake}/10</p>
                                </div>
                            </div>
                        </div>

                        {/* Footer / Status */}
                        <div className="relative z-10 mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
                            <div className="flex flex-col">
                                <p className="text-[10px] font-bold text-white/40 uppercase">Resultado</p>
                                <div className="flex items-center gap-1.5 mt-1">
                                    {resultado === 'Ganada' ? (
                                        <span className="text-success font-black flex items-center gap-1 text-sm">
                                            <CheckCircle2 className="w-4 h-4" /> GANADA
                                        </span>
                                    ) : resultado === 'Perdida' ? (
                                        <span className="text-destructive font-black flex items-center gap-1 text-sm">
                                            <AlertCircle className="w-4 h-4" /> PERDIDA
                                        </span>
                                    ) : (
                                        <span className="text-pending font-black flex items-center gap-1 text-sm">
                                            <Clock className="w-4 h-4" /> PENDIENTE
                                        </span>
                                    )}
                                </div>
                            </div>

                            {benefit !== 0 && (
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-white/40 uppercase">Beneficio</p>
                                    <p className={`text-lg font-black mt-0.5 ${benefit > 0 ? 'text-success' : 'text-destructive'}`}>
                                        {benefit > 0 ? '+' : ''}{benefit.toFixed(2)}€
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Branding detail */}
                        <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[7px] font-bold tracking-[0.3em] text-white/10 uppercase">
                            Stake & Stride Studio Pro
                        </p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                    <button
                        disabled={isGenerating}
                        onClick={handleDownload}
                        className="h-14 rounded-2xl bg-white/10 border border-white/10 text-white flex items-center justify-center gap-2 font-bold active:scale-95 transition-all backdrop-blur-md disabled:opacity-50"
                    >
                        <Download className="w-5 h-5" /> Guardar
                    </button>
                    <button
                        disabled={isGenerating}
                        onClick={handleShare}
                        className="h-14 rounded-2xl bg-primary text-white flex items-center justify-center gap-2 font-bold shadow-xl shadow-primary/20 active:scale-95 transition-all disabled:opacity-50"
                    >
                        <Share2 className="w-5 h-5" /> Compartir
                    </button>
                </div>
            </div>
        </div>
    );
};
