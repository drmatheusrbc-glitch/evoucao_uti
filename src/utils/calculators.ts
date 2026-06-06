import { GlasgowScale, BpsScale, CamIcuScale } from '../types';

/**
 * Calculates Glasgow Coma Scale (including optional Pupil Reactivity Subscore GCS-P)
 */
export function calculateGlasgow(gcs: Omit<GlasgowScale, 'score'>): GlasgowScale {
  const sum = gcs.aberturaOcular + gcs.respostaVerbal + gcs.respostaMotora + gcs.reatividadePupilar;
  // Ensure the min score is 1 (GCS-P can be lower than 3, minimum GCS is 3, minimum GCS-P is 1)
  const score = Math.max(1, sum);
  return {
    ...gcs,
    score
  };
}

export function getGlasgowInterpretation(score: number): { text: string; severity: 'low' | 'medium' | 'high' } {
  if (score >= 13) return { text: 'Disfunção Neurológica Leve (Glasgow 13-15)', severity: 'low' };
  if (score >= 9) return { text: 'Disfunção Neurológica Moderada (Glasgow 9-12)', severity: 'medium' };
  return { text: 'Disfunção Neurológica Grave (Glasgow 3-8) - Necessidade de vigilância de via aérea', severity: 'high' };
}

/**
 * Richmond Agitation-Sedation Scale (RASS) descriptions
 */
export const RASS_OPTIONS = [
  { value: '+4', label: '+4 - Combativo', desc: 'Paciente violento, perigo imediato para a equipe.' },
  { value: '+3', label: '+3 - Muito Agitado', desc: 'Puxa tubos, cateteres; agressivo.' },
  { value: '+2', label: '+2 - Agitado', desc: 'Movimentos frequentes, luta contra respirador.' },
  { value: '+1', label: '+1 - Inquieto', desc: 'Ansioso, movimentos discretos sem agressividade.' },
  { value: '0', label: '0 - Alerta e Calmo', desc: 'Estado normal de vigília.' },
  { value: '-1', label: '-1 - Sonolento', desc: 'Desperta com verbal (olhos abertos >10s).' },
  { value: '-2', label: '-2 - Sedação Leve', desc: 'Desperta brevemente com verbal (olhos <10s).' },
  { value: '-3', label: '-3 - Sedação Moderada', desc: 'Movimento ou abertura dos olhos ao estímulo verbal (sem contato visual).' },
  { value: '-4', label: '-4 - Sedação Profunda', desc: 'Nenhuma resposta ao estímulo verbal, mas reage ao estímulo físico.' },
  { value: '-5', label: '-5 - Não Despertável', desc: 'Nenhuma resposta a estímulos verbais ou físicos.' },
];

export function getRassTargetMessage(val: string): { label: string; feedback: string; style: string } {
  const num = parseInt(val, 10);
  if (isNaN(num)) return { label: 'Alerta/Calmo', feedback: 'Sem sedação ativa registrada.', style: 'text-slate-600 bg-slate-50 border-slate-200' };

  if (num >= 2) {
    return {
      label: 'Agitado / Hiperativo',
      feedback: 'Risco de auto-extubação ou perda de acessos. Considerar otimização analgésica/sedativa.',
      style: 'text-amber-700 bg-amber-50 border-amber-200'
    };
  }
  if (num === 1) {
    return {
      label: 'Levemente Inquieto',
      feedback: 'Monitorar sinais de dor, delírio ou desconforto.',
      style: 'text-yellow-700 bg-yellow-50 border-yellow-200'
    };
  }
  if (num === 0) {
    return {
      label: 'Alerta e Calmo (Ideal)',
      feedback: 'Excelente. Alinhado às diretrizes de despertar diário quando tolerável.',
      style: 'text-emerald-700 bg-emerald-50 border-emerald-200'
    };
  }
  if (num === -1 || num === -2) {
    return {
      label: 'Sedação Leve (Ideal para a maioria na VM)',
      feedback: 'Nível adequado de sedação protetora para permitir ventilação espontânea/interação.',
      style: 'text-sky-700 bg-sky-50 border-sky-200'
    };
  }
  if (num === -3) {
    return {
      label: 'Sedação Moderada',
      feedback: 'Monitorar necessidade. Costuma ser aceito em fases iniciais ou desconforto respiratório severo.',
      style: 'text-indigo-700 bg-indigo-50 border-indigo-200'
    };
  }
  // -4 ou -5
  return {
    label: 'Sedação Profunda',
    feedback: 'Sedação profunda. Indicada para SARA grave, hipertensão intracraniana ou bloqueio neuromuscular.',
    style: 'text-purple-700 bg-purple-50 border-purple-200'
  };
}

