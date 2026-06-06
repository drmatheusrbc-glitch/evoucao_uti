import React from 'react';
import { GastrointestinalInfo, HematologyInfo, AntibiticoRow, CulturaRow, Profilaxias } from '../types';
import { Plus, Trash2, Shield, Calendar, Bug, HeartPulse, ShieldCheck, Thermometer } from 'lucide-react';

interface GIAndOthersProps {
  gi: GastrointestinalInfo;
  hemato: HematologyInfo;
  infectious: { antibioticos: AntibiticoRow[]; culturas: CulturaRow[] };
  profilaxias: Profilaxias;
  anotacoes: string;
  onChangeGI: (field: keyof GastrointestinalInfo, value: any) => void;
  onChangeHemato: (field: keyof HematologyInfo, value: any) => void;
  onChangeInfectious: (field: 'antibioticos' | 'culturas', value: any) => void;
  onChangeProfilaxias: (field: keyof Profilaxias, value: any) => void;
  onChangeAnotacoes: (value: string) => void;
}

export default function GIAndOthers({
  gi,
  hemato,
  infectious,
  profilaxias,
  anotacoes,
  onChangeGI,
  onChangeHemato,
  onChangeInfectious,
  onChangeProfilaxias,
  onChangeAnotacoes,
}: GIAndOthersProps) {

  // Handlers for GI
  const handleGIFieldChange = (field: keyof GastrointestinalInfo, value: any) => {
    onChangeGI(field, value);
  };

  const handleAbdomenCharChange = (char: 'flacido' | 'distendido' | 'doloroso' | 'indolor', val: boolean) => {
    const updatedChars = {
      ...gi.abdomeCaracteristicas,
      [char]: val
    };
    onChangeGI('abdomeCaracteristicas', updatedChars);
  };

  // Handlers for Hemato
  const handleHematoFieldChange = (field: keyof HematologyInfo, value: any) => {
    onChangeHemato(field, value);
  };

  // Antibiotics & Cultures
  const handleAddAtb = () => {
    const id = Math.random().toString(36).substring(3, 8);
    const newAtb: AntibiticoRow = {
      id,
      nome: 'Meropenem',
      d0: '01/06',
      diasTotais: '5'
    };
    onChangeInfectious('antibioticos', [...infectious.antibioticos, newAtb]);
  };

  const handleRemoveAtb = (id: string) => {
    onChangeInfectious('antibioticos', infectious.antibioticos.filter(a => a.id !== id));
  };

  const handleAtbRowChange = (id: string, col: keyof AntibiticoRow, val: string) => {
    const updated = infectious.antibioticos.map(a => {
      if (a.id === id) return { ...a, [col]: val };
      return a;
    });
    onChangeInfectious('antibioticos', updated);
  };

  const handleAddCultura = () => {
    const id = Math.random().toString(36).substring(3, 8);
    const newCult: CulturaRow = {
      id,
      data: '02/06',
      cultura: 'Hemocultura Central',
      resultado: 'Pendente'
    };
    onChangeInfectious('culturas', [...infectious.culturas, newCult]);
  };

  const handleRemoveCultura = (id: string) => {
    onChangeInfectious('culturas', infectious.culturas.filter(c => c.id !== id));
  };

  const handleCulturaRowChange = (id: string, col: keyof CulturaRow, val: string) => {
    const updated = infectious.culturas.map(c => {
      if (c.id === id) return { ...c, [col]: val };
      return c;
    });
    onChangeInfectious('culturas', updated);
  };

  // Profilaxias
  const handleProfilaxiaChange = (field: keyof Profilaxias, value: string) => {
    onChangeProfilaxias(field, value);
  };

  return (
    <div className="space-y-6">
      {/* SECTION 6: Nutrição e Trato Gastrointestinal */}
      <div id="gi-section" className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <h2 id="gi-title" className="text-md font-sans font-semibold text-slate-800 tracking-tight flex items-center gap-2 border-b border-slate-100 pb-3 mb-5">
          <span className="flex items-center justify-center bg-indigo-50 text-indigo-600 rounded-lg h-7 w-7 text-xs font-bold font-mono">6</span>
          Nutrição & Trato Gastrointestinal (TGI)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-5">
          {/* Abdome Checkboxes and RHA */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-150">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-widest mb-3">Exame de Abdômen</label>
            
            <div className="flex gap-3 mb-3">
              <label id="rha-plus-label" className="flex items-center gap-1.5 text-xs text-slate-700 font-medium cursor-pointer">
                <input
                  id="rha-plus-radio"
                  type="radio"
                  name="abdomenRha"
                  className="text-indigo-600 focus:ring-indigo-505"
                  checked={gi.abdomeRha === 'RHA+'}
                  onChange={() => handleGIFieldChange('abdomeRha', 'RHA+')}
                />
                <span>RHA+ (Presentes)</span>
              </label>
              <label id="rha-minus-label" className="flex items-center gap-1.5 text-xs text-slate-700 font-medium cursor-pointer">
                <input
                  id="rha-minus-radio"
                  type="radio"
                  name="abdomenRha"
                  className="text-indigo-600 focus:ring-indigo-505"
                  checked={gi.abdomeRha === 'RHA-'}
                  onChange={() => handleGIFieldChange('abdomeRha', 'RHA-')}
                />
                <span className="text-rose-600 hover:underline">RHA- (Ausentes / Íleo)</span>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-2 border-t border-slate-200 pt-3 text-xs">
              {(['flacido', 'distendido', 'doloroso', 'indolor'] as const).map(char => (
                <label id={`abdomen-char-label-${char}`} key={char} className="flex items-center gap-1.5 text-slate-750 capitalize cursor-pointer">
                  <input
                    id={`abdomen-char-checkbox-${char}`}
                    type="checkbox"
                    className="rounded text-indigo-600 h-4 w-4"
                    checked={!!gi.abdomeCaracteristicas[char]}
                    onChange={(e) => handleAbdomenCharChange(char, e.target.checked)}
                  />
                  <span>{char === 'flacido' ? 'Flácido' : char === 'distendido' ? 'Distendido' : char === 'doloroso' ? 'Doloroso' : 'Indolor'}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Dieta */}
          <div>
            <label htmlFor="gi-dieta-select" className="block text-xs font-medium text-slate-500 mb-1">Via de Alimentação / Dieta</label>
            <select
              id="gi-dieta-select"
              value={gi.dieta}
              onChange={(e) => handleGIFieldChange('dieta', e.target.value as any)}
              className="w-full text-xs border border-slate-200 bg-white rounded-lg p-2.5 outline-indigo-500 font-semibold text-slate-705"
            >
              <option value="">Selecione</option>
              <option value="Oral">Via Oral (Dieta Normal/Leve)</option>
              <option value="SNE">Sonda Nasoenteral (SNE)</option>
              <option value="GTT">Gastrostomia / Jejunostomia (GTT)</option>
              <option value="Parenteral">Nutrição Parenteral Total (NPT)</option>
            </select>

            {gi.dieta && gi.dieta !== 'Oral' && (
              <div id="enteral-diet-metrics" className="mt-3 grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-lg border">
                <div>
                  <label htmlFor="gi-vazao" className="block text-[10px] text-slate-400">Vazão</label>
                  <input
                    id="gi-vazao"
                    type="text"
                    className="w-full text-xs border border-slate-200 bg-white rounded p-1 font-mono"
                    placeholder="mL/h"
                    value={gi.vazao}
                    onChange={(e) => handleGIFieldChange('vazao', e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="gi-kcal" className="block text-[10px] text-slate-400">kcal/dia</label>
                  <input
                    id="gi-kcal"
                    type="text"
                    className="w-full text-xs border border-slate-200 bg-white rounded p-1 font-mono"
                    placeholder="kcal"
                    value={gi.kcal}
                    onChange={(e) => handleGIFieldChange('kcal', e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="gi-proteinas" className="block text-[10px] text-slate-400">Proteínas</label>
                  <input
                    id="gi-proteinas"
                    type="text"
                    className="w-full text-xs border border-slate-200 bg-white rounded p-1 font-mono"
                    placeholder="g/dia"
                    value={gi.proteinas}
                    onChange={(e) => handleGIFieldChange('proteinas', e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Diarreia / Evacuação */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 flex flex-col justify-between">
            <div>
              <label className="block text-xs font-semibold text-slate-750 uppercase tracking-widest mb-2.5">Trânsito Intestinal (Evacuações)</label>
              <div className="flex gap-4">
                <label id="evac-sim-label" className="flex items-center gap-1.5 text-xs text-slate-750 font-medium cursor-pointer">
                  <input
                    id="evac-sim-radio"
                    type="radio"
                    name="evacuacao"
                    className="text-indigo-600 focus:ring-indigo-505"
                    checked={gi.evacuacao === 'Sim'}
                    onChange={() => handleGIFieldChange('evacuacao', 'Sim')}
                  />
                  <span>Sim, presentes</span>
                </label>
                <label id="evac-nao-label" className="flex items-center gap-1.5 text-xs text-slate-750 font-medium cursor-pointer">
                  <input
                    id="evac-nao-radio"
                    type="radio"
                    name="evacuacao"
                    className="text-indigo-600 focus:ring-indigo-550"
                    checked={gi.evacuacao === 'Não'}
                    onChange={() => handleGIFieldChange('evacuacao', 'Não')}
                  />
                  <span>Não, obstipado</span>
                </label>
              </div>
            </div>

            {gi.evacuacao === 'Não' && (
              <div id="obstipation-days-box" className="mt-3 p-2 bg-white rounded-lg border flex items-center justify-between">
                <span className="text-[11px] text-slate-450 font-medium">Obstipado há:</span>
                <div className="flex items-center gap-1">
                  <input
                    id="gi-evacuacao-dias"
                    type="number"
                    className="border rounded p-1 text-xs w-16 text-center font-mono font-bold"
                    placeholder="0"
                    value={gi.evacuacaoDias}
                    onChange={(e) => handleGIFieldChange('evacuacaoDias', e.target.value)}
                  />
                  <span className="text-[10px] text-slate-400 font-medium font-mono">dias</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 7: Hematologia e Dispositivos */}
      <div id="hemato-section" className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <h2 id="hemato-title" className="text-md font-sans font-semibold text-slate-800 tracking-tight flex items-center gap-2 border-b border-slate-100 pb-3 mb-5">
          <span className="flex items-center justify-center bg-indigo-50 text-indigo-600 rounded-lg h-7 w-7 text-xs font-bold font-mono">7</span>
          Hematologia, Coagulação & Dispositivos Invasivos
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          {/* Active Bleeding check */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-150">
            <label className="block text-xs font-semibold text-slate-750 uppercase tracking-widest mb-2.5">Sinais de Sangramento Ativo?</label>
            
            <div className="flex gap-4 mb-3">
              <label id="sangue-ausente-label" className="flex items-center gap-1.5 text-xs text-slate-750 font-semibold cursor-pointer">
                <input
                  id="sangue-ausente-radio"
                  type="radio"
                  name="sangramento"
                  className="text-indigo-600"
                  checked={hemato.sangramento === 'Ausente'}
                  onChange={() => handleHematoFieldChange('sangramento', 'Ausente')}
                />
                <span>Ausente</span>
              </label>
              <label id="sangue-presente-label" className="flex items-center gap-1.5 text-xs text-slate-750 font-semibold cursor-pointer">
                <input
                  id="sangue-presente-radio"
                  type="radio"
                  name="sangramento"
                  className="text-indigo-600"
                  checked={hemato.sangramento === 'Presente'}
                  onChange={() => handleHematoFieldChange('sangramento', 'Presente')}
                />
                <span className="text-rose-600 font-bold">Presente (Drenando/TGI)</span>
              </label>
            </div>

            {hemato.sangramento === 'Presente' && (
              <input
                id="hemato-sangue-local"
                type="text"
                className="w-full text-xs border border-slate-250 bg-white rounded p-2.5 mt-1"
                placeholder="Ex: Hemoptise moderada / Melena no frasco de sonda."
                value={hemato.sangramentoLocal}
                onChange={(e) => handleHematoFieldChange('sangramentoLocal', e.target.value)}
              />
            )}
          </div>

          {/* Lines and catheters */}
          <div>
            <label htmlFor="hemato-cateter-input" className="block text-xs font-medium text-slate-500 mb-1">Acessos Invasivos & Dia de Inserção</label>
            <textarea
              id="hemato-cateter-input"
              className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-indigo-500 font-mono h-24 resize-none"
              placeholder="Ex: CVC Subclávia D inserida em 01/06 (D5)&#10;Pam Radial E inserida em 02/06 (D4)"
              value={hemato.cateterDiaInsercao}
              onChange={(e) => handleHematoFieldChange('cateterDiaInsercao', e.target.value)}
            />
          </div>
        </div>

        {/* Labs block hemato */}
        <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
          <h3 className="text-xs font-semibold text-slate-705 uppercase tracking-widest mb-3.5 flex items-center gap-1">
            <HeartPulse className="h-4 w-4 text-emerald-600" />
            Bioquímica Coagulação / Hemograma
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-3.5">
            <div>
              <label htmlFor="lab-hb" className="block text-[11px] font-medium text-slate-500 mb-0.5">Hemoglobina HB</label>
              <input
                id="lab-hb"
                type="text"
                placeholder="g/dL"
                className="w-full text-xs border border-slate-200 bg-white rounded p-2 text-center font-mono font-semibold"
                value={hemato.hb}
                onChange={(e) => handleHematoFieldChange('hb', e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="lab-ht" className="block text-[11px] font-medium text-slate-500 mb-0.5">Hematócrito HT</label>
              <input
                id="lab-ht"
                type="text"
                placeholder="%"
                className="w-full text-xs border border-slate-200 bg-white rounded p-2 text-center font-mono font-semibold"
                value={hemato.ht}
                onChange={(e) => handleHematoFieldChange('ht', e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="lab-plaqu" className="block text-[11px] font-medium text-slate-500 mb-0.5">Plaquetas</label>
              <input
                id="lab-plaqu"
                type="text"
                placeholder="/uL"
                className="w-full text-xs border border-slate-200 bg-white rounded p-2 text-center font-mono font-semibold"
                value={hemato.plaqueta}
                onChange={(e) => handleHematoFieldChange('plaqueta', e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="lab-leuco" className="block text-[11px] font-medium text-slate-500 mb-0.5">Leucócitos</label>
              <input
                id="lab-leuco"
                type="text"
                placeholder="/uL"
                className="w-full text-xs border border-slate-200 bg-white rounded p-2 text-center font-mono font-semibold"
                value={hemato.leucocitos}
                onChange={(e) => handleHematoFieldChange('leucocitos', e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="lab-bast" className="block text-[11px] font-medium text-slate-500 mb-0.5">Bastões (%)</label>
              <input
                id="lab-bast"
                type="text"
                placeholder="%"
                className="w-full text-xs border border-slate-200 bg-white rounded p-2 text-center font-mono font-semibold"
                value={hemato.bastao}
                onChange={(e) => handleHematoFieldChange('bastao', e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="lab-irn" className="block text-[11px] font-medium text-slate-500 mb-0.5">TAP / INR</label>
              <input
                id="lab-irn"
                type="text"
                placeholder="Ratio"
                className="w-full text-xs border border-slate-200 bg-white rounded p-2 text-center font-mono font-semibold"
                value={hemato.irn}
                onChange={(e) => handleHematoFieldChange('irn', e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 8: Antibióticos & Culturas */}
      <div id="infectious-section" className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <h2 id="infectious-title" className="text-md font-sans font-semibold text-slate-800 tracking-tight flex items-center gap-2 border-b border-slate-100 pb-3 mb-5">
          <span className="flex items-center justify-center bg-indigo-50 text-indigo-600 rounded-lg h-7 w-7 text-xs font-bold font-mono">8</span>
          Disfunção Infecciosa, Antibióticos & Culturas
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active ATBs */}
          <div className="border border-slate-150 rounded-xl overflow-hidden bg-white">
            <div className="flex items-center justify-between bg-slate-50 px-4 py-3 border-b">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Bug className="h-4 w-4 text-indigo-500" />
                Antibioticoterapia Ativa ( ATB )
              </span>
              <button
                id="add-atb-row-btn"
                type="button"
                onClick={handleAddAtb}
                className="flex items-center gap-1 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold transition"
              >
                <Plus className="h-3 w-3" />
                Adicionar ATB
              </button>
            </div>

            <div className="overflow-x-auto">
              {infectious.antibioticos.length === 0 ? (
                <p className="p-5 text-center text-xs text-slate-400">Nenhum antibiótico infundindo no momento.</p>
              ) : (
                <table className="w-full text-left text-[11px] border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 border-b">
                      <th className="p-2">Antibiótico</th>
                      <th className="p-2">Dia Zero (D0)</th>
                      <th className="p-2">Dias de Uso</th>
                      <th className="p-2 text-center">Remover</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {infectious.antibioticos.map(a => (
                      <tr key={a.id}>
                        <td className="p-2">
                          <input
                            id={`atb-nome-${a.id}`}
                            aria-label="Nome do Antibiótico"
                            type="text"
                            className="border border-slate-200 rounded p-1 w-full text-[11px]"
                            value={a.nome}
                            onChange={(e) => handleAtbRowChange(a.id, 'nome', e.target.value)}
                          />
                        </td>
                        <td className="p-2">
                          <input
                            id={`atb-d0-${a.id}`}
                            aria-label="Dia Zero"
                            type="text"
                            className="border border-slate-200 rounded p-1 w-full text-[11px]"
                            value={a.d0}
                            onChange={(e) => handleAtbRowChange(a.id, 'd0', e.target.value)}
                          />
                        </td>
                        <td className="p-2">
                          <input
                            id={`atb-diastot-${a.id}`}
                            aria-label="Dias Totais"
                            type="number"
                            className="border border-slate-200 rounded p-1 w-16 text-[11px] text-center"
                            value={a.diasTotais}
                            onChange={(e) => handleAtbRowChange(a.id, 'diasTotais', e.target.value)}
                          />
                        </td>
                        <td className="p-2 text-center">
                          <button
                            id={`remove-atb-${a.id}`}
                            type="button"
                            onClick={() => handleRemoveAtb(a.id)}
                            className="text-rose-500 hover:bg-rose-50 p-1 rounded"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Active Cultures */}
          <div className="border border-slate-150 rounded-xl overflow-hidden bg-white">
            <div className="flex items-center justify-between bg-slate-50 px-4 py-3 border-b">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Thermometer className="h-4 w-4 text-indigo-500" />
                Painel de Culturas Laboratoriais
              </span>
              <button
                id="add-culture-row-btn"
                type="button"
                onClick={handleAddCultura}
                className="flex items-center gap-1 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold transition"
              >
                <Plus className="h-3 w-3" />
                Coletar Cultura
              </button>
            </div>

            <div className="overflow-x-auto">
              {infectious.culturas.length === 0 ? (
                <p className="p-5 text-center text-xs text-slate-400">Nenhuma cultura inserida.</p>
              ) : (
                <table className="w-full text-left text-[11px] border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 border-b">
                      <th className="p-2">Data Coleta</th>
                      <th className="p-2">Sítio / Cultura</th>
                      <th className="p-2">Resultado / Bactéria</th>
                      <th className="p-2 text-center">Remover</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {infectious.culturas.map(c => (
                      <tr key={c.id}>
                        <td className="p-2">
                          <input
                            id={`culture-data-${c.id}`}
                            aria-label="Data da Cultura"
                            type="text"
                            className="border border-slate-200 rounded p-1 w-full text-[11px]"
                            value={c.data}
                            onChange={(e) => handleCulturaRowChange(c.id, 'data', e.target.value)}
                          />
                        </td>
                        <td className="p-2">
                          <input
                            id={`culture-nome-${c.id}`}
                            aria-label="Nome da Cultura"
                            type="text"
                            className="border border-slate-200 rounded p-1 w-full text-[11px]"
                            value={c.cultura}
                            onChange={(e) => handleCulturaRowChange(c.id, 'cultura', e.target.value)}
                          />
                        </td>
                        <td className="p-2">
                          <input
                            id={`culture-result-${c.id}`}
                            aria-label="Resultado da Cultura"
                            type="text"
                            className="border border-slate-200 rounded p-1 w-full text-[11px] font-semibold text-slate-700"
                            value={c.resultado}
                            placeholder="Pendente..."
                            onChange={(e) => handleCulturaRowChange(c.id, 'resultado', e.target.value)}
                          />
                        </td>
                        <td className="p-2 text-center">
                          <button
                            id={`remove-culture-${c.id}`}
                            type="button"
                            onClick={() => handleRemoveCultura(c.id)}
                            className="text-rose-500 hover:bg-rose-50 p-1 rounded"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
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
      </div>

      {/* SECTION 9: Profilaxias */}
      <div id="profilaxias-section" className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <h2 id="profilaxias-title" className="text-md font-sans font-semibold text-slate-800 tracking-tight flex items-center gap-2 border-b border-slate-100 pb-3 mb-5">
          <span className="flex items-center justify-center bg-indigo-50 text-indigo-600 rounded-lg h-7 w-7 text-xs font-bold font-mono">9</span>
          Profilaxias de Beira-Leito ( Checklist de Qualidade )
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* TVP */}
          <div>
            <label htmlFor="pref-tvp" className="block text-xs font-medium text-slate-550 mb-1">Prevenção TVP</label>
            <input
              id="pref-tvp"
              type="text"
              className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-indigo-500"
              placeholder="Ex: Enoxaparina 40mg SC QD / Bota Compressora"
              value={profilaxias.tvp}
              onChange={(e) => handleProfilaxiaChange('tvp', e.target.value)}
            />
          </div>

          {/* Colirio */}
          <div>
            <label htmlFor="pref-colirio" className="block text-xs font-medium text-slate-550 mb-1">Proteção Ocular / Colírio</label>
            <input
              id="pref-colirio"
              type="text"
              className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-indigo-500"
              placeholder="Ex: Metilcelulose colírio de 4/4h (sedado)"
              value={profilaxias.colirio}
              onChange={(e) => handleProfilaxiaChange('colirio', e.target.value)}
            />
          </div>

          {/* Úlcera Gástrica */}
          <div>
            <label htmlFor="pref-gastrica" className="block text-xs font-medium text-slate-550 mb-1">Úlcera de Estresse Gástrica</label>
            <input
              id="pref-gastrica"
              type="text"
              className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-indigo-500"
              placeholder="Ex: Omeprazol 40mg IV QD"
              value={profilaxias.ulceraGastrica}
              onChange={(e) => handleProfilaxiaChange('ulceraGastrica', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* SECTION 10: Anotações Médicas Adicionais */}
      <div id="additional-clinical-notes-section" className="bg-slate-50 border border-slate-200 rounded-xl p-6 shadow-xs">
        <label htmlFor="additional-clinic-notes" className="block text-sm font-semibold text-slate-800 tracking-tight gap-1.5 flex items-center mb-2.5">
          <ShieldCheck className="h-5 w-5 text-indigo-500" />
          Anotações Médicas e Condutas Clínicas Adicionais ( Campo Livre )
        </label>
        <p className="text-xs text-slate-400 mb-3">
          Utilize esta caixa para descrever planos de conduta, parâmetros metabólicos, antibioticoterapias empíricas suplementares, discussões multiprofissionais ou desmames previstos para as próximas horas.
        </p>
        <textarea
          id="additional-clinic-notes"
          className="w-full border border-slate-250 bg-white rounded-xl p-4 text-xs font-sans text-slate-750 outline-indigo-500 h-32 focus:ring-1 focus:ring-indigo-105"
          placeholder="Ex: Paciente mantendo recuperação neurológica, planejado despertar diário amanhã se estabilidade hemodinâmica preservada. Discutido com a fisioterapia para iniciar protocolo de desmame ventilatório (teste de tubo T)."
          value={anotacoes}
          onChange={(e) => onChangeAnotacoes(e.target.value)}
        />
      </div>
    </div>
  );
}
