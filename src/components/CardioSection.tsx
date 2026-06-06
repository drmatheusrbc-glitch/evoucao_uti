import React from 'react';
import { CardiovascularInfo, DvaRow } from '../types';
import { MOTTLING_OPTIONS, interpretMottling, calculateDvaDose } from '../utils/calculators';
import { Plus, Trash2, Heart, Scale, ShieldAlert } from 'lucide-react';

interface CardioSectionProps {
  cardio: CardiovascularInfo;
  patientWeight: string;
  onChangeCardio: (field: keyof CardiovascularInfo, value: any) => void;
}

export default function CardioSection({ cardio, patientWeight, onChangeCardio }: CardioSectionProps) {

  const handleFieldChange = (field: keyof Omit<CardiovascularInfo, 'dvas'>, value: any) => {
    onChangeCardio(field, value);
  };

  const handleAddDva = () => {
    const id = Math.random().toString(36).substring(3, 8);
    const newDva: DvaRow = {
      id,
      dva: '',
      concentracao: '',
      concentracaoUnidade: 'mg/mL',
      mlh: '',
      doseUnidade: 'mcg/kg/min',
      dose: ''
    };
    const updatedDvas = [...cardio.dvas, newDva];
    onChangeCardio('dvas', updatedDvas);
  };

  const handleRemoveDva = (id: string) => {
    const updatedDvas = cardio.dvas.filter(d => d.id !== id);
    onChangeCardio('dvas', updatedDvas);
  };

  const handleDvaRowChange = (id: string, col: keyof DvaRow, val: string) => {
    const updatedDvas = cardio.dvas.map(d => {
      if (d.id !== id) return d;
      const updatedRow = { ...d, [col]: val };

      // Compute estimated dose in real-time
      const calculated = calculateDvaDose(
        patientWeight,
        updatedRow.concentracao,
        updatedRow.concentracaoUnidade as any,
        updatedRow.mlh,
        updatedRow.doseUnidade as any
      );

      updatedRow.dose = calculated;
      return updatedRow;
    });

    onChangeCardio('dvas', updatedDvas);
  };

  const setAuscultaPreset = (text: string) => {
    handleFieldChange('auscultaCardiaca', text);
  };

  const setPulsosPreset = (text: string) => {
    handleFieldChange('pulsosPerifericos', text);
  };

  const mottlingInfo = interpretMottling(cardio.livedoMottling);

  return (
    <div id="cardio-section" className="bg-white rounded-xl p-6 border border-slate-200 mb-6 shadow-sm">
      <h2 id="cardiovascular-title" className="text-md font-sans font-semibold text-slate-800 tracking-tight flex items-center gap-2 border-b border-slate-100 pb-3 mb-5">
        <span className="flex items-center justify-center bg-indigo-50 text-indigo-600 rounded-lg h-7 w-7 text-xs font-bold font-mono">3</span>
        Cardiovascular & Hemodinâmica
      </h2>

      {/* Physics Assessment Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Ritmo Cardíaco */}
        <div>
          <label htmlFor="cardio-ritmo-select" className="block text-xs font-medium text-slate-500 mb-1">Ritmo Cardíaco</label>
          <select
            id="cardio-ritmo-select"
            value={cardio.ritmo}
            onChange={(e) => handleFieldChange('ritmo', e.target.value)}
            className="w-full text-xs border border-slate-200 bg-white rounded-lg p-2.5 outline-indigo-500"
          >
            <option value="">Selecione</option>
            <option value="Regular">Regular (Rítmico)</option>
            <option value="Irregular">Irregular (Arrítmico / FA)</option>
          </select>
        </div>

        {/* Capillary refill time */}
        <div>
          <label htmlFor="cardio-tec-input" className="block text-xs font-medium text-slate-500 mb-1">Tempo de Enchimento Capilar (TEC)</label>
          <div className="flex gap-1">
            <input
              id="cardio-tec-input"
              type="number"
              step="0.1"
              className="w-full text-xs border border-slate-200 bg-white rounded-lg p-2.5 outline-indigo-500 font-mono"
              placeholder="Ex: 2.5"
              value={cardio.tec}
              onChange={(e) => handleFieldChange('tec', e.target.value)}
            />
            <span className="flex items-center text-[10px] text-slate-400 bg-slate-105 border px-2.5 rounded-lg">segundos</span>
          </div>
        </div>

        {/* Temperatura Extremidades */}
        <div>
          <label htmlFor="cardio-temp-select" className="block text-xs font-medium text-slate-500 mb-1">Temp. Extremidades</label>
          <select
            id="cardio-temp-select"
            value={cardio.temperaturaExtremidades}
            onChange={(e) => handleFieldChange('temperaturaExtremidades', e.target.value)}
            className="w-full text-xs border border-slate-200 bg-white rounded-lg p-2.5 outline-indigo-500"
          >
            <option value="">Selecione</option>
            <option value="Quentes">Quentes (Bem perfundido)</option>
            <option value="Frias">Frias (Vasoespasmo / Choque)</option>
          </select>
        </div>

        {/* Edema de Extremidades */}
        <div>
          <label htmlFor="cardio-edema-select" className="block text-xs font-medium text-slate-500 mb-1">Edema de Extremidades</label>
          <select
            id="cardio-edema-select"
            value={cardio.edemaExtremidades}
            onChange={(e) => handleFieldChange('edemaExtremidades', e.target.value)}
            className="w-full text-xs border border-slate-200 bg-white rounded-lg p-2.5 outline-indigo-500"
          >
            <option value="Ausente">Ausente (Grau 0)</option>
            <option value="+">+ / 4+ (Irrisório)</option>
            <option value="++">++ / 4+ (Moderado)</option>
            <option value="+++">+++ / 4+ (Importante)</option>
            <option value="++++">++++ / 4+ (Anasarca/Drenando)</option>
          </select>
        </div>
      </div>

      {/* Cyanosis and Mottling Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 bg-slate-50 p-5 rounded-xl border border-slate-100 mb-6">
        <div>
          <label id="cardio-cianose-label" className="flex items-center gap-2.5 text-xs text-slate-700 font-medium cursor-pointer mt-2">
            <input
              id="cardio-cianose-checkbox"
              type="checkbox"
              className="rounded text-indigo-600 focus:ring-indigo-500 h-4.5 w-4.5"
              checked={cardio.cianose}
              onChange={(e) => handleFieldChange('cianose', e.target.checked)}
            />
            <div>
              <span className="font-semibold block text-slate-750">Presença de Cianose?</span>
              <span className="text-[10px] text-slate-400 font-normal">Extremidades azuladas (hipoxemia / vasoconstrição severa).</span>
            </div>
          </label>
        </div>

        <div className="md:col-span-2">
          <label htmlFor="cardio-mottling-select" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Escore de Livedo (Mottling Score)</label>
          <select
            id="cardio-mottling-select"
            value={cardio.livedoMottling}
            onChange={(e) => handleFieldChange('livedoMottling', e.target.value)}
            className="w-full text-xs border border-slate-200 bg-white rounded-lg p-2 outline-indigo-500 font-medium text-slate-800"
          >
            {MOTTLING_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          {cardio.livedoMottling && (
            <div id="mottling-feedback" className="mt-3.5 p-3.5 bg-slate-900 text-slate-100 rounded-lg text-xs leading-relaxed flex items-start gap-2.5">
              <ShieldAlert className="h-4.5 w-4.5 shrink-0 text-amber-500 mt-0.5" />
              <div>
                <strong className="text-white">{mottlingInfo.label}:</strong> {mottlingInfo.indication}
                <p className="text-[10px] text-slate-400 mt-0.5 italic">
                  {MOTTLING_OPTIONS.find(o => o.value === cardio.livedoMottling)?.desc}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Ausculta Cardíaca and Pulsos Periféricos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        <div>
          <label htmlFor="cardio-ausculta-input" className="block text-xs font-medium text-slate-500 mb-1">Ausculta Cardíaca</label>
          <input
            id="cardio-ausculta-input"
            type="text"
            className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-indigo-500"
            placeholder="Ex: RCR 2T BNF sem sopros."
            value={cardio.auscultaCardiaca}
            onChange={(e) => handleFieldChange('auscultaCardiaca', e.target.value)}
          />
          <div className="flex flex-wrap gap-1 mt-1.5">
            <button type="button" onClick={() => setAuscultaPreset('RCR 2T BNF sem sopros')} className="text-[10px] bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded px-2 py-0.5 font-medium">Básico Normal</button>
            <button type="button" onClick={() => setAuscultaPreset('RC irregular (FA) 2T BNF')} className="text-[10px] bg-amber-50 hover:bg-amber-100 text-amber-600 rounded px-2 py-0.5 font-medium">FA arrítmico</button>
            <button type="button" onClick={() => setAuscultaPreset('RCR 2T BNF com sopro sistólico ++/4+ em foco aórtico')} className="text-[10px] bg-rose-50 hover:bg-rose-100 text-rose-600 rounded px-2 py-0.5 font-medium">Sopro Aórtico</button>
          </div>
        </div>

        <div>
          <label htmlFor="cardio-pulsos-input" className="block text-xs font-medium text-slate-500 mb-1">Pulsos Periféricos</label>
          <input
            id="cardio-pulsos-input"
            type="text"
            className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-indigo-500"
            placeholder="Ex: Simétricos, amplos e cheios."
            value={cardio.pulsosPerifericos}
            onChange={(e) => handleFieldChange('pulsosPerifericos', e.target.value)}
          />
          <div className="flex flex-wrap gap-1 mt-1.5">
            <button type="button" onClick={() => setPulsosPreset('Simétricos e cheios bilateralmente')} className="text-[10px] bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded px-2 py-0.5 font-medium">Normal de Livro</button>
            <button type="button" onClick={() => setPulsosPreset('Finose e filiformes em extremidades')} className="text-[10px] bg-rose-50 hover:bg-rose-100 text-rose-600 rounded px-2 py-0.5 font-medium">Hipofluxo / Finos</button>
            <button type="button" onClick={() => setPulsosPreset('Pulsos ausentes em membros inferiores (isquemia?)')} className="text-[10px] bg-red-50 hover:bg-red-100 text-red-600 rounded px-2 py-0.5 font-medium">Ausentes MMII</button>
          </div>
        </div>
      </div>

      {/* DVA Table (Drogas Vasoativas) */}
      <div className="border border-slate-150 rounded-xl overflow-hidden bg-white shadow-xs">
        <div className="flex items-center justify-between bg-slate-50 px-5 py-3 border-b border-slate-150">
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Heart className="h-4 w-4 text-rose-500" />
              Suporte com Drogas Vasoativas (DVA)
            </h3>
            <p className="text-[10px] text-slate-400">Insira valores para vazão e concentração. Se preenchido peso do paciente ({patientWeight ? `${patientWeight} kg` : 'não informado'}), a dosagem é auto-calculada.</p>
          </div>
          <button
            id="add-dva-row-btn"
            type="button"
            onClick={handleAddDva}
            className="flex items-center gap-1 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium transition"
          >
            <Plus className="h-3.5 w-3.5" />
            Adicionar Droga
          </button>
        </div>

        <div className="overflow-x-auto">
          {cardio.dvas.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">
              Nenhuma droga vasoativa ou sedativo em infusão registrado no momento. Clique em "Adicionar Droga" para registrar infusões contínuas.
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-semibold border-b">
                  <th className="p-3 w-1/3">Substância (Droga / Sedação)</th>
                  <th className="p-3">Concentração e Unidade</th>
                  <th className="p-3">Vazão (mL/h)</th>
                  <th className="p-3">Dosagem Calculada & Unidades de Dose</th>
                  <th className="p-3 text-center">Remover</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cardio.dvas.map(d => (
                  <tr key={d.id} className="hover:bg-slate-50/50">
                    <td className="p-3">
                      <input
                        id={`dva-name-input-${d.id}`}
                        type="text"
                        className="border border-slate-200 rounded p-2 text-xs w-full focus:bg-white outline-indigo-500 font-medium"
                        value={d.dva}
                        placeholder="Ex: Noradrenalina ou Midazolam"
                        onChange={(e) => handleDvaRowChange(d.id, 'dva', e.target.value)}
                      />
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <input
                          id={`dva-conc-input-${d.id}`}
                          type="number"
                          step="0.001"
                          className="border border-slate-200 rounded p-1 text-xs w-20 font-mono text-slate-700 focus:bg-white outline-indigo-500"
                          value={d.concentracao}
                          placeholder="Ex: 0.16"
                          onChange={(e) => handleDvaRowChange(d.id, 'concentracao', e.target.value)}
                        />
                        <select
                          id={`dva-conc-unit-select-${d.id}`}
                          aria-label="Unidade de Concentração"
                          value={d.concentracaoUnidade || 'mg/mL'}
                          onChange={(e) => handleDvaRowChange(d.id, 'concentracaoUnidade', e.target.value)}
                          className="text-[11px] border border-slate-200 bg-white rounded p-1 font-semibold"
                        >
                          <option value="mg/mL">mg/mL</option>
                          <option value="mcg/mL">mcg/mL</option>
                          <option value="UI/mL">UI/mL</option>
                        </select>
                      </div>
                    </td>
                    <td className="p-3">
                      <input
                        id={`dva-mlh-input-${d.id}`}
                        type="number"
                        step="0.1"
                        className="border border-slate-200 rounded p-1 text-xs w-20 font-mono font-semibold outline-indigo-500"
                        value={d.mlh}
                        placeholder="mL/h"
                        onChange={(e) => handleDvaRowChange(d.id, 'mlh', e.target.value)}
                      />
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1.5">
                        <div className="font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded text-xs min-w-[80px] text-center">
                          {d.dose || '0.00'}
                        </div>
                        <select
                          id={`dva-dose-unit-select-${d.id}`}
                          aria-label="Unidade de Dose Estimada"
                          value={d.doseUnidade || 'mcg/kg/min'}
                          onChange={(e) => handleDvaRowChange(d.id, 'doseUnidade', e.target.value)}
                          className="text-[11px] border border-slate-200 bg-white rounded p-1 font-semibold"
                        >
                          <option value="mcg/kg/min">mcg/kg/min</option>
                          <option value="mcg/kg/h">mcg/kg/h</option>
                          <option value="UI/min">UI/min</option>
                          <option value="mg/kg/h">mg/kg/h</option>
                          <option value="mg/kg/min">mg/kg/min</option>
                        </select>
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        id={`remove-dva-btn-${d.id}`}
                        type="button"
                        onClick={() => handleRemoveDva(d.id)}
                        className="p-1 px-2.5 text-rose-500 hover:bg-rose-50 rounded transition inline-flex items-center"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