/**
 * Calculates Behavioral Pain Scale (BPS) for sedated patients
 */
export function calculateBps(bps: Omit<BpsScale, 'score'>): BpsScale {
  const score = bps.expressaoFacial + bps.membrosSuperiores + bps.toleranciaVentilacao;
  return {
    ...bps,
    score
  };
}

export function interpretBps(score: number): { text: string; indication: string; color: string } {
  if (score <= 5) {
    return {
      text: 'Dor Ausente ou Controlada',
      indication: 'Analgesia adequada no momento.',
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200'
    };
  }
  if (score <= 7) {
    return {
      text: 'Dor Leve a Moderada',
      indication: 'Sugerida reavaliação de doses analgésicas ou resgate antes de procedimentos dolorosos.',
      color: 'text-amber-600 bg-amber-50 border-amber-200'
    };
  }
  return {
    text: 'Dor Grave / Desconforto Agudo',
    indication: 'Dor importante! Requer otimização urgente do esquema de infusão contínua ou bólus de analgésico.',
    color: 'text-rose-600 bg-rose-50 border-rose-200'
  };
}

/**
 * Calculates CAM-ICU Delirium check
 */
export function calculateCamIcu(cam: Omit<CamIcuScale, 'hasDelirium'>): CamIcuScale {
  // Delirium is positive if:
  // 1 (Acute change/fluctuation) AND 2 (Inattention) AND (3 (Disorganized thinking) OR 4 (Altered level of consciousness [RASS != 0]))
  const hasDelirium = !!(
    cam.alteracaoAguda &&
    cam.desatencao &&
    (cam.pensamentoDesorganizado || cam.nivelConscienciaAlterado)
  );

  return {
    ...cam,
    hasDelirium
  };
}

/**
 * Mottling Score (Escore de Livedo) descriptions & interpretation
 */
export const MOTTLING_OPTIONS = [
  { value: '0', label: 'Escore 0: Sem livedo', desc: 'Pele de coloração normal na área do joelho.' },
  { value: '1', label: 'Escore 1: Moeda de 1 real na patela', desc: 'Pequena área de livedo centralizada na patela.' },
  { value: '2', label: 'Escore 2: Não ultrapassa o bordo superior', desc: 'Livedo que preenche o joelho sem passar do bordo superior da patela.' },
  { value: '3', label: 'Escore 3: Ultrapassa o bordo superior', desc: 'Livedo que se estende acima da patela até o terço inferior da coxa.' },
  { value: '4', label: 'Escore 4: Estende-se até a metade da coxa', desc: 'Livedo proeminente atingindo a porção central/média da coxa.' },
  { value: '5', label: 'Escore 5: Livedo extenso além da coxa', desc: 'Livedo grave que vai até a prega inguinal, flancos ou abdômen.' },
];

export function interpretMottling(val: string): { label: string; indication: string; color: string } {
  const m = parseInt(val, 10);
  if (isNaN(m) || m === 0) {
    return { label: 'Sem Livedo (Grau 0)', indication: 'Boa perfusão periférica macrovascular.', color: 'text-emerald-700 bg-emerald-50' };
  }
  if (m <= 2) {
    return {
      label: `Livedo Discreto/Moderado (Grau ${m})`,
      indication: 'Leve disfunção de perfusão periférica. Monitorar hemodinâmica.',
      color: 'text-amber-700 bg-amber-50'
    };
  }
  return {
    label: `Livedo Intenso/Grave (Grau ${m})`,
    indication: 'Marcador biológico de choque circulatório e hipoperfusão tecidual grave. Fortemente associado a alta mortalidade em 14 dias.',
    color: 'text-rose-700 bg-rose-50 border-rose-200'
  };
}

