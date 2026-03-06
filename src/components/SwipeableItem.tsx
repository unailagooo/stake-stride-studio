import React, { useRef } from "react";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { Trash2 } from "lucide-react";

interface SwipeableItemProps {
    children: React.ReactNode;
    onDelete: () => void;
    className?: string;
}

export function SwipeableItem({ children, onDelete, className = "" }: SwipeableItemProps) {
    const x = useMotionValue(0);
    const opacity = useTransform(x, [-100, -70, 0], [1, 1, 1]);
    const btnOpacity = useTransform(x, [-80, -40, 0], [1, 0.5, 0]);
    const btnScale = useTransform(x, [-80, -40, 0], [1, 0.8, 0.5]);

    const handleDragEnd = (_: any, info: PanInfo) => {
        if (info.offset.x < -80) {
            // Threshold to trigger delete
            onDelete();
        }
        // Snap back
        x.set(0);
    };

    return (
        <div className={`relative overflow-hidden ${className}`}>
            {/* Background Action Button */}
            <motion.div
                style={{ opacity: btnOpacity, scale: btnScale }}
                className="absolute inset-y-0 right-0 w-20 bg-destructive flex items-center justify-center rounded-2xl z-0"
            >
                <Trash2 className="w-5 h-5 text-destructive-foreground" />
            </motion.div>

            {/* Foreground Content */}
            <motion.div
                style={{ x }}
                drag="x"
                dragConstraints={{ left: -100, right: 0 }}
                dragElastic={0.1}
                onDragEnd={handleDragEnd}
                className="relative z-10 bg-transparent"
            >
                {children}
            </motion.div>
        </div>
    );
}
