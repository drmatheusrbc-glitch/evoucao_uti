import React from 'react';
import { NephrologyInfo, PatientIdInfo } from '../types';
import { estimateTfg } from '../utils/calculators';
import { Columns, Scale, Droplet, RefreshCw } from 'lucide-react';

interface NefroSectionProps {
  nefro: NephrologyInfo;
  patient: PatientIdInfo;
  onChangeNefro: (field: keyof NephrologyInfo, value: any) => void;
}

export default function NefroSection({ nefro, patient, onChangeNefro }: NefroSectionProps) {
  
  const handleFieldChange = (field: keyof NephrologyInfo, value: any) => {
    onChangeNefro(field, value);

    // Auto-calculate Fluid Balance (Entradas - Diurese) on the fly
    if (field === 'diurese' || field === 'entradas') {
      const diuresisNum = parseFloat(field === 'diurese' ? value : nefro.diurese);
      const intakeNum = parseFloat(field === 'entradas' ? value : nefro.entradas);
      if (!isNaN(diuresisNum) && !isNaN(intakeNum)) {
        onChangeNefro('bh', intakeNum - diuresisNum);
      } else {
        onChangeNefro('bh', null);
      }
    }
  };

  const handleEstimateTfg = () => {
    const calculatedGfr = estimateTfg(patient.idade, patient.peso, nefro.creat, patient.sexo);
    if (calculatedGfr !== null) {
      handleFieldChange('tfg', calculatedGfr.toString());
    }
  };

  const isTfgCalculable = !!(patient.idade && patient.peso && nefro.creat && patient.sexo);

  return (
    <div id="nephrology-section" className="bg-white rounded-xl p-6 border border-slate-200 mb-6 shadow-sm">
      <h2 id="nephrology-title" className="text-md font-sans font-semibold text-slate-800 tracking-tight flex items-center gap-2 border-b border-slate-100 pb-3 mb-5">
        <span className="flex items-center justify-center bg-indigo-50 text-indigo-600 rounded-lg h-7 w-7 text-xs font-bold font-mono">5</span>
        Nefrologia, Balanço Hídrico & Bioquímica Renal
      </h2>

      {/* Fluid Balance Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Diurese */}
        <div>
          <label htmlFor="nefro-diurese-input" className="block text-xs font-medium text-slate-500 mb-1">Diurese total (mL / 24h)</label>
          <div className="flex gap-1">
            <input
              id="nefro-diurese-input"
              type="number"
              className="w-full text-xs border border-slate-200 bg-white rounded-lg p-2.5 outline-indigo-500 font-mono font-semibold"
              placeholder="Ex: 1500"
              value={nefro.diurese}
              onChange={(e) => handleFieldChange('diurese', e.target.value)}
            />
            <span className="flex items-center text-[10px] text-slate-400 bg-slate-50 border px-2.5 rounded-lg font-semibold">mL</span>
          </div>
        </div>

        {/* Entradas */}
        <div>
          <label htmlFor="nefro-entradas-input" className="block text-xs font-medium text-slate-500 mb-1">Entradas hídricas (mL / 24h)</label>
          <div className="flex gap-1">
            <input
              id="nefro-entradas-input"
              type="number"
              className="w-full text-xs border border-slate-200 bg-white rounded-lg p-2.5 outline-indigo-500 font-mono font-semibold"
              placeholder="Ex: 2200"
              value={nefro.entradas}
              onChange={(e) => handleFieldChange('entradas', e.target.value)}
            />
            <span className="flex items-center text-[10px] text-slate-400 bg-slate-50 border px-2.5 rounded-lg font-semibold">mL</span>
          </div>
        </div>

        {/* Balanço Hídrico */}
        <div>
          <label htmlFor="nefro-bh-input" className="block text-xs font-medium text-slate-500 mb-1">Balanço Hídrico (BH)</label>
          <div className="flex gap-1">
            <input
              id="nefro-bh-input"
              type="text"
              readOnly
              className="w-full text-xs border border-slate-200 bg-slate-100 rounded-lg p-2.5 font-mono font-bold text-slate-700 cursor-not-allowed"
              placeholder="Auto-calculado"
              value={nefro.bh !== null ? (nefro.bh > 0 ? `+${nefro.bh} mL` : `${nefro.bh} mL`) : ''}
            />
            <span className="flex items-center text-[10px] text-slate-400 bg-slate-50 border px-2.5 rounded-lg font-semibold">mL</span>
          </div>
          {nefro.bh !== null && (
            <span className={`block text-[10px] font-medium mt-1 ${nefro.bh > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
              {nefro.bh > 0 ? '* Acumulativo Positivo' : '* Balanço Equilibrado/Negativo'}
            </span>
          )}
        </div>

        {/* Aspecto diurese */}
        <div>
          <label htmlFor="nefro-aspecto-select" className="block text-xs font-medium text-slate-500 mb-1">Aspecto da Urina</label>
          <select
            id="nefro-aspecto-select"
            value={nefro.aspectoUrina}
            onChange={(e) => handleFieldChange('aspectoUrina', e.target.value)}
            className="w-full text-xs border border-slate-200 bg-white rounded-lg p-2.5 outline-indigo-500"
          >
            <option value="">Selecione</option>
            <option value="Citrino límpido">Citrino límpido (Normal)</option>
            <option value="Concentrada / Colúria">Concentrada (Escura / Desidratação)</option>
            <option value="Hematúrica franca">Hematúrica (Sangue visível)</option>
            <option value="Turva / Piúria">Turva (Depósito / Suspeita de ITU)</option>
            <option value="Hematúrica porosa">Hematúrica porosa / Tampão</option>
          </select>
        </div>
      </div>

      {/* Hemodiálise field */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6">
        <label htmlFor="nefro-hd-input" className="block text-xs font-semibold text-slate-700 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
          <Droplet className="h-4 w-4 text-sky-500 animate-pulse" />
          Hemodiálise ( Tempo de máquina, Ultrafiltração e Saída )
        </label>
        <input
          id="nefro-hd-input"
          type="text"
          className="w-full text-xs border border-slate-200 bg-white rounded-lg p-2.5 outline-indigo-500"
          placeholder="Ex: Hemodiálise convencional, 4 horas, UF de 2000 mL, sem intercorrências / hipotensão."
          value={nefro.hemodialise}
          onChange={(e) => handleFieldChange('hemodialise', e.target.value)}
        />
      </div>

      {/* Renal Labs Row (with Cockcroft Gault GFR calculator helper) */}
      <div className="bg-slate-50/50 p-5 rounded-xl border border-slate-150">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
          <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-widest">Exames Bioquímicos e Eletrólitos</h3>
          <button
            id="calculate-tfg-cg-btn"
            type="button"
            disabled={!isTfgCalculable}
            onClick={handleEstimateTfg}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-semibold rounded-lg border transition ${
              isTfgCalculable 
                ? 'bg-indigo-50 border-indigo-200 text-indigo-600 hover:bg-indigo-100' 
                : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
            }`}
            title={isTfgCalculable ? 'Autocalcular TFG usando Cockcroft-Gault' : 'Necessário Idade, Peso, Sexo e Creatinina'}
          >
            <RefreshCw className="h-3 w-3" />
            Estimar TFG (Cockcroft-Gault)
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-4">
          {/* Ureia */}
          <div>
            <label htmlFor="lab-ureia" className="block text-[11px] font-medium text-slate-500 mb-1">Uréia (mg/dL)</label>
            <input
              id="lab-ureia"
              type="number"
              className="w-full text-xs border border-slate-200 bg-white rounded-lg p-2 outline-indigo-500 font-mono"
              placeholder="Ex: 55"
              value={nefro.ureia}
              onChange={(e) => handleFieldChange('ureia', e.target.value)}
            />
          </div>

          {/* Creatinina */}
          <div>
            <label htmlFor="lab-creat" className="block text-[11px] font-medium text-slate-500 mb-1">Creatinina (mg/dL)</label>
            <input
              id="lab-creat"
              type="number"
              step="0.01"
              className="w-full text-xs border border-slate-200 bg-white rounded-lg p-2 outline-indigo-500 font-mono"
              placeholder="Ex: 1.2"
              value={nefro.creat}
              onChange={(e) => handleFieldChange('creat', e.target.value)}
            />
          </div>

          {/* TFG */}
          <div>
            <label htmlFor="lab-tfg" className="block text-[11px] font-medium text-slate-500 mb-1">TFG (est. GFR)</label>
            <input
              id="lab-tfg"
              type="text"
              className="w-full text-xs border border-slate-200 bg-white rounded-lg p-2 outline-indigo-500 font-mono font-semibold"
              placeholder="Calculada..."
              value={nefro.tfg}
              onChange={(e) => handleFieldChange('tfg', e.target.value)}
            />
          </div>

          {/* Sódio */}
          <div>
            <label htmlFor="lab-na" className="block text-[11px] font-medium text-slate-500 mb-1">Sódio Na+ (mEq/L)</label>
            <input
              id="lab-na"
              type="number"
              className="w-full text-xs border border-slate-200 bg-white rounded-lg p-2 outline-indigo-500 font-mono"
              placeholder="Ex: 138"
              value={nefro.na}
              onChange={(e) => handleFieldChange('na', e.target.value)}
            />
          </div>

          {/* Potassio */}
          <div>
            <label htmlFor="lab-k" className="block text-[11px] font-medium text-slate-500 mb-1">Potássio K+ (mEq/L)</label>
            <input
              id="lab-k"
              type="number"
              step="0.1"
              className="w-full text-xs border border-slate-200 bg-white rounded-lg p-2 outline-indigo-500 font-mono"
              placeholder="Ex: 4.1"
              value={nefro.k}
              onChange={(e) => handleFieldChange('k', e.target.value)}
            />
          </div>

          {/* Calcio */}
          <div>
            <label htmlFor="lab-ca" className="block text-[11px] font-medium text-slate-500 mb-1">Cálcio Ca2+ (mg/dL)</label>
            <input
              id="lab-ca"
              type="number"
              step="0.1"
              className="w-full text-xs border border-slate-200 bg-white rounded-lg p-2 outline-indigo-500 font-mono"
              placeholder="Ex: 8.8"
              value={nefro.ca}
              onChange={(e) => handleFieldChange('ca', e.target.value)}
            />
          </div>

          {/* Fosforo */}
          <div>
            <label htmlFor="lab-p" className="block text-[11px] font-medium text-slate-500 mb-1">Fósforo P (mg/dL)</label>
            <input
              id="lab-p"
              type="number"
              step="0.1"
              className="w-full text-xs border border-slate-200 bg-white rounded-lg p-2 outline-indigo-500 font-mono"
              placeholder="Ex: 3.5"
              value={nefro.p}
              onChange={(e) => handleFieldChange('p', e.target.value)}
            />
          </div>

          {/* Magnesio */}
          <div>
            <label htmlFor="lab-mg" className="block text-[11px] font-medium text-slate-500 mb-1">Magnésio Mg (mg/dL)</label>
            <input
              id="lab-mg"
              type="number"
              step="0.1"
              className="w-full text-xs border border-slate-200 bg-white rounded-lg p-2 outline-indigo-500 font-mono"
              placeholder="Ex: 2.1"
              value={nefro.mg}
              onChange={(e) => handleFieldChange('mg', e.target.value)}
            />
          </div>
        </div>

        {!isTfgCalculable && nefro.creat && (
          <p className="text-[10px] text-slate-400 italic">
            * Para calcular a Taxa de Filtração Glomerular (TFG) por Cockcroft-Gault estimativa, preencha: Idade, Peso e Sexo do paciente na Seção 1.
          </p>
        )}
      </div>
    </div>
  );
}
