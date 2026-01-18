'use client';

import { useState } from 'react';
import { QrCode, CheckCircle, XCircle, AlertCircle, Camera, Loader2 } from 'lucide-react';
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

export default function ValidateTicketsPage() {
    const [qrCode, setQrCode] = useState('');
    const [isValidating, setIsValidating] = useState(false);
    const [result, setResult] = useState<ValidationResult | null>(null);

    const handleValidate = async () => {
        if (!qrCode.trim()) return;

        setIsValidating(true);
        setResult(null);

        try {
            const response = await api.post<{ data: ValidationResult }>(API_ROUTES.TICKET_VALIDATE, {
                qrCodeHash: qrCode.trim()
            });

            setResult(response.data.data);
        } catch (error: any) {
            setResult({
                valid: false,
                message: error.response?.data?.message || 'Error al validar el ticket'
            });
        } finally {
            setIsValidating(false);
        }
    };

    const handleClear = () => {
        setQrCode('');
        setResult(null);
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
                    Escanea o ingresa el código QR para validar la entrada
                </p>
            </div>

            {/* QR Input */}
            <div className="card bg-base-200">
                <div className="card-body">
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-medium">Código QR</span>
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Ingresa o escanea el código QR..."
                                className="input input-bordered flex-1 font-mono"
                                value={qrCode}
                                onChange={(e) => setQrCode(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleValidate()}
                            />
                            <button
                                className="btn btn-primary"
                                onClick={handleValidate}
                                disabled={isValidating || !qrCode.trim()}
                            >
                                {isValidating ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <CheckCircle className="w-5 h-5" />
                                        Validar
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="divider">O</div>

                    <button className="btn btn-outline btn-lg gap-2">
                        <Camera className="w-5 h-5" />
                        Escanear con Cámara
                    </button>
                    <p className="text-xs text-center text-base-content/50">
                        La función de cámara estará disponible próximamente
                    </p>
                </div>
            </div>

            {/* Result */}
            {result && (
                <div className={`card ${result.valid ? 'bg-success/20 border-success' : 'bg-error/20 border-error'} border-2`}>
                    <div className="card-body items-center text-center">
                        {result.valid ? (
                            <>
                                <CheckCircle className="w-16 h-16 text-success" />
                                <h2 className="text-2xl font-bold text-success">¡Entrada Válida!</h2>
                            </>
                        ) : (
                            <>
                                <XCircle className="w-16 h-16 text-error" />
                                <h2 className="text-2xl font-bold text-error">Entrada Inválida</h2>
                            </>
                        )}

                        <p className="text-lg">{result.message}</p>

                        {result.ticket && (
                            <div className="mt-4 p-4 bg-base-100 rounded-lg w-full text-left">
                                <h3 className="font-bold mb-2">{result.ticket.eventTitle}</h3>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <span className="text-base-content/60">Sección:</span>
                                    <span>{result.ticket.sectionName}</span>
                                    <span className="text-base-content/60">Fila:</span>
                                    <span>{result.ticket.row}</span>
                                    <span className="text-base-content/60">Asiento:</span>
                                    <span>{result.ticket.seatNumber}</span>
                                    <span className="text-base-content/60">Estado:</span>
                                    <span className={result.ticket.status === 'USED' ? 'text-warning' : 'text-success'}>
                                        {result.ticket.status === 'USED' ? 'Ya usado' : 'Válido'}
                                    </span>
                                </div>
                            </div>
                        )}

                        <button className="btn btn-ghost mt-4" onClick={handleClear}>
                            Validar otro ticket
                        </button>
                    </div>
                </div>
            )}

            {/* Instructions */}
            <div className="card bg-base-200">
                <div className="card-body">
                    <h3 className="font-bold flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-info" />
                        Instrucciones
                    </h3>
                    <ul className="list-disc list-inside text-sm text-base-content/70 space-y-1">
                        <li>Escanea el código QR del ticket del asistente</li>
                        <li>Verifica que el resultado sea "Entrada Válida"</li>
                        <li>El ticket quedará marcado como "USADO" automáticamente</li>
                        <li>Un ticket solo puede ser usado una vez</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
