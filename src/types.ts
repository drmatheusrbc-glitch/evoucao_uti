export interface PatientIdInfo {
  data: string;
  leito: string;
  nome: string;
  idade: string;
  peso: string;
  altura: string; // in cm, e.g. 175
  sexo: 'Masculino' | 'Feminino' | '';
  dih: string; // Dias de Internação Hospitalar
}

export interface VitalSigns {
  fc: string; // bpm
  pas: string; // mmHg
  pad: string; // mmHg
  pam: number | null; // calculated: (pas + 2*pad)/3
  fr: string; // irpm
  sat: string; // %
  tx: string; // °C
}

export interface GlasgowScale {
  aberturaOcular: number; // 1-4
  respostaVerbal: number; // 1-5 (or 0 for T / Intubated)
  respostaMotora: number; // 1-6
  reatividadePupilar: number; // 0, -1, -2 (pupil subscores)
  score: number | null;
}

export interface BpsScale {
  expressaoFacial: number; // 1-4
  membrosSuperiores: number; // 1-4
  toleranciaVentilacao: number; // 1-4
  score: number | null;
}

export interface CamIcuScale {
  alteracaoAguda: boolean | null;
  desatencao: boolean | null;
  pensamentoDesorganizado: boolean | null;
  nivelConscienciaAlterado: boolean | null; // RASS != 0
  hasDelirium: boolean | null;
}

export interface Pupilas {
  tamanho: 'Isocóricas' | 'Anisocóricas' | 'Mióticas' | 'Midriáticas' | '';
  simetria: 'Simétricas' | 'Assimétricas' | '';
  reflexoFotomotor: 'Fotorreagente bilateral' | 'Não fotorreagente bilateral' | 'Apenas D reagente' | 'Apenas E reagente' | '';
  detalhePupilas: string;
}

export interface NeurologicalInfo {
  comSedacao: boolean;
  rass: string; // e.g. -5 to +4
  bps: BpsScale;
  reflexos: string;
  ecgGcs: GlasgowScale;
  evaDor: string; // Escala Visual Analógica (0-10)
  camIcu: CamIcuScale;
  pupilas: Pupilas;
}

export interface DvaRow {
  id: string;
  dva: string; // e.g., Noradrenalina, Midazolam
  concentracao: string; // numeric value as string
  concentracaoUnidade: 'mg/mL' | 'mcg/mL' | 'UI/mL';
  mlh: string; // flow rate (mL/h)
  doseUnidade: 'mcg/kg/min' | 'mcg/kg/h' | 'UI/min' | 'mg/kg/h' | 'mg/kg/min';
  dose: string; // estimated dose calculated in real-time
}

export interface CardiovascularInfo {
  ritmo: 'Regular' | 'Irregular' | '';
  tec: string; // Tempo de enchimento capilar
  cianose: boolean;
  livedoMottling: string; // 0 to 5
  temperaturaExtremidades: 'Quentes' | 'Frias' | '';
  edemaExtremidades: 'Ausente' | '+' | '++' | '+++' | '++++' | '';
  auscultaCardiaca: string;
  pulsosPerifericos: string;
  dvas: DvaRow[];
}

export interface VentiladorSettings {
  modo: 'VCV' | 'PCV' | 'PSV' | 'VNI' | 'Outro' | '';
  volumeCorrente: string; // mL
  fr: string; // irpm
  fio2: string; // %
  peep: string; // cmH2O
  sensibilidade: string; // cmH2O ou L/min
  fluxo: string; // L/min
  volumeMinuto: string; // L/min
  relacaoIE: string; // e.g., 1:2
  ppico: string; // cmH2O
  pplato: string; // cmH2O
  dp: number | null; // Driving pressure = pplato - peep
  autoPeep: string; // cmH2O
  complacenciaEst: number | null; // VolumeCorrente / (pplato - peep)
  pressaoResistiva: number | null; // (Ppico - Pplato) / (Fluxo / 60)
  constanteTempo: number | null; // (ComplacenciaEst * PressaoResistiva) / 1000
  pressao: string;
  pressaoSuporte: string;
  backup: string;
  tobin: number | null; // FR / VC em L
  relacaoPF: number | null; // PaO2 / (FiO2/100)
}

export interface RespiratoryInfo {
  tipoSuporte: 'Ar Ambiente' | 'IOT' | 'Traqueostomia' | 'Cateter/Venturi' | '';
  iotData: string;
  iotRima: string;
  traqueoData: string;
  traqueoCanula: string;
  cateterVariavel: string; // Vazão de O2
  padraoVentilatorio: string;
  mvPresente: boolean; // if true, bilaterally present; if false, decreased in some area
  mvDiminuidoLado: string; // e.g. 'Base E', 'Bilateral'
  crepitacaoLado: string;
  estertorLado: string;
  sibiloLado: string;
  roncoLado: string;
  ventilador: VentiladorSettings;
  gasometria: {
    ph: string;
    po2: string;
    pco2: string;
    sat: string;
    bic: string;
    be: string;
  };
}

export interface NephrologyInfo {
  diurese: string;
  entradas: string;
  bh: number | null; // Balanço Hídrico
  hemodialise: string; // Tempo e saída
  ureia: string;
  creat: string;
  tfg: string; // Taxa de Filtração Glomerular
  na: string;
  k: string;
  ca: string;
  p: string;
  mg: string;
  aspectoUrina: string;
}

export interface GastrointestinalInfo {
  abdomeRha: 'RHA+' | 'RHA-' | '';
  abdomeCaracteristicas: {
    flacido: boolean;
    distendido: boolean;
    doloroso: boolean;
    indolor: boolean;
  };
  dieta: 'Oral' | 'SNE' | 'GTT' | 'Parenteral' | '';
  vazao: string;
  kcal: string;
  proteinas: string;
  evacuacao: 'Sim' | 'Não' | '';
  evacuacaoDias: string;
}

export interface HematologyInfo {
  sangramento: 'Ausente' | 'Presente' | '';
  sangramentoLocal: string;
  cateterDiaInsercao: string;
  hb: string;
  ht: string;
  plaqueta: string;
  leucocitos: string;
  bastao: string;
  irn: string;
}

export interface AntibiticoRow {
  id: string;
  nome: string;
  d0: string;
  diasTotais: string;
}

export interface CulturaRow {
  id: string;
  data: string;
  cultura: string;
  resultado: string;
}

export interface Profilaxias {
  tvp: string;
  colirio: string;
  ulceraGastrica: string;
}

export interface ClinicalEvolutionState {
  id: string; // Unique simulation identification
  patientId: PatientIdInfo;
  vitals: VitalSigns;
  neurology: NeurologicalInfo;
  cardiovascular: CardiovascularInfo;
  respiratory: RespiratoryInfo;
  nephrology: NephrologyInfo;
  gi: GastrointestinalInfo;
  hematology: HematologyInfo;
  infectious: {
    antibioticos: AntibiticoRow[];
    culturas: CulturaRow[];
  };
  profilaxias: Profilaxias;
  anotacoesMedicas: string;
  createdAt: string;
}
