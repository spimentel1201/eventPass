'use client';

import { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

interface ReservationTimerProps {
    expiryTime: Date | null;
    onExpire: () => void;
}

export function ReservationTimer({ expiryTime, onExpire }: ReservationTimerProps) {
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const [isExpired, setIsExpired] = useState(false);

    useEffect(() => {
        if (!expiryTime) {
            setTimeLeft(0);
            return;
        }

        const updateTimer = () => {
            const now = new Date();
            const diff = expiryTime.getTime() - now.getTime();

            if (diff <= 0) {
                setTimeLeft(0);
                setIsExpired(true);
                onExpire();
            } else {
                setTimeLeft(Math.floor(diff / 1000));
            }
        };

        // Initial update
        updateTimer();

        // Update every second
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [expiryTime, onExpire]);

    if (!expiryTime || timeLeft === 0) {
        return null;
    }

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const isLowTime = timeLeft < 120; // Less than 2 minutes

    return (
        <div
            className={`flex items-center gap-2 p-3 rounded-lg ${isExpired
                    ? 'bg-error text-error-content'
                    : isLowTime
                        ? 'bg-warning text-warning-content'
                        : 'bg-info text-info-content'
                }`}
        >
            {isLowTime ? (
                <AlertTriangle className="w-5 h-5" />
            ) : (
                <Clock className="w-5 h-5" />
            )}
            <div>
                <p className="text-sm font-medium">
                    {isExpired ? 'Reserva expirada' : 'Tiempo restante'}
                </p>
                {!isExpired && (
                    <p className="text-lg font-bold tabular-nums">
                        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                    </p>
                )}
            </div>
        </div>
    );
}
