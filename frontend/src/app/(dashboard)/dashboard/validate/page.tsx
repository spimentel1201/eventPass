'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { QrCode, CheckCircle, XCircle, AlertCircle, Camera, Loader2, Volume2, VolumeX, X } from 'lucide-react';
import api from '@/lib/api';
import { API_ROUTES } from '@/lib/constants';

interface ValidationResult {
    valid: boolean;
    message: string;
    ticket?: {
        id: string;
        eventTitle: string;
        sectionName: string;
        row: string;
        seatNumber: string;
        status: string;
    };
}

// Sound effects (base64 encoded short beeps)
const SUCCESS_SOUND = 'data:audio/wav;base64,UklGRl9vT19LRUVQZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YTpFRUEA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA';
const ERROR_SOUND = 'data:audio/wav;base64,UklGRl9vT19LRUVQZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YTpFRUEA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA';

export default function ValidateTicketsPage() {
    const [qrCode, setQrCode] = useState('');
    const [isValidating, setIsValidating] = useState(false);
    const [result, setResult] = useState<ValidationResult | null>(null);
    const [showCamera, setShowCamera] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [scannerReady, setScannerReady] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);

    const scannerRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const lastScannedRef = useRef<string>('');
    const cooldownRef = useRef<boolean>(false);

    // Play sound effect
    const playSound = useCallback((success: boolean) => {
        if (!soundEnabled) return;
        try {
            // Use Web Audio API for better browser support
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = success ? 800 : 300;
            oscillator.type = 'sine';
            gainNode.gain.value = 0.3;

            oscillator.start();
            oscillator.stop(audioContext.currentTime + (success ? 0.15 : 0.3));
        } catch (e) {
            console.log('Audio not supported');
        }
    }, [soundEnabled]);

    // Validate ticket
    const handleValidate = useCallback(async (code: string) => {
        if (!code.trim() || isValidating) return;

        // Prevent duplicate scans
        if (cooldownRef.current) return;
        cooldownRef.current = true;
        setTimeout(() => { cooldownRef.current = false; }, 2000);

        setIsValidating(true);
        setResult(null);

        try {
            const response = await api.post<{ data: ValidationResult }>(API_ROUTES.TICKET_VALIDATE, {
                qrCodeHash: code.trim()
            });

            const validationResult = response.data.data;
            setResult(validationResult);
            playSound(validationResult.valid);
            lastScannedRef.current = code;
        } catch (error: any) {
            const errorResult = {
                valid: false,
                message: error.response?.data?.message || 'Error al validar el ticket'
            };
            setResult(errorResult);
            playSound(false);
        } finally {
            setIsValidating(false);
        }
    }, [isValidating, playSound]);

    // Handle manual input validation
    const handleManualValidate = () => {
        handleValidate(qrCode);
    };

    // Initialize camera scanner
    const startScanner = useCallback(async () => {
        if (typeof window === 'undefined') return;

        setCameraError(null);
        setShowCamera(true);

        try {
            const { Html5Qrcode } = await import('html5-qrcode');

            // Wait for container to be ready
            await new Promise(resolve => setTimeout(resolve, 100));

            if (!containerRef.current) {
                throw new Error('Container not ready');
            }

            const scanner = new Html5Qrcode('qr-reader');
            scannerRef.current = scanner;

            await scanner.start(
                { facingMode: 'environment' },
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1,
                },
                (decodedText) => {
                    // Prevent duplicate scans of same code
                    if (decodedText !== lastScannedRef.current) {
                        handleValidate(decodedText);
                    }
                },
                () => { } // Ignore scan failures
            );

            setScannerReady(true);
        } catch (err: any) {
            console.error('Camera error:', err);
            setCameraError(err.message || 'No se pudo acceder a la cámara');
            setShowCamera(false);
        }
    }, [handleValidate]);

    // Stop camera scanner
    const stopScanner = useCallback(async () => {
        if (scannerRef.current) {
            try {
                await scannerRef.current.stop();
                scannerRef.current = null;
            } catch (e) {
                console.log('Error stopping scanner');
            }
        }
        setScannerReady(false);
        setShowCamera(false);
        lastScannedRef.current = '';
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (scannerRef.current) {
                scannerRef.current.stop().catch(() => { });
            }
        };
    }, []);

    const handleClear = () => {
        setQrCode('');
        setResult(null);
        lastScannedRef.current = '';
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div className="text-center">
                <div className="w-20 h-20 mx-auto bg-primary/20 rounded-full flex items-center justify-center mb-4">
                    <QrCode className="w-10 h-10 text-primary" />
                </div>
                <h1 className="text-3xl font-bold">Validar Tickets</h1>
                <p className="text-base-content/60 mt-2">
                    Escanea el código QR para validar la entrada
                </p>
            </div>

            {/* Sound Toggle */}
            <div className="flex justify-center">
                <button
                    className={`btn btn-sm gap-2 ${soundEnabled ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => setSoundEnabled(!soundEnabled)}
                >
                    {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                    {soundEnabled ? 'Sonido ON' : 'Sonido OFF'}
                </button>
            </div>

            {/* Camera Scanner */}
            {showCamera ? (
                <div className="card bg-base-200">
                    <div className="card-body">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold flex items-center gap-2">
                                <Camera className="w-5 h-5 text-primary" />
                                Cámara activa
                            </h3>
                            <button className="btn btn-ghost btn-sm btn-circle" onClick={stopScanner}>
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div
                            id="qr-reader"
                            ref={containerRef}
                            className="w-full max-w-sm mx-auto rounded-lg overflow-hidden bg-black"
                            style={{ minHeight: '300px' }}
                        />

                        {!scannerReady && !cameraError && (
                            <div className="text-center py-4">
                                <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                                <p className="text-sm text-base-content/60 mt-2">Iniciando cámara...</p>
                            </div>
                        )}

                        {cameraError && (
                            <div className="alert alert-error mt-4">
                                <AlertCircle className="w-5 h-5" />
                                <span>{cameraError}</span>
                            </div>
                        )}

                        <p className="text-xs text-center text-base-content/50 mt-4">
                            Apunta la cámara al código QR del ticket
                        </p>
                    </div>
                </div>
            ) : (
                <div className="card bg-base-200">
                    <div className="card-body">
                        {/* Manual Input */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-medium">Código QR (manual)</span>
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Ingresa el código QR..."
                                    className="input input-bordered flex-1 font-mono text-sm"
                                    value={qrCode}
                                    onChange={(e) => setQrCode(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleManualValidate()}
                                />
                                <button
                                    className="btn btn-primary"
                                    onClick={handleManualValidate}
                                    disabled={isValidating || !qrCode.trim()}
                                >
                                    {isValidating ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <CheckCircle className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="divider">O</div>

                        <button
                            className="btn btn-primary btn-lg gap-2"
                            onClick={startScanner}
                        >
                            <Camera className="w-6 h-6" />
                            Escanear con Cámara
                        </button>
                    </div>
                </div>
            )}

            {/* Result - Visual Notification */}
            {result && (
                <div
                    className={`card border-4 ${result.valid
                            ? 'bg-success/20 border-success animate-pulse'
                            : 'bg-error/20 border-error'
                        }`}
                >
                    <div className="card-body items-center text-center py-8">
                        {result.valid ? (
                            <>
                                <div className="w-24 h-24 rounded-full bg-success flex items-center justify-center mb-4">
                                    <CheckCircle className="w-16 h-16 text-success-content" />
                                </div>
                                <h2 className="text-3xl font-bold text-success">¡VÁLIDO!</h2>
                            </>
                        ) : (
                            <>
                                <div className="w-24 h-24 rounded-full bg-error flex items-center justify-center mb-4">
                                    <XCircle className="w-16 h-16 text-error-content" />
                                </div>
                                <h2 className="text-3xl font-bold text-error">INVÁLIDO</h2>
                            </>
                        )}

                        <p className="text-lg mt-2">{result.message}</p>

                        {result.ticket && (
                            <div className="mt-4 p-4 bg-base-100 rounded-lg w-full text-left max-w-xs">
                                <h3 className="font-bold mb-2 truncate">{result.ticket.eventTitle}</h3>
                                <div className="grid grid-cols-2 gap-1 text-sm">
                                    <span className="text-base-content/60">Sección:</span>
                                    <span className="font-medium">{result.ticket.sectionName || 'General'}</span>
                                    <span className="text-base-content/60">Fila:</span>
                                    <span className="font-medium">{result.ticket.row || '-'}</span>
                                    <span className="text-base-content/60">Asiento:</span>
                                    <span className="font-medium">{result.ticket.seatNumber || '-'}</span>
                                </div>
                            </div>
                        )}

                        <button
                            className="btn btn-outline mt-6"
                            onClick={handleClear}
                        >
                            Escanear otro ticket
                        </button>
                    </div>
                </div>
            )}

            {/* Instructions */}
            {!showCamera && !result && (
                <div className="card bg-base-200">
                    <div className="card-body">
                        <h3 className="font-bold flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-info" />
                            Instrucciones
                        </h3>
                        <ul className="list-disc list-inside text-sm text-base-content/70 space-y-1">
                            <li>Presiona "Escanear con Cámara" para activar el escáner</li>
                            <li>Apunta al código QR del ticket del asistente</li>
                            <li>Se mostrará ✅ verde si es válido o ❌ rojo si no lo es</li>
                            <li>El ticket quedará marcado como "USADO" automáticamente</li>
                            <li>Un ticket solo puede ser usado una vez</li>
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
}
