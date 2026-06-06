import React from 'react';
import { RespiratoryInfo, VentiladorSettings, PatientIdInfo } from '../types';
import { 
  calculateDrivingPressure, 
  calculateStaticCompliance, 
  calculateAirwayResistance, 
  calculateTimeConstant, 
  calculateTobin, 
  calculatePF, 
  interpretTobin, 
  interpretPF,
  calculateIdealWeight
} from '../utils/calculators';
import { Wind, Activity, Layers, HeartPulse } from 'lucide-react';

interface RespiroSectionProps {
  respiro: RespiratoryInfo;
  patient: PatientIdInfo;
  onChangeRespiro: (field: keyof RespiratoryInfo, value: any) => void;
}

export default function RespiroSection({ respiro, patient, onChangeRespiro }: RespiroSectionProps) {
  
  // Calculate Ideal Body Weight (IBW) based on height from header
  const pesoIdeal = calculateIdealWeight(patient.altura, patient.sexo);
  const vcVal = parseFloat(respiro.ventilador.volumeCorrente);
  const vcMlingIdeal = pesoIdeal && !isNaN(vcVal) ? Math.round((vcVal / pesoIdeal) * 10) / 10 : null;

  // Calculate respiratory cycle times dynamically
  const frVal = parseFloat(respiro.ventilador.fr);
  const relIE = respiro.ventilador.relacaoIE;
  
  let tTotSec: number | null = null;
  let tInsSec: number | null = null;
  let tExpSec: number | null = null;

  if (frVal > 0 && relIE) {
    const parts = relIE.split(':');
    let ieExp = 2; // Default/frequent 1:2 ratio exp factor
    if (parts.length === 2) {
      const parsedExp = parseFloat(parts[1]);
      if (!isNaN(parsedExp) && parsedExp > 0) ieExp = parsedExp;
    } else {
      const numericIE = parseFloat(relIE);
      if (!isNaN(numericIE) && numericIE > 0) ieExp = numericIE;
    }

    tTotSec = 60 / frVal;
    tInsSec = tTotSec / (1 + ieExp);
    tExpSec = tTotSec - tInsSec;
  }

  const handleFieldChange = (field: keyof Omit<RespiratoryInfo, 'ventilador' | 'gasometria'>, value: any) => {
    onChangeRespiro(field, value);
  };

  const handleSupportTypeChange = (type: RespiratoryInfo['tipoSuporte']) => {
    handleFieldChange('tipoSuporte', type);
  };

  const handleVentChange = (field: keyof VentiladorSettings, value: string) => {
    const updatedVent = {
      ...respiro.ventilador,
      [field]: value
    };

    // Calculate Driving Pressure
    const pPlato = field === 'pplato' ? value : updatedVent.pplato;
    const peep = field === 'peep' ? value : updatedVent.peep;
    const dp = calculateDrivingPressure(pPlato, peep);
    updatedVent.dp = dp;

    // Calculate Static Compliance
    const vc = field === 'volumeCorrente' ? value : updatedVent.volumeCorrente;
    const cst = calculateStaticCompliance(vc, pPlato, peep);
    updatedVent.complacenciaEst = cst;

    // Calculate Airway Resistance
    const pPico = field === 'ppico' ? value : updatedVent.ppico;
    const fluxo = field === 'fluxo' ? value : updatedVent.fluxo;
    const arResistance = calculateAirwayResistance(pPico, pPlato, fluxo);
    updatedVent.pressaoResistiva = arResistance;

    // Calculate Time Constant
    const tc = calculateTimeConstant(cst, arResistance);
    updatedVent.constanteTempo = tc;

    // Calculate Tobin (RSBI)
    const fr = field === 'fr' ? value : updatedVent.fr;
    const tobin = calculateTobin(fr, vc);
    updatedVent.tobin = tobin;

    // Calculate P/F Ratio based on gasometry PO2 and ventilator FiO2
    const po2 = respiro.gasometria.po2;
    const fio2 = field === 'fio2' ? value : updatedVent.fio2;
    const pf = calculatePF(po2, fio2);
    updatedVent.relacaoPF = pf;

    onChangeRespiro('ventilador', updatedVent);
  };

  const handleGasChange = (field: string, value: string) => {
    const updatedGas = {
      ...respiro.gasometria,
      [field]: value
    };

    const updatedRespiro = {
      ...respiro,
      gasometria: updatedGas
    };

    // Recalculate P/F ratio in ventilator settings when Gasometria PO2 changes
    const po2 = field === 'po2' ? value : respiro.gasometria.po2;
    const fio2 = respiro.ventilador.fio2 || '21'; // default room air FiO2
    const pf = calculatePF(po2, fio2);

    const updatedVent = {
      ...respiro.ventilador,
      relacaoPF: pf
    };

    onChangeRespiro('gasometria', updatedGas);
    onChangeRespiro('ventilador', updatedVent);
  };

  const isMechanicalVentEnabled = respiro.tipoSuporte === 'IOT' || respiro.tipoSuporte === 'Traqueostomia';

  return (
    <div id="respiratory-section" className="bg-white rounded-xl p-6 border border-slate-200 mb-6 shadow-sm">
      <h2 id="respiratory-title" className="text-md font-sans font-semibold text-slate-800 tracking-tight flex items-center gap-2 border-b border-slate-100 pb-3 mb-5">
        <span className="flex items-center justify-center bg-indigo-50 text-indigo-600 rounded-lg h-7 w-7 text-xs font-bold font-mono">4</span>
        Via Aérea, Respiratório & Gasometria
      </h2>

      {/* Dispositivo de Suporte Respiratório */}
      <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 mb-6 font-medium">
        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-widest mb-3">Suporte Respiratório Atual</label>
        
        <div id="support-type-pills" className="flex flex-wrap gap-2 mb-4">
          {(['Ar Ambiente', 'IOT', 'Traqueostomia', 'Cateter/Venturi'] as const).map(type => (
            <button
              id={`select-support-${type.replace(/\//g, '-')}`}
              key={type}
              type="button"
              onClick={() => handleSupportTypeChange(type)}
              className={`py-2 px-4 rounded-lg text-xs font-semibold tracking-wider transition ${
                respiro.tipoSuporte === type 
                  ? 'bg-indigo-600 text-white shadow-sm font-bold' 
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {type === 'IOT' ? '( ) IOT' : type === 'Traqueostomia' ? '( ) TRAQUEO' : type === 'Cateter/Venturi' ? '( ) CATETER / VENTURI' : '( ) AR AMBIENTE'}
            </button>
          ))}
        </div>

        {/* Conditional support fields */}
        {respiro.tipoSuporte === 'IOT' && (
          <div id="iot-details-box" className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-4 rounded-lg border border-slate-150">
            <div>
              <label htmlFor="iot-data-input" className="block text-xs font-medium text-slate-500 mb-1">Data de Intubação</label>
              <input
                id="iot-data-input"
                type="text"
                className="w-full text-xs border border-slate-250 rounded-lg p-2 outline-indigo-500"
                placeholder="Ex DD/MM"
                value={respiro.iotData}
                onChange={(e) => handleFieldChange('iotData', e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="iot-rima-input" className="block text-xs font-medium text-slate-500 mb-1">Marcação Rima ( cm na arcada dentária )</label>
              <input
                id="iot-rima-input"
                type="text"
                className="w-full text-xs border border-slate-250 rounded-lg p-2 outline-indigo-500 font-mono"
                placeholder="Ex: 22"
                value={respiro.iotRima}
                onChange={(e) => handleFieldChange('iotRima', e.target.value)}
              />
            </div>
          </div>
        )}

        {respiro.tipoSuporte === 'Traqueostomia' && (
          <div id="traqueo-details-box" className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-4 rounded-lg border border-slate-150">
            <div>
              <label htmlFor="traqueo-data-input" className="block text-xs font-medium text-slate-500 mb-1">Data da Traqueostomia</label>
              <input
                id="traqueo-data-input"
                type="text"
                className="w-full text-xs border border-slate-250 rounded-lg p-2 outline-indigo-500"
                placeholder="Ex DD/MM"
                value={respiro.traqueoData}
                onChange={(e) => handleFieldChange('traqueoData', e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="traqueo-canula-input" className="block text-xs font-medium text-slate-500 mb-1">Cânula ( Tipo e Número )</label>
              <input
                id="traqueo-canula-input"
                type="text"
                className="w-full text-xs border border-slate-250 rounded-lg p-2 outline-indigo-500 font-mono"
                placeholder="Ex: Shiley nº 8 c/ cuff"
                value={respiro.traqueoCanula}
                onChange={(e) => handleFieldChange('traqueoCanula', e.target.value)}
              />
            </div>
          </div>
        )}

        {respiro.tipoSuporte === 'Cateter/Venturi' && (
          <div id="cateter-details-box" className="bg-white p-4 rounded-lg border border-slate-150 max-w-sm">
            <label htmlFor="cateter-o2-flow" className="block text-xs font-medium text-slate-500 mb-1">Vazão de Oxigênio ( L/min )</label>
            <div className="flex gap-2">
              <input
                id="cateter-o2-flow"
                type="text"
                className="w-full text-xs border border-slate-250 rounded-lg p-2 outline-indigo-500 font-mono font-semibold"
                placeholder="Ex: 3"
                value={respiro.cateterVariavel}
                onChange={(e) => handleFieldChange('cateterVariavel', e.target.value)}
              />
              <span className="flex items-center text-xs text-slate-450 bg-slate-50 border px-3 rounded-lg py-1 font-semibold">L/min</span>
            </div>
          </div>
        )}
      </div>

      {/* Padrão Ventilatório e Ausculta */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label htmlFor="respiro-padrao-input" className="block text-xs font-medium text-slate-500 mb-1">Padrão Ventilatório</label>
          <input
            id="respiro-padrao-input"
            type="text"
            className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-indigo-500"
            placeholder="Ex: Eupneico, sem esforço respiratório."
            value={respiro.padraoVentilatorio}
            onChange={(e) => handleFieldChange('padraoVentilatorio', e.target.value)}
          />
        </div>

        {/* Ausculta Pulmonar Checkboxes */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-150">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-widest mb-3">Ausculta Pulmonar</label>
          
          <div className="space-y-3 mb-4">
            <span className="block text-xs font-medium text-slate-500">Murmúrio Vesicular (MV):</span>
            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="radio"
                  name="mv-ausculta"
                  className="text-indigo-650 focus:ring-indigo-550 h-4 w-4"
                  checked={respiro.mvPresente === true}
                  onChange={() => {
                    handleFieldChange('mvPresente', true);
                    handleFieldChange('mvDiminuidoLado', '');
                  }}
                />
                <span>MV Presente Bilateralmente</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="radio"
                  name="mv-ausculta"
                  className="text-indigo-650 focus:ring-indigo-550 h-4 w-4"
                  checked={respiro.mvPresente === false}
                  onChange={() => handleFieldChange('mvPresente', false)}
                />
                <span>MV Diminuído</span>
              </label>
            </div>

            {respiro.mvPresente === false && (
              <div className="mt-2 flex items-center gap-2 animate-fade-in">
                <span className="text-[11px] text-slate-500">Lado / Região afetada:</span>
                <select
                  id="mv-diminuido-lado-select"
                  className="bg-white border border-slate-200 rounded p-1 text-xs w-36 outline-indigo-500"
                  value={respiro.mvDiminuidoLado || ''}
                  onChange={(e) => handleFieldChange('mvDiminuidoLado', e.target.value)}
                >
                  <option value="">Selecione o Lado</option>
                  <option value="Base Esquerda">Base Esquerda</option>
                  <option value="Base Direita">Base Direita</option>
                  <option value="Hemitórax Esquerdo">Todo Hemitórax Esquerdo</option>
                  <option value="Hemitórax Direito">Todo Hemitórax Direito</option>
                  <option value="Bilateralmente Diminuído">Bilateralmente Diminuído</option>
                  <option value="Bases Pulmonares">Ambas as Bases</option>
                  <option value="Ápice Esquerdo">Ápice Esquerdo</option>
                  <option value="Ápice Direito">Ápice Direito</option>
                </select>
                <input
                  type="text"
                  placeholder="Ou descreva..."
                  className="border border-slate-200 bg-white rounded p-1 text-xs w-28 outline-indigo-500"
                  value={respiro.mvDiminuidoLado || ''}
                  onChange={(e) => handleFieldChange('mvDiminuidoLado', e.target.value)}
                />
              </div>
            )}
          </div>

          <div className="space-y-2 border-t border-slate-200 pt-3 text-xs text-slate-650">
            <span className="block font-medium text-slate-500 pb-1">Ruídos Adventícios (Lado / Região):</span>
            
            {/* Crepitações */}
            <div className="flex items-center justify-between">
              <span className="font-semibold">Crepitação</span>
              <input
                id="respiro-crepitacao-input"
                type="text"
                className="border border-slate-250 bg-white rounded p-1 text-xs w-36 outline-indigo-500"
                placeholder="Ex: Ausente, Base D..."
                value={respiro.crepitacaoLado}
                onChange={(e) => handleFieldChange('crepitacaoLado', e.target.value)}
              />
            </div>
            {/* Estertor */}
            <div className="flex items-center justify-between">
              <span className="font-semibold">Estertor</span>
              <input
                id="respiro-estertor-input"
                type="text"
                className="border border-slate-250 bg-white rounded p-1 text-xs w-36 outline-indigo-500"
                placeholder="Ex: Ausente, Bilateral..."
                value={respiro.estertorLado}
                onChange={(e) => handleFieldChange('estertorLado', e.target.value)}
              />
            </div>
            {/* Sibilo */}
            <div className="flex items-center justify-between">
              <span className="font-semibold">Sibilo</span>
              <input
                id="respiro-sibilo-input"
                type="text"
                className="border border-slate-250 bg-white rounded p-1 text-xs w-36 outline-indigo-500"
                placeholder="Ex: Ausente, Difuso..."
                value={respiro.sibiloLado}
                onChange={(e) => handleFieldChange('sibiloLado', e.target.value)}
              />
            </div>
            {/* Ronco */}
            <div className="flex items-center justify-between">
              <span className="font-semibold">Ronco</span>
              <input
                id="respiro-ronco-input"
                type="text"
                className="border border-slate-250 bg-white rounded p-1 text-xs w-36 outline-indigo-500"
                placeholder="Ex: Ausente, Difuso..."
                value={respiro.roncoLado}
                onChange={(e) => handleFieldChange('roncoLado', e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Ventilator Settings dashboard - Expandable / conditional highlighting if Mechanical Vent Active */}
      <div className={`border border-slate-200 rounded-xl overflow-hidden mb-6 ${
        isMechanicalVentEnabled ? 'ring-1 ring-indigo-500 shadow-sm' : 'opacity-75 bg-slate-50'
      }`}>
        <div className="flex items-center justify-between bg-slate-900 border-b border-slate-800 px-5 py-3 text-white">
          <div className="flex items-center gap-2">
            <Wind className="h-5 w-5 text-sky-400 animate-pulse" />
            <div>
              <h3 className="text-sm font-bold tracking-wide">Monitor de Parâmetros Ventilatórios</h3>
              <p className="text-[10px] text-slate-400">Insira as leituras aferidas no monitor do respirador à beira-leito.</p>
            </div>
          </div>
          <span className="text-[10px] uppercase font-mono font-semibold tracking-wider bg-slate-800 text-sky-305 px-2.5 py-1 rounded">
            {isMechanicalVentEnabled ? 'PACIENTE EM VM' : 'VM OPCIONAL'}
          </span>
        </div>

        <div className="p-5 grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-950 text-slate-100">
          {/* MODO */}
          <div>
            <label htmlFor="vent-modo" className="block text-[10px] text-slate-450 uppercase font-mono tracking-wider mb-1">MODO VENTILATÓRIO</label>
            <select
              id="vent-modo"
              value={respiro.ventilador.modo}
              onChange={(e) => handleVentChange('modo', e.target.value as any)}
              className="w-full text-xs font-mono border border-slate-800 bg-slate-900 rounded p-1.5 focus:outline-none focus:border-sky-500"
            >
              <option value="">Selecione</option>
              <option value="VCV">VCV (Volume Controlado)</option>
              <option value="PCV">PCV (Pressão Controlada)</option>
              <option value="PSV">PSV (Pressão de Suporte/Weaning)</option>
              <option value="VNI">VNI (Ventilação Não-Invasiva)</option>
              <option value="Outro">Outro Modo</option>
            </select>
          </div>

          {/* Volume Corrente */}
          <div>
            <label htmlFor="vent-vc" className="block text-[10px] text-slate-450 uppercase font-mono tracking-wider mb-1">Volume Corrente (mL)</label>
            <input
              id="vent-vc"
              type="number"
              className="w-full text-xs font-mono border border-slate-800 bg-slate-900 rounded p-1.5"
              placeholder="Ex: 420"
              value={respiro.ventilador.volumeCorrente}
              onChange={(e) => handleVentChange('volumeCorrente', e.target.value)}
            />
          </div>

          {/* FR */}
          <div>
            <label htmlFor="vent-fr" className="block text-[10px] text-slate-450 uppercase font-mono tracking-wider mb-1">FR respirador (irpm)</label>
            <input
              id="vent-fr"
              type="number"
              className="w-full text-xs font-mono border border-slate-800 bg-slate-900 rounded p-1.5"
              placeholder="Ex: 14"
              value={respiro.ventilador.fr}
              onChange={(e) => handleVentChange('fr', e.target.value)}
            />
          </div>

          {/* FIO2 */}
          <div>
            <label htmlFor="vent-fio2" className="block text-[10px] text-slate-450 uppercase font-mono tracking-wider mb-1">FiO2 (%)</label>
            <input
              id="vent-fio2"
              type="number"
              className="w-full text-xs font-mono border border-slate-800 bg-slate-900 rounded p-1.5"
              placeholder="Ex: 40"
              value={respiro.ventilador.fio2}
              onChange={(e) => handleVentChange('fio2', e.target.value)}
            />
          </div>

          {/* PEEP */}
          <div>
            <label htmlFor="vent-peep" className="block text-[10px] text-slate-450 uppercase font-mono tracking-wider mb-1">PEEP (cmH2O)</label>
            <input
              id="vent-peep"
              type="number"
              className="w-full text-xs font-mono border border-slate-800 bg-slate-900 rounded p-1.5"
              placeholder="Ex: 8"
              value={respiro.ventilador.peep}
              onChange={(e) => handleVentChange('peep', e.target.value)}
            />
          </div>

          {/* SENS */}
          <div>
            <label htmlFor="vent-sens" className="block text-[10px] text-slate-450 uppercase font-mono tracking-wider mb-1">Sensibilidade (SENS)</label>
            <input
              id="vent-sens"
              type="text"
              className="w-full text-xs font-mono border border-slate-800 bg-slate-900 rounded p-1.5"
              placeholder="Ex: 2.0 L/min"
              value={respiro.ventilador.sensibilidade}
              onChange={(e) => handleVentChange('sensibilidade', e.target.value)}
            />
          </div>

          {/* FLUXO */}
          <div>
            <label htmlFor="vent-fluxo" className="block text-[10px] text-slate-450 uppercase font-mono tracking-wider mb-1">Fluxo (L/min)</label>
            <input
              id="vent-fluxo"
              type="number"
              className="w-full text-xs font-mono border border-slate-800 bg-slate-900 rounded p-1.5"
              placeholder="Ex: 60"
              value={respiro.ventilador.fluxo}
              onChange={(e) => handleVentChange('fluxo', e.target.value)}
            />
          </div>

          {/* Volume Minuto */}
          <div>
            <label htmlFor="vent-vm" className="block text-[10px] text-slate-450 uppercase font-mono tracking-wider mb-1">Volume Minuto (L/min)</label>
            <input
              id="vent-vm"
              type="text"
              className="w-full text-xs font-mono border border-slate-800 bg-slate-900 rounded p-1.5"
              placeholder="Ex: 7.2"
              value={respiro.ventilador.volumeMinuto}
              onChange={(e) => handleVentChange('volumeMinuto', e.target.value)}
            />
          </div>

          {/* PPICO */}
          <div>
            <label htmlFor="vent-ppico" className="block text-[10px] text-slate-450 uppercase font-mono tracking-wider mb-1">P. Pico (PPICO) (cmH2O)</label>
            <input
              id="vent-ppico"
              type="number"
              className="w-full text-xs font-mono border border-slate-800 bg-slate-900 rounded p-1.5"
              placeholder="Ex: 22"
              value={respiro.ventilador.ppico}
              onChange={(e) => handleVentChange('ppico', e.target.value)}
            />
          </div>

          {/* PPLATO */}
          <div>
            <label htmlFor="vent-pplato" className="block text-[10px] text-slate-450 uppercase font-mono tracking-wider mb-1">P. Platô (PPLATO) (cmH2O)</label>
            <input
              id="vent-pplato"
              type="number"
              className="w-full text-xs font-mono border border-slate-800 bg-slate-900 rounded p-1.5"
              placeholder="Ex: 18"
              value={respiro.ventilador.pplato}
              onChange={(e) => handleVentChange('pplato', e.target.value)}
            />
          </div>

          {/* RELAÇAO I:E */}
          <div>
            <label htmlFor="vent-relie" className="block text-[10px] text-slate-450 uppercase font-mono tracking-wider mb-1">Relação I:E</label>
            <input
              id="vent-relie"
              type="text"
              className="w-full text-xs font-mono border border-slate-800 bg-slate-900 rounded p-1.5"
              placeholder="Ex: 1:2"
              value={respiro.ventilador.relacaoIE}
              onChange={(e) => handleVentChange('relacaoIE', e.target.value)}
            />
          </div>

          {/* AUTO-PEEP */}
          <div>
            <label htmlFor="vent-autopeep" className="block text-[10px] text-slate-450 uppercase font-mono tracking-wider mb-1">Auto-PEEP (C. Exp)</label>
            <input
              id="vent-autopeep"
              type="text"
              className="w-full text-xs font-mono border border-slate-800 bg-slate-900 rounded p-1.5"
              placeholder="Ex: 1"
              value={respiro.ventilador.autoPeep}
              onChange={(e) => handleVentChange('autoPeep', e.target.value)}
            />
          </div>

          {/* PRESSAO */}
          <div>
            <label htmlFor="vent-pressao" className="block text-[10px] text-slate-450 uppercase font-mono tracking-wider mb-1">Pressão (cmH2O)</label>
            <input
              id="vent-pressao"
              type="text"
              className="w-full text-xs font-mono border border-slate-800 bg-slate-900 rounded p-1.5"
              placeholder="Ex: 14"
              value={respiro.ventilador.pressao}
              onChange={(e) => handleVentChange('pressao', e.target.value)}
            />
          </div>

          {/* PRESSAO SUPORTE / BACKUP */}
          <div>
            <label htmlFor="vent-ps" className="block text-[10px] text-slate-450 uppercase font-mono tracking-wider mb-1">P. Suporte (PS) / BACKUP</label>
            <div className="flex gap-1.5">
              <input
                id="vent-ps"
                type="text"
                className="w-1/2 text-xs font-mono border border-slate-800 bg-slate-900 rounded p-1.5"
                placeholder="Ex: PS 12"
                value={respiro.ventilador.pressaoSuporte}
                onChange={(e) => handleVentChange('pressaoSuporte', e.target.value)}
              />
              <input
                id="vent-backup"
                type="text"
                className="w-1/2 text-xs font-mono border border-slate-800 bg-slate-900 rounded p-1.5"
                placeholder="Backup m/h"
                value={respiro.ventilador.backup}
                onChange={(e) => handleVentChange('backup', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Live-calculated values panel inside ventilator */}
        <div id="ventilator-calculations-dashboard" className="p-4 bg-slate-900 border-t border-slate-850 text-xs text-sky-200">
          <p className="text-[10px] text-sky-400 font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5 font-mono">
            <Layers className="h-4 w-4" />
            Cálculos de Mecânica Pulmonar, Proteção Alveolar & Tempos de Ciclo
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* DP */}
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 block font-semibold uppercase tracking-wider">DRIVING PRESSURE (DP)</span>
              <span className="font-mono text-base font-bold block text-white mt-0.5">
                {respiro.ventilador.dp !== null ? `${respiro.ventilador.dp} cmH2O` : '---'}
              </span>
              <span className={`text-[9px] block mt-1 hover:underline ${
                respiro.ventilador.dp !== null && respiro.ventilador.dp <= 15 ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {respiro.ventilador.dp !== null 
                  ? (respiro.ventilador.dp <= 15 ? 'Meta Protetora Atingida (<15)' : 'Perigo! Strain Alveolar Alto (>15)') 
                  : 'Requer Platô e PEEP'}
              </span>
            </div>

            {/* Static Compliance */}
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 block font-semibold uppercase tracking-wider">COMPLACÊNCIA ESTÁTICA (Cst)</span>
              <span className="font-mono text-base font-bold block text-white mt-0.5">
                {respiro.ventilador.complacenciaEst !== null ? `${respiro.ventilador.complacenciaEst} mL/cmH2O` : '---'}
              </span>
              <span className="text-[9px] text-slate-400 block mt-1">
                {respiro.ventilador.complacenciaEst !== null 
                  ? (respiro.ventilador.complacenciaEst >= 50 ? 'Complacência satisfatória' : 'Abaixo do recomendado (<50)') 
                  : 'Requer VC, Platô e PEEP'}
              </span>
            </div>

            {/* VC ALVO PROTETOR RELATIVO AO PESO IDEAL */}
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 block font-semibold uppercase tracking-wider">VC RELATIVO (PESO IDEAL)</span>
              <span className="font-mono text-base font-bold block text-white mt-0.5">
                {vcMlingIdeal !== null ? `${vcMlingIdeal} mL/kg` : '---'}
              </span>
              <span className={`text-[9px] block mt-1 ${
                vcMlingIdeal !== null && vcMlingIdeal <= 6.2 
                  ? 'text-emerald-400' 
                  : (vcMlingIdeal !== null && vcMlingIdeal <= 8.0 ? 'text-amber-400' : 'text-rose-400')
              }`}>
                {pesoIdeal !== null 
                  ? `Peso Ideal (Devine): ${pesoIdeal} kg ${vcMlingIdeal ? `(${vcMlingIdeal <= 6.2 ? 'Protetor ≤ 6' : vcMlingIdeal <= 8.0 ? 'Fisiológico ≤ 8' : 'Volutrauma > 8'})` : ''}`
                  : 'Informe Altura e Sexo no cabeçalho'}
              </span>
            </div>

            {/* RESPIRATORY CYCLE TIMES INFLUENCED BY RR & I:E */}
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 block font-semibold uppercase tracking-wider">TEMPO INSP / EXP (CICLO E I:E)</span>
              <span className="font-mono text-xs font-bold block text-white mt-0.5">
                {tInsSec !== null && tExpSec !== null 
                  ? `T.Insp: ${tInsSec.toFixed(2)}s | T.Exp: ${tExpSec.toFixed(2)}s` 
                  : '---'}
              </span>
              <span className="text-[9px] text-slate-400 block mt-1">
                {tTotSec !== null 
                  ? `Duração do Ciclo (Ttot): ${tTotSec.toFixed(1)}s (I:E ${relIE || '1:2'})` 
                  : 'Requer FR respirador e Relação I:E'}
              </span>
            </div>

            {/* Airway Resistance */}
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 block font-semibold uppercase tracking-wider">RESISTÊNCIA VIAS AÉREAS</span>
              <span className="font-mono text-base font-bold block text-white mt-0.5">
                {respiro.ventilador.pressaoResistiva !== null ? `${respiro.ventilador.pressaoResistiva} cmH2O/L/s` : '---'}
              </span>
              <span className="text-[9px] text-slate-400 block mt-1">
                {respiro.ventilador.constanteTempo !== null 
                  ? `C. Tempo: ${respiro.ventilador.constanteTempo}s (${respiro.ventilador.constanteTempo >= 0.5 && respiro.ventilador.constanteTempo <= 1.0 ? 'Apropriado' : 'Ajustar Exp.'})`
                  : 'Requer Pico, Platô e Fluxo'}
              </span>
            </div>

            {/* Tobin RSBI */}
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 block font-semibold uppercase tracking-wider">ÍNDICE DE TOBIN (RSBI)</span>
              <span className="font-mono text-base font-bold block text-white mt-0.5">
                {respiro.ventilador.tobin !== null ? `${respiro.ventilador.tobin}` : '---'}
              </span>
              <span className="text-[9px] text-slate-400 block mt-1">
                {respiro.ventilador.tobin !== null 
                  ? interpretTobin(respiro.ventilador.tobin).text.split('.')[0]
                  : 'Requer Fr e Vol Corrente'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Gasometria Form */}
      <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
        <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-widest mb-4 flex items-center gap-1.5">
          <HeartPulse className="h-4 w-4 text-indigo-500 animate-pulse" />
          Gasometria Arterial Atômica ( Recente )
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {/* PH */}
          <div>
            <label htmlFor="gas-ph" className="block text-xs font-medium text-slate-500 mb-1">pH</label>
            <input
              id="gas-ph"
              type="text"
              className="w-full text-xs font-mono font-semibold border border-slate-250 bg-white rounded-lg p-2 outline-indigo-500"
              placeholder="Ex: 7.35"
              value={respiro.gasometria.ph}
              onChange={(e) => handleGasChange('ph', e.target.value)}
            />
          </div>

          {/* PO2 */}
          <div>
            <label htmlFor="gas-po2" className="block text-xs font-medium text-slate-500 mb-1">pO2 (mmHg)</label>
            <input
              id="gas-po2"
              type="number"
              className="w-full text-xs font-mono font-semibold border border-slate-250 bg-white rounded-lg p-2 outline-indigo-500"
              placeholder="Ex: 85"
              value={respiro.gasometria.po2}
              onChange={(e) => handleGasChange('po2', e.target.value)}
            />
          </div>

          {/* PCO2 */}
          <div>
            <label htmlFor="gas-pco2" className="block text-xs font-medium text-slate-500 mb-1">pCO2 (mmHg)</label>
            <input
              id="gas-pco2"
              type="number"
              className="w-full text-xs font-mono font-semibold border border-slate-250 bg-white rounded-lg p-2 outline-indigo-500"
              placeholder="Ex: 40"
              value={respiro.gasometria.pco2}
              onChange={(e) => handleGasChange('pco2', e.target.value)}
            />
          </div>

          {/* SAT */}
          <div>
            <label htmlFor="gas-sat" className="block text-xs font-medium text-slate-500 mb-1">Saturação (%)</label>
            <input
              id="gas-sat"
              type="number"
              className="w-full text-xs font-mono font-semibold border border-slate-250 bg-white rounded-lg p-2 outline-indigo-500"
              placeholder="Ex: 96"
              value={respiro.gasometria.sat}
              onChange={(e) => handleGasChange('sat', e.target.value)}
            />
          </div>

          {/* BIC */}
          <div>
            <label htmlFor="gas-bic" className="block text-xs font-medium text-slate-500 mb-1">HCO3 (Bicarbonato)</label>
            <input
              id="gas-bic"
              type="number"
              className="w-full text-xs font-mono font-semibold border border-slate-250 bg-white rounded-lg p-2 outline-indigo-500"
              placeholder="Ex: 24"
              value={respiro.gasometria.bic}
              onChange={(e) => handleGasChange('bic', e.target.value)}
            />
          </div>

          {/* BE */}
          <div>
            <label htmlFor="gas-be" className="block text-xs font-medium text-slate-500 mb-1">Base Excess (BE)</label>
            <input
              id="gas-be"
              type="text"
              className="w-full text-xs font-mono font-semibold border border-slate-250 bg-white rounded-lg p-2 outline-indigo-500"
              placeholder="Ex: -2.3"
              value={respiro.gasometria.be}
              onChange={(e) => handleGasChange('be', e.target.value)}
            />
          </div>
        </div>

        {respiro.ventilador.relacaoPF !== null && (
          <div id="gas-p-f-feedback" className="mt-4 p-3.5 bg-slate-900 border border-slate-800 text-white leading-relaxed rounded-lg text-xs">
            <span className="font-semibold block text-indigo-305 text-indigo-400">Relação PaO2 / FiO2: <strong className="text-white text-sm font-mono">{respiro.ventilador.relacaoPF}</strong></span>
            <p className="mt-1 flex items-center gap-1 text-slate-300">
              Classificação: <strong className={
                respiro.ventilador.relacaoPF > 300 ? 'text-emerald-450' : respiro.ventilador.relacaoPF > 200 ? 'text-yellow-450' : 'text-rose-450'
              }>
                {interpretPF(respiro.ventilador.relacaoPF).rime}
              </strong> - {interpretPF(respiro.ventilador.relacaoPF).text}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
