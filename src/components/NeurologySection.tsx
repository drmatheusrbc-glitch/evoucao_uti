import React from 'react';
import { NeurologicalInfo, GlasgowScale, BpsScale, CamIcuScale, Pupilas } from '../types';
import { RASS_OPTIONS, getRassTargetMessage, interpretBps, getGlasgowInterpretation, calculateBps, calculateGlasgow, calculateCamIcu } from '../utils/calculators';
import { AlertCircle, Brain, Eye, Activity, HeartCrack } from 'lucide-react';

interface NeurologySectionProps {
  neuro: NeurologicalInfo;
  onChangeNeuro: (field: keyof NeurologicalInfo, value: any) => void;
}

export default function NeurologySection({ neuro, onChangeNeuro }: NeurologySectionProps) {
  
  const handleSedationToggle = (comSedacao: boolean) => {
    onChangeNeuro('comSedacao', comSedacao);
  };

  const handleRassChange = (value: string) => {
    onChangeNeuro('rass', value);
    
    // Auto sync CAM-ICU RASS state
    const num = parseInt(value, 10);
    const isAlteredVal = !isNaN(num) && num !== 0;
    updateCamIcu('nivelConscienciaAlterado', isAlteredVal);
  };

  const handleBpsChange = (component: keyof Omit<BpsScale, 'score'>, val: number) => {
    const updatedBps = {
      ...neuro.bps,
      [component]: val
    };
    const finalBps = calculateBps(updatedBps);
    onChangeNeuro('bps', finalBps);
  };

  const handleGlasgowChange = (component: keyof Omit<GlasgowScale, 'score'>, val: number) => {
    const updatedGcs = {
      ...neuro.ecgGcs,
      [component]: val
    };
    const finalGcs = calculateGlasgow(updatedGcs);
    onChangeNeuro('ecgGcs', finalGcs);
  };

  const updateCamIcu = (field: keyof Omit<CamIcuScale, 'hasDelirium'>, value: boolean) => {
    const updatedCam = {
      ...neuro.camIcu,
      [field]: value
    };
    const finalCam = calculateCamIcu(updatedCam);
    onChangeNeuro('camIcu', finalCam);
  };

  const updatePupilas = (field: keyof Pupilas, value: string) => {
    const updatedPupilas = {
      ...neuro.pupilas,
      [field]: value
    };
    onChangeNeuro('pupilas', updatedPupilas);
  };

  const cardBpsInter = neuro.bps.score !== null ? interpretBps(neuro.bps.score) : null;
  const cardGcsInter = neuro.ecgGcs.score !== null ? getGlasgowInterpretation(neuro.ecgGcs.score) : null;
  const sassMessage = getRassTargetMessage(neuro.rass);

  return (
    <div id="neurological-section" className="bg-white rounded-xl p-6 border border-slate-200 mb-6 shadow-sm">
      <h2 id="neurology-title" className="text-md font-sans font-semibold text-slate-800 tracking-tight flex items-center gap-2 border-b border-slate-100 pb-3 mb-5">
        <span className="flex items-center justify-center bg-indigo-50 text-indigo-600 rounded-lg h-7 w-7 text-xs font-bold font-mono">2</span>
        Neurológico / Sedação e Delirium
      </h2>

      {/* Toggles for Com/Sem sedação */}
      <div id="sedation-status-selector" className="grid grid-cols-2 gap-3 mb-6 p-1 bg-slate-100 rounded-xl max-w-md">
        <button
          id="select-com-sedacao-btn"
          type="button"
          onClick={() => handleSedationToggle(true)}
          className={`py-2 px-4 rounded-lg text-xs font-semibold tracking-wider transition ${
            neuro.comSedacao 
              ? 'bg-indigo-600 text-white shadow-sm' 
              : 'text-slate-600 hover:bg-slate-200'
          }`}
        >
          ( ) COM SEDAÇÃO ATIVA
        </button>
        <button
          id="select-sem-sedacao-btn"
          type="button"
          onClick={() => handleSedationToggle(false)}
          className={`py-2 px-4 rounded-lg text-xs font-semibold tracking-wider transition ${
            !neuro.comSedacao 
              ? 'bg-indigo-600 text-white shadow-sm' 
              : 'text-slate-600 hover:bg-slate-200'
          }`}
        >
          ( ) SEM SEDAÇÃO (VIGÍLIA)
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Branch 1: Paciente COM SEDAÇÃO */}
        {neuro.comSedacao && (
          <div id="with-sedation-container" className="space-y-6">
            {/* RASS */}
            <div id="rass-selector-box" className="bg-slate-50 p-5 rounded-xl border border-slate-150">
              <label htmlFor="rass-select-dropdown" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Escala de RASS ( Richmond Agitation-Sedation Scale )</label>
              <select
                id="rass-select-dropdown"
                value={neuro.rass}
                onChange={(e) => handleRassChange(e.target.value)}
                className="w-full text-sm border border-slate-200 bg-white rounded-lg p-2.5 outline-indigo-500 font-medium text-slate-800"
              >
                <option value="">Selecione o nível de RASS</option>
                {RASS_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {neuro.rass && (
                <div id="rass-feedback" className={`mt-3 p-3 rounded-lg border text-xs leading-relaxed ${sassMessage.style}`}>
                  <strong>{sassMessage.label}:</strong> {sassMessage.feedback}
                  <p className="mt-1 text-slate-500 italic">
                    {RASS_OPTIONS.find(o => o.value === neuro.rass)?.desc}
                  </p>
                </div>
              )}
            </div>

            {/* BPS Escala de Dor */}
            <div id="bps-calculator-box" className="bg-slate-50 p-5 rounded-xl border border-slate-150">
              <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <HeartCrack className="h-4 w-4 text-rose-500" />
                Escala de Dor BPS (Behavioral Pain Scale)
              </h3>
              
              <div className="space-y-3.5 mb-4">
                {/* Expressao Facial */}
                <div>
                  <label htmlFor="bps-facial-select" className="block text-[11px] font-medium text-slate-550 mb-1">1. Expressão Facial</label>
                  <select
                    id="bps-facial-select"
                    value={neuro.bps.expressaoFacial}
                    onChange={(e) => handleBpsChange('expressaoFacial', parseInt(e.target.value, 15))}
                    className="w-full text-xs border border-slate-200 bg-white rounded-lg p-2 outline-indigo-500"
                  >
                    <option value="1">1 - Relaxada (Sem contração)</option>
                    <option value="2">2 - Parcialmente contraída (Testa franzida, sobrancelhas abaixadas)</option>
                    <option value="3">3 - Totalmente contraída (Eyelid tightening, careta fechada)</option>
                    <option value="4">4 - Careta (Expressão de dor acentuada, choro)</option>
                  </select>
                </div>

                {/* MMSS */}
                <div>
                  <label htmlFor="bps-movement-select" className="block text-[11px] font-medium text-slate-550 mb-1">2. Movimentos de Membros Superiores (MMSS)</label>
                  <select
                    id="bps-movement-select"
                    value={neuro.bps.membrosSuperiores}
                    onChange={(e) => handleBpsChange('membrosSuperiores', parseInt(e.target.value, 15))}
                    className="w-full text-xs border border-slate-200 bg-white rounded-lg p-2 outline-indigo-500"
                  >
                    <option value="1">1 - Nenhum movimento</option>
                    <option value="2">2 - Parcialmente flexionados (Reflexo de fuga ou manipulação leve)</option>
                    <option value="3">3 - Totalmente flexionados com flexão de dedos</option>
                    <option value="4">4 - Retração permanente (Flexão rígida do braço constante)</option>
                  </select>
                </div>

                {/* VM tolerância */}
                <div>
                  <label htmlFor="bps-ventilator-select" className="block text-[11px] font-medium text-slate-550 mb-1">3. Tolerância com Ventilação Mecânica</label>
                  <select
                    id="bps-ventilator-select"
                    value={neuro.bps.toleranciaVentilacao}
                    onChange={(e) => handleBpsChange('toleranciaVentilacao', parseInt(e.target.value, 15))}
                    className="w-full text-xs border border-slate-200 bg-white rounded-lg p-2 outline-indigo-500"
                  >
                    <option value="1">1 - Tolerando ventilação (Raros alarmes, respiração calma)</option>
                    <option value="2">2 - Tossindo mas tolerando a maior parte do tempo</option>
                    <option value="3">3 - Lutando contra ventilador (Dessincronia, tosse descontrolada)</option>
                    <option value="4">4 - Ativando alarme incontrolável (Não ventila de modo síncrono)</option>
                  </select>
                </div>
              </div>

              {neuro.bps.score !== null && cardBpsInter && (
                <div id="bps-feedback" className={`p-3 rounded-lg border text-xs leading-relaxed ${cardBpsInter.color}`}>
                  <p className="font-semibold text-sm">BPS Total: {neuro.bps.score} / 12</p>
                  <p className="mt-1 font-medium">{cardBpsInter.text}</p>
                  <p className="mt-0.5 text-slate-500">{cardBpsInter.indication}</p>
                </div>
              )}
            </div>

            {/* Reflexos de tronco */}
            <div id="reflexos-field-box">
              <label htmlFor="neuro-reflexos" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Reflexos de Tronco e Profundos</label>
              <input
                id="neuro-reflexos"
                type="text"
                className="w-full text-sm border border-slate-200 rounded-lg p-2.5 outline-indigo-500"
                placeholder="Ex: Pupilar, corneano, tosse presentes bilateralmente."
                value={neuro.reflexos}
                onChange={(e) => onChangeNeuro('reflexos', e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Branch 2: Paciente SEM SEDAÇÃO */}
        {!neuro.comSedacao && (
          <div id="without-sedation-container" className="space-y-6">
            {/* Glasgow (GCS) */}
            <div id="gcs-calculator-box" className="bg-slate-50 p-5 rounded-xl border border-slate-150">
              <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <Brain className="h-4 w-4 text-emerald-600" />
                Escala de Coma de Glasgow (ECG / GCS-P)
              </h3>

              <div className="space-y-3.5 mb-4">
                {/* Abertura Ocular */}
                <div>
                  <label htmlFor="gcs-ocular-select" className="block text-[11px] font-medium text-slate-550 mb-1">1. Abertura Ocular</label>
                  <select
                    id="gcs-ocular-select"
                    value={neuro.ecgGcs.aberturaOcular}
                    onChange={(e) => handleGlasgowChange('aberturaOcular', parseInt(e.target.value, 10))}
                    className="w-full text-xs border border-slate-200 bg-white rounded-lg p-2 outline-indigo-500"
                  >
                    <option value="4">4 - Espontânea</option>
                    <option value="3">3 - Ao comando verbal</option>
                    <option value="2">2 - À pressão / estímulo doloroso</option>
                    <option value="1">1 - Ausente</option>
                  </select>
                </div>

                {/* Resposta Verbal */}
                <div>
                  <label htmlFor="gcs-verbal-select" className="block text-[11px] font-medium text-slate-550 mb-1">2. Resposta Verbal</label>
                  <select
                    id="gcs-verbal-select"
                    value={neuro.ecgGcs.respostaVerbal}
                    onChange={(e) => handleGlasgowChange('respostaVerbal', parseInt(e.target.value, 15))}
                    className="w-full text-xs border border-slate-200 bg-white rounded-lg p-2 outline-indigo-500"
                  >
                    <option value="5">5 - Orientado</option>
                    <option value="4">4 - Confuso</option>
                    <option value="3">3 - Palavras inapropriadas</option>
                    <option value="2">2 - Sons incompreensíveis</option>
                    <option value="1">1 - Ausente (Sem resposta)</option>
                    <option value="0">0 - T (Tubo orotraqueal ou traqueostomia)</option>
                  </select>
                </div>

                {/* Resposta Motora */}
                <div>
                  <label htmlFor="gcs-motor-select" className="block text-[11px] font-medium text-slate-550 mb-1">3. Resposta Motora (Melhor Resposta)</label>
                  <select
                    id="gcs-motor-select"
                    value={neuro.ecgGcs.respostaMotora}
                    onChange={(e) => handleGlasgowChange('respostaMotora', parseInt(e.target.value, 10))}
                    className="w-full text-xs border border-slate-200 bg-white rounded-lg p-2 outline-indigo-500"
                  >
                    <option value="6">6 - Obedece a comandos verbais</option>
                    <option value="5">5 - Localiza o estímulo doloroso</option>
                    <option value="4">4 - Flexão inespecífica / Reflexo de retirada</option>
                    <option value="3">3 - Flexão anormal (Postura de decorticação)</option>
                    <option value="2">2 - Extensão anormal (Postura de descerebração)</option>
                    <option value="1">1 - Ausente (Flacidez muscular total)</option>
                  </select>
                </div>

                {/* Reatividade Pupilar */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="gcs-pupils-select" className="block text-[11px] font-medium text-slate-550">4. Reatividade Pupilar (GCS-P)</label>
                    <span className="text-[10px] text-indigo-600 bg-indigo-50 font-mono px-1 rounded font-semibold">Subtração</span>
                  </div>
                  <select
                    id="gcs-pupils-select"
                    value={neuro.ecgGcs.reatividadePupilar}
                    onChange={(e) => handleGlasgowChange('reatividadePupilar', parseInt(e.target.value, 10))}
                    className="w-full text-xs border border-slate-200 bg-white rounded-lg p-2 outline-indigo-500"
                  >
                    <option value="0">0 - Ambas as pupilas fotorreagentes</option>
                    <option value="-1">-1 - Unilateral: apenas uma pupila não fotorreagente</option>
                    <option value="-2">-2 - Bilateral: nenhuma das pupilas fotorreagente</option>
                  </select>
                </div>
              </div>

              {neuro.ecgGcs.score !== null && cardGcsInter && (
                <div id="gcs-feedback" className="p-3 bg-indigo-50 border border-indigo-150 rounded-lg text-xs leading-relaxed">
                  <p className="font-semibold text-indigo-900 text-sm">GCS-P Total: {neuro.ecgGcs.score} / 15</p>
                  <p className="mt-1 font-medium text-slate-700">{cardGcsInter.text}</p>
                </div>
              )}
            </div>

            {/* Escala Visual Analógica de Dor (EVA) */}
            <div id="eva-scale-box" className="bg-slate-50 p-5 rounded-xl border border-slate-150">
              <label htmlFor="eva-pain-slider" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Escala de Dor Visual Analógica (EVA)</label>
              <div className="flex items-center gap-4">
                <input
                  id="eva-pain-slider"
                  type="range"
                  min="0"
                  max="10"
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  value={neuro.evaDor || '0'}
                  onChange={(e) => onChangeNeuro('evaDor', e.target.value)}
                />
                <span className="text-xl font-mono font-bold text-slate-800 w-12 text-center bg-white border rounded-lg p-2 shadow-xs">
                  {neuro.evaDor || '0'}
                </span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 mt-2 font-semibold">
                <span>0 - SEM DOR</span>
                <span>5 - DOR MODERADA</span>
                <span>10 - PIOR DOR POSSÍVEL</span>
              </div>
            </div>
          </div>
        )}

        {/* CAM-ICU (Delirium Checklist) */}
        <div id="cam-icu-checklist-box" className="bg-slate-50 p-5 rounded-xl border border-slate-150 space-y-4">
          <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-200 pb-2.5 mb-2">
            <Activity className="h-4 w-4 text-indigo-500" />
            Rastreamento de Delirium (CAM-ICU)
          </h3>

          <div className="space-y-3">
            {/* Alt aguda */}
            <label id="cam-icu-alt-aguda-label" className="flex items-start gap-2.5 text-xs text-slate-700 font-medium cursor-pointer">
              <input
                id="cam-icu-alt-aguda-checkbox"
                type="checkbox"
                className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                checked={!!neuro.camIcu.alteracaoAguda}
                onChange={(e) => updateCamIcu('alteracaoAguda', e.target.checked)}
              />
              <div>
                <span>1. Alteração aguda ou flutuante do estado mental?</span>
                <span className="block text-[10px] text-slate-400 font-normal mt-0.5">Início abrupto ou flutuação da consciência nas últimas 24h.</span>
              </div>
            </label>

            {/* Desatenção */}
            <label id="cam-icu-desatencao-label" className="flex items-start gap-2.5 text-xs text-slate-700 font-medium cursor-pointer">
              <input
                id="cam-icu-desatencao-checkbox"
                type="checkbox"
                className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                checked={!!neuro.camIcu.desatencao}
                onChange={(e) => updateCamIcu('desatencao', e.target.checked)}
              />
              <div>
                <span>2. Desatenção presente? (Teste de Apertar a Mão)</span>
                <span className="block text-[10px] text-slate-400 font-normal mt-0.5">Erros no teste de atenção (letra 'A' em "SAVEAHAART", erro &gt; 2).</span>
              </div>
            </label>

            {/* Pensamento desorganizado */}
            <label id="cam-icu-pensamento-label" className="flex items-start gap-2.5 text-xs text-slate-700 font-medium cursor-pointer">
              <input
                id="cam-icu-pensamento-checkbox"
                type="checkbox"
                className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                checked={!!neuro.camIcu.pensamentoDesorganizado}
                onChange={(e) => updateCamIcu('pensamentoDesorganizado', e.target.checked)}
              />
              <div>
                <span>3. Pensamento desorganizado?</span>
                <span className="block text-[10px] text-slate-400 font-normal mt-0.5">Lógica de respostas ilógica ou incapacidade de seguir ordens verbais simples.</span>
              </div>
            </label>

            {/* Nivel consciencia alterado */}
            <label id="cam-icu-consciencia-label" className="flex items-start gap-2.5 text-xs text-slate-700 font-medium cursor-pointer">
              <input
                id="cam-icu-consciencia-checkbox"
                type="checkbox"
                className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                checked={!!neuro.camIcu.nivelConscienciaAlterado}
                onChange={(e) => updateCamIcu('nivelConscienciaAlterado', e.target.checked)}
              />
              <div>
                <span>4. Alteração do nível de consciência (RASS diferente de 0)?</span>
                <span className="block text-[10px] text-slate-400 font-normal mt-0.5">Se o RASS atual for diferente de zero, marque esta opção (Alt. Consciência).</span>
              </div>
            </label>
          </div>

          {neuro.camIcu.hasDelirium !== null && (
            <div id="cam-icu-results" className={`p-3 rounded-lg border text-xs font-medium leading-relaxed flex items-start gap-2 ${
              neuro.camIcu.hasDelirium 
                ? 'bg-rose-50 border-rose-200 text-rose-800' 
                : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}>
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">
                  CAM-ICU: {neuro.camIcu.hasDelirium ? 'POSITIVO (Delirium Presente)' : 'NEGATIVO (Delirium Ausente)'}
                </p>
                <p className="font-normal text-slate-550 mt-0.5">
                  {neuro.camIcu.hasDelirium 
                    ? 'O paciente apresenta sinais clínicos de disfunção cognitiva aguda. Recomenda-se controle ambiental e profilaxia de dor/sono.'
                    : 'Paciente sem sinais de delirium detectados nesta avaliação.'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pupil Analysis Block */}
      <div id="pupils-analysis-subblock" className="bg-slate-50 p-5 rounded-xl border border-slate-150">
        <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-widest mb-4 flex items-center gap-1.5">
          <Eye className="h-4 w-4 text-indigo-500" />
          Pupilas (Tamanho, Simetria e Reflexo Fotomotor)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Tamanho */}
          <div>
            <label htmlFor="pupil-tamanho-select" className="block text-xs font-medium text-slate-500 mb-1">Tamanho / Diâmetro</label>
            <select
              id="pupil-tamanho-select"
              value={neuro.pupilas.tamanho}
              onChange={(e) => updatePupilas('tamanho', e.target.value)}
              className="w-full text-xs border border-slate-200 bg-white rounded-lg p-2.5 outline-indigo-500"
            >
              <option value="">Selecione</option>
              <option value="Isocóricas">Isocóricas (Normais e Iguais)</option>
              <option value="Anisocóricas">Anisocóricas (Diâmetros Diferentes)</option>
              <option value="Mióticas">Mióticas (Diminuídas/Pontiformes)</option>
              <option value="Midriáticas">Midriáticas (Dilatadas/Paralíticas)</option>
            </select>
          </div>

          {/* Simetria */}
          <div>
            <label htmlFor="pupil-simetria-select" className="block text-xs font-medium text-slate-500 mb-1">Simetria</label>
            <select
              id="pupil-simetria-select"
              value={neuro.pupilas.simetria}
              onChange={(e) => updatePupilas('simetria', e.target.value)}
              className="w-full text-xs border border-slate-200 bg-white rounded-lg p-2.5 outline-indigo-500"
            >
              <option value="">Selecione</option>
              <option value="Simétricas">Simétricas</option>
              <option value="Assimétricas">Assimétricas</option>
            </select>
          </div>

          {/* Reflexo fotomotor */}
          <div>
            <label htmlFor="pupil-reflexo-select" className="block text-xs font-medium text-slate-500 mb-1">Reflexo Fotomotor</label>
            <select
              id="pupil-reflexo-select"
              value={neuro.pupilas.reflexoFotomotor}
              onChange={(e) => updatePupilas('reflexoFotomotor', e.target.value)}
              className="w-full text-xs border border-slate-200 bg-white rounded-lg p-2.5 outline-indigo-500"
            >
              <option value="">Selecione</option>
              <option value="Fotorreagente bilateral">Fotorreagente bilateral (Normal)</option>
              <option value="Não fotorreagente bilateral">Não fotorreagente bilateral (Grave)</option>
              <option value="Apenas D reagente">Apenas D (Direita) reagente</option>
              <option value="Apenas E reagente">Apenas E (Esquerda) reagente</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="pupil-detalhe-input" className="block text-xs font-medium text-slate-500 mb-1">Observações Adicionais das Pupilas</label>
          <input
            id="pupil-detalhe-input"
            type="text"
            className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-white outline-indigo-500"
            placeholder="Ex: Anisocoria D > E com discreto atraso foltoumotor à esquerda."
            value={neuro.pupilas.detalhePupilas}
            onChange={(e) => updatePupilas('detalhePupilas', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
