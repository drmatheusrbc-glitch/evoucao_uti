import React, { useRef, useState } from 'react';
import { ClinicalEvolutionState } from '../types';
import { 
  getGlasgowInterpretation, 
  getRassTargetMessage, 
  interpretBps, 
  interpretMottling, 
  interpretTobin, 
  interpretPF,
  calculateIdealWeight
} from '../utils/calculators';
import { Copy, Download, RefreshCw, Check, FileText } from 'lucide-react';

interface ClinicalSummaryProps {
  state: ClinicalEvolutionState;
  onClear: () => void;
  onLoadTemplate: () => void;
}

export default function ClinicalSummary({ state, onClear, onLoadTemplate }: ClinicalSummaryProps) {
  const [copied, setCopied] = useState(false);
  const textRef = useRef<HTMLTextAreaElement>(null);

  // Generate the formatted EMR clinical evolution text
  const generateEMRText = (): string => {
    const p = state.patientId;
    const v = state.vitals;
    const n = state.neurology;
    const c = state.cardiovascular;
    const r = state.respiratory;
    const vent = r.ventilador;
    const ne = state.nephrology;
    const gi = state.gi;
    const h = state.hematology;
    const inf = state.infectious;
    const pr = state.profilaxias;

    let text = `========================================================================\n`;
    text += `             PRONTUÁRIO ELETRÔNICO - EVOLUÇÃO BEIRA-LEITO UTI\n`;
    text += `========================================================================\n`;
    text += `IDENTIFICAÇÃO DO PACIENTE:\n`;
    text += `Nome: ${p.nome || 'NÃO INFORMADO'}\n`;
    text += `Leito: ${p.leito || 'N/I'}  |  Idade: ${p.idade || 'N/I'} anos  |  Peso Real: ${p.peso || 'N/I'} kg  |  Altura: ${p.altura || 'N/I'} cm  |  Sexo: ${p.sexo || 'N/I'}\n`;
    const piVal = calculateIdealWeight(p.altura, p.sexo);
    if (piVal !== null) {
      text += `Peso Ideal Predito (Devine p/ Ventilação Protetora): ${piVal} kg\n`;
    }
    text += `Data: ${p.data || new Date().toLocaleDateString('pt-BR')}  |  DIH: ${p.dih ? `${p.dih}º dia` : 'Não informado'}\n`;
    text += `------------------------------------------------------------------------\n\n`;

    // 1. SINAIS VITAIS & MONITORIZAÇÃO
    text += `1. SINAIS VITAIS E MONITORIZAÇÃO:\n`;
    text += `- FC: ${v.fc || 'N/I'} bpm  |  Ritmo: ${c.ritmo || 'N/I'}\n`;
    text += `- PA: ${v.pas && v.pad ? `${v.pas}/${v.pad} mmHg` : 'N/I'} (${v.pam ? `PAM: ${v.pam} mmHg` : 'PAM: N/O'})\n`;
    text += `- FR: ${v.fr || 'N/I'} irpm  |  Saturação O2: ${v.sat || 'N/I'}%  |  Temp. Axilar: ${v.tx || 'N/I'} ºC\n`;
    text += `- Pulsos periféricos: ${c.pulsosPerifericos || 'N/I'}  |  Temp. Extremidades: ${c.temperaturaExtremidades || 'N/I'}\n`;
    text += `- Edema Extremidades: ${c.edemaExtremidades || 'Ausente'}  |  TEC: ${c.tec ? `${c.tec} segundos` : 'N/I'}\n`;
    
    // Mottling
    const mottVal = parseInt(c.livedoMottling, 10);
    const mInterpret = interpretMottling(c.livedoMottling);
    text += `- Mottling Score (Livedo): ${c.livedoMottling || '0'} -> Indica: ${mInterpret.label} (${mInterpret.indication})\n`;
    if (c.cianose) text += `- Cianose: SIM\n`;
    text += `\n`;

    // 2. STATUS NEUROLÓGICO
    text += `2. AVALIAÇÃO NEUROCOGNITIVA:\n`;
    if (n.comSedacao) {
      text += `- Paciente COM SEDAÇÃO ATIVA. RASS: ${n.rass || 'N/I'} (${getRassTargetMessage(n.rass).label})\n`;
      if (n.bps.score !== null) {
        const bInterpret = interpretBps(n.bps.score);
        text += `- Escore de Dor BPS: ${n.bps.score}/12 (Linf. Facial: ${n.bps.expressaoFacial}, MMSS: ${n.bps.membrosSuperiores}, Ventilação: ${n.bps.toleranciaVentilacao})\n`;
        text += `  Indicação BPS: ${bInterpret.text} (${bInterpret.indication})\n`;
      }
      text += `- Reflexos de tronco/profundos: ${n.reflexos || 'Sem descrição'}\n`;
    } else {
      text += `- Paciente SEM SEDAÇÃO ATIVA.\n`;
      if (n.ecgGcs.score !== null) {
        const gInterpret = getGlasgowInterpretation(n.ecgGcs.score);
        const isIntubated = n.ecgGcs.respostaVerbal === 0 || n.ecgGcs.respostaVerbal === 1; // standard T representation
        const verbalStr = isIntubated ? 'T (Tubo/TQT)' : n.ecgGcs.respostaVerbal;
        text += `- Escala de Coma de Glasgow (GCS-P): ${n.ecgGcs.score}/15 (Ocular: ${n.ecgGcs.aberturaOcular}, Verbal: ${verbalStr}, Motor: ${n.ecgGcs.respostaMotora}, Reat. Pupilar: ${n.ecgGcs.reatividadePupilar})\n`;
        text += `  Indicação GCS: ${gInterpret.text}\n`;
      }
      text += `- Escala de Dor (EVA): ${n.evaDor || '0'}/10\n`;
    }

    // CAM-ICU
    if (n.camIcu.hasDelirium !== null) {
      text += `- Escore CAM-ICU para Delirium: ${n.camIcu.hasDelirium ? 'POSITIVO (Delirium Presente)' : 'NEGATIVO (Delirium Ausente)'}\n`;
      text += `  [Critérios: Alt. Aguda: ${n.camIcu.alteracaoAguda ? 'Sim' : 'Não'} | Desatenção: ${n.camIcu.desatencao ? 'Sim' : 'Não'} | Pensamento Desorg: ${n.camIcu.pensamentoDesorganizado ? 'Sim' : 'Não'} | Consciência Alterada (RASS != 0): ${n.camIcu.nivelConscienciaAlterado ? 'Sim' : 'Não'}]\n`;
    }

    // Pupilas
    text += `- Pupilas: ${n.pupilas.tamanho || 'Sem dados'} | ${n.pupilas.simetria || 'Sem dados'} | ${n.pupilas.reflexoFotomotor || 'Sem dados'}\n`;
    if (n.pupilas.detalhePupilas) text += `  Obs Pupilar: ${n.pupilas.detalhePupilas}\n`;
    text += `\n`;

    // 3. DROGAS VASOATIVAS E ENDOVENOSAS (DVA)
    text += `3. PERFUSÃO E DROGAS VASOATIVAS (DVA):\n`;
    if (c.dvas.length === 0) {
      text += `- Sem drogas vasoativas / suportes inotrópicos em infusão contínua.\n`;
    } else {
      text += `| Substância (Droga/Sedação) | Concentração  | Vazão (mL/h) | Dose Estimada Calculada  |\n`;
      text += `|----------------------------|---------------|--------------|--------------------------|\n`;
      c.dvas.forEach(d => {
        const concStr = `${d.concentracao} ${d.concentracaoUnidade || 'mg/mL'}`;
        const doseStr = `${d.dose || '0.00'} ${d.doseUnidade || 'mcg/kg/min'}`;
        text += `| ${d.dva.padEnd(26)} | ${concStr.padEnd(13)} | ${(d.mlh).padEnd(12)} | ${doseStr.padEnd(24)} |\n`;
      });
      text += `- Ausculta Cardíaca: ${c.auscultaCardiaca || 'RCR 2T BNF sem sopros'}\n`;
    }
    text += `\n`;

    // 4. SUPORTE RESPIRATÓRIO & GASOMETRIA ATUAL
    text += `4. SISTEMA RESPIRATÓRIO E MECÂNICA VENTILATÓRIA:\n`;
    text += `- Suporte atual: ${r.tipoSuporte || 'Ar ambiente'}\n`;
    if (r.tipoSuporte === 'IOT') {
      text += `  [Intubação Orotraqueal desde ${r.iotData || 'sem data'} | Marcação Rima: ${r.iotRima || 'N/I'} cm]\n`;
    } else if (r.tipoSuporte === 'Traqueostomia') {
      text += `  [Traqueostomia realizada em ${r.traqueoData || 'sem data'} | Cânula: ${r.traqueoCanula || 'N/I'}]\n`;
    } else if (r.tipoSuporte === 'Cateter/Venturi') {
      text += `  [Cateter/Venturi com Vazão de Oxigênio: ${r.cateterVariavel || 'N/I'} L/min]\n`;
    }

    text += `- Padrão Ventilatório do Paciente: ${r.padraoVentilatorio || 'Eupneico, sem esforço muscular acessório'}\n`;
    text += `- Ausculta Pulmonar: Murmúrio Vesicular (MV) ${r.mvPresente ? 'Presente bilateralmente sem assimetrias' : `Diminuído em: ${r.mvDiminuidoLado || 'região não especificada'}`}\n`;
    if (r.crepitacaoLado) text += `  * Crepitações: Lado/Região: ${r.crepitacaoLado}\n`;
    if (r.estertorLado) text += `  * Estertores: Lado/Região: ${r.estertorLado}\n`;
    if (r.sibiloLado) text += `  * Sibilos: Lado/Região: ${r.sibiloLado}\n`;
    if (r.roncoLado) text += `  * Roncos: Lado/Região: ${r.roncoLado}\n`;

    // Ventilator parameters
    if (r.tipoSuporte === 'IOT' || r.tipoSuporte === 'Traqueostomia' || vent.modo) {
      const vcValText = parseFloat(vent.volumeCorrente);
      const vcKgText = piVal && !isNaN(vcValText) ? `${Math.round((vcValText / piVal) * 10) / 10} mL/kg de Peso Ideal` : '';
      
      const frValText = parseFloat(vent.fr);
      const relIEText = vent.relacaoIE;
      let cycleTimesText = '';
      if (frValText > 0 && relIEText) {
        const parts = relIEText.split(':');
        let ieExp = 2;
        if (parts.length === 2) {
          const parsedExp = parseFloat(parts[1]);
          if (!isNaN(parsedExp) && parsedExp > 0) ieExp = parsedExp;
        } else {
          const numericIE = parseFloat(relIEText);
          if (!isNaN(numericIE) && numericIE > 0) ieExp = numericIE;
        }
        const tTot = 60 / frValText;
        const tIns = tTot / (1 + ieExp);
        const tExp = tTot - tIns;
        cycleTimesText = ` [Ciclo: Ttot ${tTot.toFixed(1)}s | inspiratório Tins ${tIns.toFixed(2)}s | expiratório Tex ${tExp.toFixed(2)}s]`;
      }

      text += `\n** Parâmetros de Ventilação Mecânica:**\n`;
      text += `- Modo: ${vent.modo || 'A/C VCV'}  |  Sensibilidade: ${vent.sensibilidade || 'N/I'}  |  Fluxo: ${vent.fluxo || 'N/I'} L/min\n`;
      text += `- Volume Corrente (VC): ${vent.volumeCorrente || 'N/I'} mL ${vcKgText ? `(${vcKgText})` : ''}  |  Volume-Minuto (VM): ${vent.volumeMinuto || 'N/I'} L/min\n`;
      text += `- Freq. Respiratória (FR do ventilador): ${vent.fr || 'N/I'} irpm  |  FiO2: ${vent.fio2 || 'N/I'}%\n`;
      text += `- PEEP: ${vent.peep || 'N/I'} cmH2O  |  Relação I:E: ${vent.relacaoIE || '1:2'}${cycleTimesText}\n`;
      text += `- Pressão Máxima/Pico (Ppico): ${vent.ppico || 'N/I'} cmH2O  |  Pressão Platô (Pplato): ${vent.pplato || 'N/I'} cmH2O\n`;
      
      if (vent.dp !== null) {
        text += `- Driving Pressure (Pressão de Condução): ${vent.dp} cmH2O -> ${vent.dp <= 15 ? 'Ideal (<15). Alinhado à ventilação protetora.' : 'Alerta (>15)! Risco de lesão pulmonar induzida pela ventilação (VILI).'}\n`;
      }
      if (vent.complacenciaEst !== null) {
        text += `- Complacência Estática (Cst): ${vent.complacenciaEst} mL/cmH2O -> ${vent.complacenciaEst >= 50 ? 'Complacência satisfatória.' : 'Baixa complacência (Pulmão endurecido).'}\n`;
      }
      if (vent.pressaoResistiva !== null) {
        text += `- Pressão Resistiva (Resistência Vias Aéreas): ${vent.pressaoResistiva} cmH2O/L/s\n`;
      }
      if (vent.constanteTempo !== null) {
        text += `- Constante de Tempo Expiratório: ${vent.constanteTempo} s\n`;
      }
      if (vent.autoPeep) text += `- Auto-PEEP aferida: ${vent.autoPeep} cmH2O\n`;
      if (vent.pressaoSuporte) text += `- PS: ${vent.pressaoSuporte} cmH2O (Backup: ${vent.backup || 'Não'})\n`;
      
      // Tobin
      if (vent.tobin !== null) {
        const tInterpret = interpretTobin(vent.tobin);
        text += `- Índice de Tobin (RSBI): ${tInterpret.text}\n`;
      }
    }

    // Gasometria
    const gas = r.gasometria;
    if (gas.ph || gas.po2 || gas.pco2 || gas.sat || gas.bic || gas.be) {
      text += `\n** Dados da Gasometria Arterial:**\n`;
      text += `- pH: ${gas.ph || 'N/I'}  |  pCO2: ${gas.pco2 || 'N/I'} mmHg  |  pO2: ${gas.po2 || 'N/I'} mmHg\n`;
      text += `- SatO2: ${gas.sat || 'N/I'}%  |  HCO3 (Bicarbonato): ${gas.bic || 'N/I'} mEq/L  |  Base Excess: ${gas.be || 'N/I'}\n`;
      
      // PaO2 / FiO2
      if (vent.relacaoPF !== null) {
        const pfInterpret = interpretPF(vent.relacaoPF);
        text += `- Relação PaO2/FiO2 (P/F): ${vent.relacaoPF} -> Classificação: ${pfInterpret.rime} (${pfInterpret.text})\n`;
      }
    }
    text += `\n`;

    // 5. NEFROLOGIA, EQUILÍBRIO HÍDRICO & URINA
    text += `5. SISTEMA RENAL E EQUILÍBRIO HÍDRICO:\n`;
    text += `- Diurese total (24h): ${ne.diurese || 'N/I'} mL  |  Entrada hídrica total: ${ne.entradas || 'N/I'} mL\n`;
    if (ne.bh !== null) {
      text += `- Balanço Hídrico (BH): ${ne.bh > 0 ? `+${ne.bh}` : ne.bh} mL (${ne.bh > 0 ? 'Balanço Positivo / Acúmulo' : 'Balanço Negativo'})\n`;
    }
    if (ne.hemodialise) text += `- Suporte dialítico (Hemodiálise): ${ne.hemodialise}\n`;
    text += `- Aspecto/Cor da Urina: ${ne.aspectoUrina || 'Citrino límpido'}\n`;

    // Renal Labs
    if (ne.ureia || ne.creat || ne.tfg || ne.na || ne.k || ne.ca || ne.p || ne.mg) {
      text += `  Exames bioquímicos/eletrólitos:\n`;
      text += `  * Urante/Uréia: ${ne.ureia || 'N/I'} mg/dL  |  Creatinina: ${ne.creat || 'N/I'} mg/dL  |  TFG: ${ne.tfg || 'N/I'} mL/min/1.73m² (C-G estimado)\n`;
      text += `  * Sódio (Na+): ${ne.na || 'N/I'} mEq/L  |  Potássio (K+): ${ne.k || 'N/I'} mEq/L  |  Cálcio (Ca2+): ${ne.ca || 'N/I'} mg/dL\n`;
      text += `  * Fósforo (P): ${ne.p || 'N/I'} mg/dL   |  Magnésio (Mg2+): ${ne.mg || 'N/I'} mg/dL\n`;
    }
    text += `\n`;

    // 6. GASTROINTESTINAL & NUTRIÇÃO
    text += `6. SISTEMA ADDOMINAL/GASTROINTESTINAL E NUTRIÇÃO:\n`;
    const abdProps: string[] = [];
    if (gi.abdomeCaracteristicas.flacido) abdProps.push('Flácido');
    if (gi.abdomeCaracteristicas.distendido) abdProps.push('Distendido');
    if (gi.abdomeCaracteristicas.doloroso) abdProps.push('Doloroso na palpação');
    if (gi.abdomeCaracteristicas.indolor) abdProps.push('Indolor na palpação');
    text += `- Abdome: ${gi.abdomeRha || 'RHA+'} e ${abdProps.join(', ') || 'Sem anomalias'}\n`;
    text += `- Nutrição: Dieta por via ${gi.dieta || 'Enteral SNE'}\n`;
    if (gi.dieta !== 'Oral' && gi.dieta !== '') {
      text += `  Vazão de infusão: ${gi.vazao || 'N/I'} mL/h  |  Aporte: ${gi.kcal || 'N/I'} KCAL/dia  |  Proteínas: ${gi.proteinas || 'N/I'} g/dia\n`;
    }
    text += `- Evacuação: ${gi.evacuacao || 'Sim'} ${gi.evacuacao === 'Não' ? `(Há ${gi.evacuacaoDias || '0'} dias sem evacuar)` : ''}\n`;
    text += `\n`;

    // 7. HEMATOLOGIA E CATETERES
    text += `7. HEMATOLOGIA E DISPOSITIVOS DE ACESSO:\n`;
    text += `- Sangramento visível/sinal de sangramento: ${gi.evacuacao === 'Sim' && h.sangramento === 'Presente' ? `PRESENTE em ${h.sangramentoLocal}` : h.sangramento || 'Ausente'}\n`;
    text += `- Dispositivos e acessos invasivos: ${h.cateterDiaInsercao || 'Não informados / Apenas acesso periférico'}\n`;
    if (h.hb || h.ht || h.plaqueta || h.leucocitos || h.bastao || h.irn) {
      text += `  Hemograma de controle e Coagulação:\n`;
      text += `  * Hemoglobina (HB): ${h.hb || 'N/I'} g/dL  |  Hematócrito (HT): ${h.ht || 'N/I'}%\n`;
      text += `  * Plaquetas: ${h.plaqueta || 'N/I'} /uL   |  Leucócitos: ${h.leucocitos || 'N/I'} /uL  |  Bastões: ${h.bastao || 'N/I'}%\n`;
      text += `  * TAP/INR: ${h.irn || 'N/I'}\n`;
    }
    text += `\n`;

    // 8. ASPECTO INFECCIOSO & ANTIBIÓTICOS / CULTURAS
    text += `8. TERAPIA ANTI-INFECCIOSA E CULTURAS:\n`;
    if (inf.antibioticos.length === 0) {
      text += `- Sem vigência de esquemas antibióticos contínuos na internação.\n`;
    } else {
      text += `  Antibióticos em uso:\n`;
      inf.antibioticos.forEach((atb, idx) => {
        text += `  [${idx+1}] Antimicrobiano: ${atb.nome} | D0 (Dia inicial): ${atb.d0} | Tempo total: ${atb.diasTotais} dias\n`;
      });
    }

    if (inf.culturas.length > 0) {
      text += `  Culturas laboratoriais coletadas:\n`;
      inf.culturas.forEach((cult, idx) => {
        text += `  * [${idx+1}] Coleta: ${cult.data} | Exame: ${cult.cultura} | Resultado: ${cult.resultado || 'Pendente'}\n`;
      });
    }
    text += `\n`;

    // 9. PROFILAXIAS
    text += `9. PROFILAXIAS IMPLEMENTADAS:\n`;
    text += `- TVP (Trombose Venosa Profunda): ${pr.tvp || 'Farmacológica ativa'}\n`;
    text += `- Colírio de proteção ocular (se intubado/sedado): ${pr.colirio || 'Sim, conforme protocolo'}\n`;
    text += `- Profilaxia de Úlcera de estresse gástrica: ${pr.ulceraGastrica || 'Inibidor de Bomba de Prótons ativo'}\n`;
    text += `\n`;

    // 10. ANOTAÇÕES MÉDICAS ADICIONAIS
    text += `10. CONDUTA ADICIONAL E ANOTAÇÕES MÉDICAS:\n`;
    text += `${state.anotacoesMedicas || 'Sem condutas adicionais especificadas no momento.'}\n`;
    text += `========================================================================\n`;
    text += `Evolução gerada automaticamente pelo assistente de beira-leito UTI.\n`;
    text += `Para assinatura digital / carimbo no prontuário oficial.\n`;
    
    return text;
  };

  const handleCopy = async () => {
    try {
      if (textRef.current) {
        textRef.current.select();
        await navigator.clipboard.writeText(generateEMRText());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error('Falha ao copiar:', err);
    }
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([generateEMRText()], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    const dateStr = new Date().toISOString().slice(0,10);
    element.download = `Evolucao_Bedside_UTI_${state.patientId.leito || 'no_leto'}_${state.patientId.nome.replace(/\s+/g, '_') || 'Paciente'}_${dateStr}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div id="clinical-summary-container" className="bg-slate-900 text-slate-100 rounded-xl p-6 border border-slate-800 shadow-xl transition-all duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-5">
        <div>
          <h2 id="clinical-summary-title" className="text-xl font-sans font-semibold tracking-tight text-white flex items-center gap-2">
            <FileText className="h-5 w-5 text-indigo-400" />
            Evolução Pronta para Prontuário
          </h2>
          <p className="text-sm text-slate-400 mt-1">Evolução estruturada com os escores calculados dinamicamente.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="load-template-btn"
            onClick={onLoadTemplate}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 rounded-lg border border-slate-700 transition"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Carregar Exemplo
          </button>
          <button
            id="clear-form-btn"
            onClick={onClear}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium bg-rose-950/40 hover:bg-rose-900/60 active:scale-95 text-rose-300 rounded-lg border border-rose-900/50 transition"
          >
            Limpar Tudo
          </button>
        </div>
      </div>

      <div className="relative rounded-lg bg-slate-950 border border-slate-850 p-2 overflow-hidden">
        <textarea
          id="emr-output-textbox"
          ref={textRef}
          readOnly
          value={generateEMRText()}
          className="w-full h-96 bg-transparent text-slate-300 font-mono text-xs p-4 focus:outline-none resize-y"
        />

        {/* Copy Floating Notification */}
        <div className="absolute right-4 bottom-4 flex items-center gap-2">
          <button
            id="copy-to-prontuario-btn"
            onClick={handleCopy}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition active:scale-95 shadow-md ${
              copied 
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                Copiado com Sucesso!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copiar para Prontuário (Ctrl+C)
              </>
            )}
          </button>

          <button
            id="download-prontuario-btn"
            onClick={handleDownload}
            title="Baixar em formato .txt"
            className="flex items-center justify-center p-2.5 bg-slate-850 hover:bg-slate-800 text-slate-200 border border-slate-750 font-medium rounded-lg text-sm transition active:scale-95"
          >
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Live calculated scores list sidebar badge helpers */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-slate-950/40 border border-slate-800/40 p-4 rounded-lg">
        <div className="text-center p-3 rounded-lg bg-slate-950/60 border border-slate-850">
          <p className="text-xs font-sans text-slate-400 font-medium h-5">Neurologia</p>
          <p className="text-lg font-mono font-bold text-white mt-1">
            {state.neurology.comSedacao 
              ? `RASS ${state.neurology.rass || 'N/A'}` 
              : `GCS ${state.neurology.ecgGcs.score || 'N/A'}`
            }
          </p>
          <span className="text-[10px] text-indigo-400 block mt-1 hover:underline">
            {state.neurology.comSedacao ? 'Sedado' : 'Glasgow'}
          </span>
        </div>

        <div className="text-center p-3 rounded-lg bg-slate-950/60 border border-slate-850">
          <p className="text-xs font-sans text-slate-400 font-medium h-5">Mottling Score</p>
          <p className="text-lg font-mono font-bold text-white mt-1">
            Grau {state.cardiovascular.livedoMottling || '0'}
          </p>
          <span className="text-[10px] text-amber-400 block mt-1">
            {interpretMottling(state.cardiovascular.livedoMottling).label}
          </span>
        </div>

        <div className="text-center p-3 rounded-lg bg-slate-950/60 border border-slate-850">
          <p className="text-xs font-sans text-slate-400 font-medium h-5">Ventilação (P/F)</p>
          <p className="text-lg font-mono font-bold text-white mt-1">
            {state.respiratory.ventilador.relacaoPF || '---'}
          </p>
          <span className="text-[10px] text-sky-450 block mt-1 text-sky-400">
            {state.respiratory.ventilador.relacaoPF 
              ? interpretPF(state.respiratory.ventilador.relacaoPF).rime 
              : 'Sem gasometria'
            }
          </span>
        </div>

        <div className="text-center p-3 rounded-lg bg-slate-950/60 border border-slate-850">
          <p className="text-xs font-sans text-slate-400 font-medium h-5">Balanço Hídrico</p>
          <p className="text-lg font-mono font-bold mt-1">
            {state.nephrology.bh !== null 
              ? `${state.nephrology.bh > 0 ? `+${state.nephrology.bh}` : state.nephrology.bh} mL`
              : '---'
            }
          </p>
          <span className="text-[10px] text-emerald-400 block mt-1">
            {state.nephrology.bh !== null ? (state.nephrology.bh > 0 ? 'Excesso de fluidos' : 'Negativo / Estável') : 'Não calculado'}
          </span>
        </div>
      </div>
    </div>
  );
}
