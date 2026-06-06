import React from 'react';
import { PatientIdInfo, VitalSigns } from '../types';

interface PatientIdentProps {
  patient: PatientIdInfo;
  vitals: VitalSigns;
  onChangePatient: (field: keyof PatientIdInfo, value: any) => void;
  onChangeVitals: (field: keyof VitalSigns, value: any) => void;
}

export default function PatientIdent({ patient, vitals, onChangePatient, onChangeVitals }: PatientIdentProps) {
  
  // Handlers for input updates
  const handlePatientChange = (field: keyof PatientIdInfo, value: any) => {
    onChangePatient(field, value);
  };

  const handleVitalsChange = (field: keyof VitalSigns, value: string) => {
    onChangeVitals(field, value);

    // Compute PAM on the fly if PAS and PAD are numbers
    if (field === 'pas' || field === 'pad') {
      const pasVal = field === 'pas' ? parseFloat(value) : parseFloat(vitals.pas);
      const padVal = field === 'pad' ? parseFloat(value) : parseFloat(vitals.pad);
      if (!isNaN(pasVal) && !isNaN(padVal)) {
        const pam = Math.round((pasVal + 2 * padVal) / 3);
        onChangeVitals('pam' as any, pam as any);
      } else {
        onChangeVitals('pam' as any, null as any);
      }
    }
  };

  // Diagnostic helper style checks
  const getFcStatus = () => {
    const fc = parseInt(vitals.fc, 10);
    if (isNaN(fc)) return null;
    if (fc > 100) return { label: 'Taquicardia', style: 'text-rose-600 bg-rose-55 rounded-md px-1.5 py-0.5 font-semibold font-mono text-[10px] uppercase border border-rose-100' };
    if (fc < 50) return { label: 'Bradicardia', style: 'text-amber-600 bg-amber-55 rounded-md px-1.5 py-0.5 font-semibold font-mono text-[10px] uppercase border border-amber-100' };
    return { label: 'Normocárdico', style: 'text-emerald-700 bg-emerald-55 rounded-md px-1.5 py-0.5 font-semibold font-mono text-[10px] uppercase border border-emerald-100' };
  };

  const getPaStatus = () => {
    const pas = parseInt(vitals.pas, 10);
    const pad = parseInt(vitals.pad, 10);
    if (isNaN(pas) || isNaN(pad)) return null;
    if (pas < 90 || pad < 60) return { label: 'Hipotensão', style: 'text-rose-600 bg-rose-100 rounded-md px-1.5 py-0.5 font-semibold font-mono text-[10px] uppercase border border-rose-200' };
    if (pas > 140 || pad > 90) return { label: 'Hipertensão', style: 'text-amber-600 bg-amber-100 rounded-md px-1.5 py-0.5 font-semibold font-mono text-[10px] uppercase border border-amber-200' };
    return { label: 'Normotensão', style: 'text-emerald-700 bg-emerald-100 rounded-md px-1.5 py-0.5 font-semibold font-mono text-[10px] uppercase border border-emerald-200' };
  };

  const getFrStatus = () => {
    const fr = parseInt(vitals.fr, 10);
    if (isNaN(fr)) return null;
    if (fr > 22) return { label: 'Taquipneia', style: 'text-rose-600 bg-rose-100 rounded-md px-1.5 py-0.5 font-semibold font-mono text-[10px] uppercase border border-rose-200' };
    if (fr < 10) return { label: 'Bradipneia', style: 'text-amber-600 bg-amber-100 rounded-md px-1.5 py-0.5 font-semibold font-mono text-[10px] uppercase border border-amber-200' };
    return { label: 'Eupneico', style: 'text-emerald-700 bg-emerald-100 rounded-md px-1.5 py-0.5 font-semibold font-mono text-[10px] uppercase border border-emerald-200' };
  };

  const getSatStatus = () => {
    const sat = parseInt(vitals.sat, 10);
    if (isNaN(sat)) return null;
    if (sat < 92) return { label: 'Hipóxia', style: 'text-rose-600 bg-rose-100 rounded-md px-1.5 py-0.5 font-semibold font-mono text-[10px] uppercase border border-rose-200' };
    return { label: 'Saturação Alvo', style: 'text-emerald-700 bg-emerald-100 rounded-md px-1.5 py-0.5 font-semibold font-mono text-[10px] uppercase border border-emerald-200' };
  };

  const getTempStatus = () => {
    const tx = parseFloat(vitals.tx);
    if (isNaN(tx)) return null;
    if (tx >= 37.8) return { label: 'Febre / Hipertermia', style: 'text-rose-600 bg-rose-100 rounded-md px-1.5 py-0.5 font-semibold font-mono text-[10px] uppercase border border-rose-200' };
    if (tx < 35.0) return { label: 'Hipotermia', style: 'text-cyan-600 bg-cyan-100 rounded-md px-1.5 py-0.5 font-semibold font-mono text-[10px] uppercase border border-cyan-200' };
    return { label: 'Afebril', style: 'text-emerald-700 bg-emerald-100 rounded-md px-1.5 py-0.5 font-semibold font-mono text-[10px] uppercase border border-emerald-200' };
  };

  return (
    <div id="patient-ident-section" className="bg-white rounded-xl p-6 border border-slate-200 mb-6 shadow-sm">
      <h2 id="patient-ident-title" className="text-md font-sans font-semibold text-slate-800 tracking-tight flex items-center gap-2 border-b border-slate-100 pb-3 mb-5">
        <span className="flex items-center justify-center bg-indigo-50 text-indigo-600 rounded-lg h-7 w-7 text-xs font-bold font-mono">1</span>
        Identificação & Sinais Vitais
      </h2>

      {/* Patient Identification Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
        <div id="patient-nome-col" className="lg:col-span-2">
          <label htmlFor="patient-nome-input" className="block text-xs font-medium text-slate-500 mb-1">Nome Completo do Paciente</label>
          <input
            id="patient-nome-input"
            type="text"
            className="w-full text-sm border border-slate-200 rounded-lg p-2.5 outline-indigo-500"
            placeholder="Nome do paciente"
            value={patient.nome}
            onChange={(e) => handlePatientChange('nome', e.target.value)}
          />
        </div>

        <div id="patient-leito-col">
          <label htmlFor="patient-leito-input" className="block text-xs font-medium text-slate-500 mb-1">Leito</label>
          <input
            id="patient-leito-input"
            type="text"
            className="w-full text-sm border border-slate-200 rounded-lg p-2.5 outline-indigo-500"
            placeholder="Leito / Setor"
            value={patient.leito}
            onChange={(e) => handlePatientChange('leito', e.target.value)}
          />
        </div>

        <div id="patient-idade-col">
          <label htmlFor="patient-idade-input" className="block text-xs font-medium text-slate-500 mb-1">Idade</label>
          <input
            id="patient-idade-input"
            type="number"
            className="w-full text-sm border border-slate-200 rounded-lg p-2.5 outline-indigo-500"
            placeholder="Anos"
            value={patient.idade}
            onChange={(e) => handlePatientChange('idade', e.target.value)}
          />
        </div>

        <div id="patient-sexo-col">
          <label htmlFor="patient-sexo-select" className="block text-xs font-medium text-slate-500 mb-1">Sexo</label>
          <select
            id="patient-sexo-select"
            className="w-full text-sm border border-slate-200 rounded-lg p-2.5 outline-indigo-500"
            value={patient.sexo}
            onChange={(e) => handlePatientChange('sexo', e.target.value as any)}
          >
            <option value="">Selecione</option>
            <option value="Masculino">Masculino</option>
            <option value="Feminino">Feminino</option>
          </select>
        </div>

        <div id="patient-peso-col">
          <label htmlFor="patient-peso-input" className="block text-xs font-medium text-slate-500 mb-1">Peso Real (kg)</label>
          <input
            id="patient-peso-input"
            type="number"
            className="w-full text-sm border border-slate-200 rounded-lg p-2.5 outline-indigo-500"
            placeholder="Peso d/ paciente"
            value={patient.peso}
            onChange={(e) => handlePatientChange('peso', e.target.value)}
          />
        </div>

        <div id="patient-altura-col">
          <label htmlFor="patient-altura-input" className="block text-xs font-medium text-slate-500 mb-1">Altura (cm)</label>
          <input
            id="patient-altura-input"
            type="number"
            className="w-full text-sm border border-slate-200 rounded-lg p-2.5 outline-indigo-500"
            placeholder="Ex: 175"
            value={patient.altura || ''}
            onChange={(e) => handlePatientChange('altura', e.target.value)}
          />
        </div>

        <div id="patient-dih-col">
          <label htmlFor="patient-dih-input" className="block text-xs font-medium text-slate-500 mb-1">DIH (Dias Hosp)</label>
          <input
            id="patient-dih-input"
            type="number"
            className="w-full text-sm border border-slate-200 rounded-lg p-2.5 outline-indigo-500"
            placeholder="Dias de Internação"
            value={patient.dih}
            onChange={(e) => handlePatientChange('dih', e.target.value)}
          />
        </div>
      </div>

      {/* Sinais Vitais Block */}
      <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
        <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-widest mb-4">Sinais Vitais de Admissão / Plantão</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
          {/* FC */}
          <div id="vitals-fc-col">
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="vital-fc-input" className="block text-xs font-medium text-slate-500">FC (bpm)</label>
              {getFcStatus() && (
                <span className={getFcStatus()?.style}>{getFcStatus()?.label}</span>
              )}
            </div>
            <input
              id="vital-fc-input"
              type="number"
              className="w-full text-md border border-slate-200 bg-white font-mono font-medium rounded-lg p-2.5 outline-indigo-500 focus:ring-1 focus:ring-indigo-200"
              placeholder="bpm"
              value={vitals.fc}
              onChange={(e) => handleVitalsChange('fc', e.target.value)}
            />
          </div>

          {/* PA Systolic and Diastolic */}
          <div id="vitals-pa-col" className="md:col-span-1">
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="vital-pas-input" className="block text-xs font-medium text-slate-500">PA (mmHg) e PAM</label>
              {getPaStatus() && (
                <span className={getPaStatus()?.style}>{getPaStatus()?.label}</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <input
                id="vital-pas-input"
                type="number"
                className="w-1/2 text-md border border-slate-200 bg-white font-mono font-medium rounded-lg p-2.5 outline-indigo-500 text-center"
                placeholder="PAS (Sist)"
                value={vitals.pas}
                onChange={(e) => handleVitalsChange('pas', e.target.value)}
              />
              <span className="text-slate-400 font-mono text-sm">/</span>
              <input
                id="vital-pad-input"
                type="number"
                className="w-1/2 text-md border border-slate-200 bg-white font-mono font-medium rounded-lg p-2.5 outline-indigo-500 text-center"
                placeholder="PAD (Diast)"
                value={vitals.pad}
                onChange={(e) => handleVitalsChange('pad', e.target.value)}
              />
            </div>
            {vitals.pam !== null && (
              <span className="block text-[11px] text-indigo-600 font-mono font-medium mt-1 text-right">
                PAM Calculada: <strong id="pam-calulada-value">{vitals.pam} mmHg</strong>
              </span>
            )}
          </div>

          {/* FR */}
          <div id="vitals-fr-col">
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="vital-fr-input" className="block text-xs font-medium text-slate-500">FR (irpm)</label>
              {getFrStatus() && (
                <span className={getFrStatus()?.style}>{getFrStatus()?.label}</span>
              )}
            </div>
            <input
              id="vital-fr-input"
              type="number"
              className="w-full text-md border border-slate-200 bg-white font-mono font-medium rounded-lg p-2.5 outline-indigo-500"
              placeholder="rpm"
              value={vitals.fr}
              onChange={(e) => handleVitalsChange('fr', e.target.value)}
            />
          </div>

          {/* SAT */}
          <div id="vitals-sat-col">
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="vital-sat-input" className="block text-xs font-medium text-slate-500">SpO2 / SAT (%)</label>
              {getSatStatus() && (
                <span className={getSatStatus()?.style}>{getSatStatus()?.label}</span>
              )}
            </div>
            <input
              id="vital-sat-input"
              type="number"
              className="w-full text-md border border-slate-200 bg-white font-mono font-medium rounded-lg p-2.5 outline-indigo-500"
              placeholder="%"
              value={vitals.sat}
              onChange={(e) => handleVitalsChange('sat', e.target.value)}
            />
          </div>

          {/* TX */}
          <div id="vitals-tx-col">
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="vital-tx-input" className="block text-xs font-medium text-slate-500">Temperatura (ºC)</label>
              {getTempStatus() && (
                <span className={getTempStatus()?.style}>{getTempStatus()?.label}</span>
              )}
            </div>
            <input
              id="vital-tx-input"
              type="number"
              step="0.1"
              className="w-full text-md border border-slate-200 bg-white font-mono font-medium rounded-lg p-2.5 outline-indigo-500"
              placeholder="ºC"
              value={vitals.tx}
              onChange={(e) => handleVitalsChange('tx', e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