/**
 * Tobin Index (Rapid Shallow Breathing Index - RSBI)
 * Tobin = FR (irpm) / (Volume Corrente em Litros)
 */
export function calculateTobin(fr: string, vcMlh: string): number | null {
  const f = parseFloat(fr);
  const vc = parseFloat(vcMlh);
  if (!f || !vc || vc <= 0) return null;
  // Convert VC (mL) to Liters (L)
  const vcL = vc / 1000;
  return Math.round((f / vcL) * 10) / 10;
}

export function interpretTobin(value: number): { text: string; color: string } {
  if (value < 105) {
    return {
      text: `Tobin ${value}: < 105. Indica potencial de sucesso no desmame ventilatório (boa força e volume-minuto).`,
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200'
    };
  }
  return {
    text: `Tobin ${value}: ≥ 105. Alto risco de falha de extubação! Indica respiração rápida e superficial (fadiga diafragmática).`,
    color: 'text-rose-700 bg-rose-50 border-rose-200'
  };
}

/**
 * PaO2 / FiO2 Ratio
 * P/F = PaO2 / (FiO2 / 100)
 */
export function calculatePF(po2: string, fio2: string): number | null {
  const p = parseFloat(po2);
  const f = parseFloat(fio2);
  if (!p || !f || f <= 0) return null;
  const fFraction = f > 1 ? f / 100 : f; // handle 50% vs 0.5 input
  return Math.round(p / fFraction);
}

