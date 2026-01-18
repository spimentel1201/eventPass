'use client';

import { Info, Users, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

interface EventInfoProps {
    description?: string;
    ageRestriction?: string;
    policies?: string[];
    includes?: string[];
    additionalInfo?: string;
}

export default function EventInfo({
    description,
    ageRestriction,
    policies = [],
    includes = [],
    additionalInfo,
}: EventInfoProps) {
    return (
        <section className="py-8 space-y-8">
            {/* Description */}
            {description && (
                <div>
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                        📋 Acerca del evento
                    </h2>
                    <div className="prose prose-invert max-w-none">
                        <p className="text-base-content/80 text-lg leading-relaxed whitespace-pre-line">
                            {description}
                        </p>
                    </div>
                </div>
            )}

            {/* Info Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Age Restriction */}
                {ageRestriction && (
                    <div className="card bg-base-200">
                        <div className="card-body p-4">
                            <div className="flex items-start gap-3">
                                <div className="bg-warning/20 p-2 rounded-lg">
                                    <Users className="w-5 h-5 text-warning" />
                                </div>
                                <div>
                                    <h4 className="font-semibold">Restricción de edad</h4>
                                    <p className="text-sm text-base-content/70 mt-1">
                                        {ageRestriction}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Duration/Schedule */}
                <div className="card bg-base-200">
                    <div className="card-body p-4">
                        <div className="flex items-start gap-3">
                            <div className="bg-info/20 p-2 rounded-lg">
                                <Clock className="w-5 h-5 text-info" />
                            </div>
                            <div>
                                <h4 className="font-semibold">Horario</h4>
                                <p className="text-sm text-base-content/70 mt-1">
                                    Apertura de puertas 2 horas antes del evento
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* What's Included */}
            {includes.length > 0 && (
                <div className="card bg-success/10 border border-success/20">
                    <div className="card-body">
                        <h3 className="card-title text-success">
                            <CheckCircle className="w-5 h-5" />
                            Incluye
                        </h3>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                            {includes.map((item, index) => (
                                <li key={index} className="flex items-center gap-2 text-base-content/80">
                                    <CheckCircle className="w-4 h-4 text-success shrink-0" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            {/* Policies/Restrictions */}
            {policies.length > 0 && (
                <div className="card bg-warning/10 border border-warning/20">
                    <div className="card-body">
                        <h3 className="card-title text-warning">
                            <AlertTriangle className="w-5 h-5" />
                            Políticas del evento
                        </h3>
                        <ul className="space-y-2 mt-2">
                            {policies.map((policy, index) => (
                                <li key={index} className="flex items-start gap-2 text-sm text-base-content/80">
                                    <span className="text-warning">•</span>
                                    {policy}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            {/* Additional Info */}
            {additionalInfo && (
                <div className="card bg-base-200">
                    <div className="card-body">
                        <h3 className="card-title">
                            <Info className="w-5 h-5" />
                            Información adicional
                        </h3>
                        <p className="text-base-content/70 mt-2 whitespace-pre-line">
                            {additionalInfo}
                        </p>
                    </div>
                </div>
            )}
        </section>
    );
}