export function interpretPF(pf: number): { text: string; rime: string; color: string } {
  if (pf > 300) {
    return { text: 'Parâmetro gasométrico normal.', rime: 'Troca Gasosa Preservada', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
  }
  if (pf > 200) {
    return { text: 'SARA Leve (Síndrome da Angústia Respiratória Aguda)', rime: 'SARA Leve', color: 'text-yellow-700 bg-yellow-50 border-yellow-200' };
  }
  if (pf > 100) {
    return { text: 'SARA Moderada. Necessita de titulação cuidadosa de PEEP e monitoramento de Drive Pressure.', rime: 'SARA Moderada', color: 'text-amber-700 bg-amber-50 border-amber-200' };
  }
  return { text: 'SARA Grave! Hipoxemia grave. Considerar posição prona, bloqueador neuromuscular ou recrutamento alveolar protetor.', rime: 'SARA Grave', color: 'text-rose-700 bg-rose-50 border-rose-200' };
}

/**
 * Calculates Driving Pressure
 * DP = PPlato - PEEP
 */
export function calculateDrivingPressure(pPlato: string, peep: string): number | null {
  const plat = parseFloat(pPlato);
  const p = parseFloat(peep);
  if (isNaN(plat) || isNaN(p)) return null;
  return Math.round((plat - p) * 10) / 10;
}

/**
 * Calculates Static Compliance
 * Cst = Volume Corrente / (PPlato - PEEP)
 */
export function calculateStaticCompliance(vc: string, pPlato: string, peep: string): number | null {
  const vol = parseFloat(vc);
  const plat = parseFloat(pPlato);
  const p = parseFloat(peep);
  if (isNaN(vol) || isNaN(plat) || isNaN(p) || (plat - p) <= 0) return null;
  return Math.round((vol / (plat - p)) * 10) / 10;
}

/**
 * Calculates Airway Resistance (Pressão Resistiva em VCV)
 * R = (PPico - PPlato) / (Fluxo / 60)
 */
export function calculateAirwayResistance(pPico: string, pPlato: string, fluxo: string): number | null {
  const pic = parseFloat(pPico);
  const plat = parseFloat(pPlato);
  const fl = parseFloat(fluxo);
  if (isNaN(pic) || isNaN(plat) || isNaN(fl) || fl <= 0) return null;
  const flowPerSecond = fl / 60;
  return Math.round(((pic - plat) / flowPerSecond) * 10) / 10;
}

/**
 * Calculates Time Constant
 * Constante de Tempo = Complacência Estática * Resistência das Vias Aéreas / 1000
 */
export function calculateTimeConstant(compliance: number | null, resistance: number | null): number | null {
  if (compliance === null || resistance === null) return null;
  return Math.round(((compliance * resistance) / 1000) * 100) / 100;
}

/**
 * Cockcroft-Gault TFG Estimator
 */
export function estimateTfg(age: string, weight: string, creat: string, sex: 'Masculino' | 'Feminino' | ''): number | null {
  const a = parseFloat(age);
  const w = parseFloat(weight);
  const cr = parseFloat(creat);
  if (!a || !w || !cr || cr <= 0 || !sex) return null;

  let multiplier = 1;
  if (sex === 'Feminino') multiplier = 0.85;

  const tfg = ((140 - a) * w * multiplier) / (72 * cr);
  return Math.round(tfg * 10) / 10;
}

/**
 * Calculates Ideal Body Weight (IBW / Predicted Body Weight - PBW)
 * Devine Formula (clinical standard for lung protection target volumes)
 */
export function calculateIdealWeight(alturaStr: string, sex: 'Masculino' | 'Feminino' | ''): number | null {
  const alt = parseFloat(alturaStr);
  if (!alt || alt <= 0 || !sex) return null;

  // Handle meters (e.g. 1.75) vs centimeters (e.g. 175)
  let heightCm = alt;
  if (alt < 3) {
    heightCm = alt * 100;
  }

  if (heightCm < 100) return null; // out of reasonable bounds

  if (sex === 'Masculino') {
    const ibw = 50 + 0.91 * (heightCm - 152.4);
    return Math.round(ibw * 10) / 10;
  } else if (sex === 'Feminino') {
    const ibw = 45.5 + 0.91 * (heightCm - 152.4);
    return Math.round(ibw * 10) / 10;
  }

  return null;
}

/**
 * Calculates DVA / Sedative real-time dose based on weight, flow (mL/h) and concentration
 */
export function calculateDvaDose(
  weightStr: string,
  concentrationStr: string,
  concentrationUnit: 'mg/mL' | 'mcg/mL' | 'UI/mL',
  flowStr: string,
  doseUnit: 'mcg/kg/min' | 'mcg/kg/h' | 'UI/min' | 'mg/kg/h' | 'mg/kg/min'
): string {
  const w = parseFloat(weightStr);
  const c = parseFloat(concentrationStr);
  const f = parseFloat(flowStr);
  if (isNaN(c) || isNaN(f) || c <= 0 || f < 0) return '';

  // Determine standard amount per hour delivered based on concentration unit
  // Default base quantities: mg, mcg, UI
  const rawAmountPerHour = c * f; // In concentration unit / hour

  let amountMgPerHour = 0;
  let amountMcgPerHour = 0;
  let amountUiPerHour = 0;

  if (concentrationUnit === 'mg/mL') {
    amountMgPerHour = rawAmountPerHour;
    amountMcgPerHour = rawAmountPerHour * 1000;
    amountUiPerHour = rawAmountPerHour;
  } else if (concentrationUnit === 'mcg/mL') {
    amountMgPerHour = rawAmountPerHour / 1000;
    amountMcgPerHour = rawAmountPerHour;
    amountUiPerHour = rawAmountPerHour;
  } else if (concentrationUnit === 'UI/mL') {
    amountMgPerHour = rawAmountPerHour / 1000; 
    amountMcgPerHour = rawAmountPerHour; 
    amountUiPerHour = rawAmountPerHour;
  }

  let calculatedDose = 0;

  if (doseUnit.includes('/kg/') && (isNaN(w) || w <= 0)) {
    return 'Requer Peso';
  }

  switch (doseUnit) {
    case 'mcg/kg/min':
      calculatedDose = amountMcgPerHour / 60 / w;
      break;
    case 'mcg/kg/h':
      calculatedDose = amountMcgPerHour / w;
      break;
    case 'UI/min':
      calculatedDose = amountUiPerHour / 60;
      break;
    case 'mg/kg/h':
      calculatedDose = amountMgPerHour / w;
      break;
    case 'mg/kg/min':
      calculatedDose = amountMgPerHour / 60 / w;
      break;
    default:
      return '';
  }

  if (calculatedDose === 0) return '0';
  if (calculatedDose < 0.001) return calculatedDose.toFixed(4);
  if (calculatedDose < 0.1) return calculatedDose.toFixed(3);
  return calculatedDose.toFixed(2);
}

