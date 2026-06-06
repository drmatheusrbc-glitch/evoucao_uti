import React, { useState, useEffect } from 'react';
import { ClinicalEvolutionState, PatientIdInfo, VitalSigns, NeurologicalInfo, CardiovascularInfo, RespiratoryInfo, NephrologyInfo, GastrointestinalInfo, HematologyInfo, Profilaxias } from './types';
import PatientIdent from './components/PatientIdent';
import NeurologySection from './components/NeurologySection';
import CardioSection from './components/CardioSection';
import RespiroSection from './components/RespiroSection';
import NefroSection from './components/NefroSection';
import GIAndOthers from './components/GIAndOthers';
import ClinicalSummary from './components/ClinicalSummary';
import { Heart, Activity, FileText, Plus, Landmark, Users, ClipboardCopy, Info } from 'lucide-react';

const INITIAL_STATE: Omit<ClinicalEvolutionState, 'id' | 'createdAt'> = {
  patientId: {
    data: '',
    leito: '',
    nome: '',
    idade: '',
    peso: '',
    altura: '',
    sexo: '',
    dih: ''
  },
  vitals: {
    fc: '',
    pas: '',
    pad: '',
    pam: null,
    fr: '',
    sat: '',
    tx: ''
  },
  neurology: {
    comSedacao: false,
    rass: '0',
    bps: {
      expressaoFacial: 1,
      membrosSuperiores: 1,
      toleranciaVentilacao: 1,
      score: 3
    },
    reflexos: '',
    ecgGcs: {
      aberturaOcular: 4,
      respostaVerbal: 5,
      respostaMotora: 6,
      reatividadePupilar: 0,
      score: 15
    },
    evaDor: '0',
    camIcu: {
      alteracaoAguda: false,
      desatencao: false,
      pensamentoDesorganizado: false,
      nivelConscienciaAlterado: false,
      hasDelirium: false
    },
    pupilas: {
      tamanho: 'Isocóricas',
      simetria: 'Simétricas',
      reflexoFotomotor: 'Fotorreagente bilateral',
      detalhePupilas: ''
    }
  },
  cardiovascular: {
    ritmo: 'Regular',
    tec: '',
    cianose: false,
    livedoMottling: '0',
    temperaturaExtremidades: 'Quentes',
    edemaExtremidades: 'Ausente',
    auscultaCardiaca: '',
    pulsosPerifericos: '',
    dvas: []
  },
  respiratory: {
    tipoSuporte: 'Ar Ambiente',
    iotData: '',
    iotRima: '',
    traqueoData: '',
    traqueoCanula: '',
    cateterVariavel: '',
    padraoVentilatorio: '',
    mvPresente: true,
    mvDiminuidoLado: '',
    crepitacaoLado: '',
    estertorLado: '',
    sibiloLado: '',
    roncoLado: '',
    ventilador: {
      modo: '',
      volumeCorrente: '',
      fr: '',
      fio2: '',
      peep: '',
      sensibilidade: '',
      fluxo: '',
      volumeMinuto: '',
      relacaoIE: '1:2',
      ppico: '',
      pplato: '',
      dp: null,
      autoPeep: '',
      complacenciaEst: null,
      pressaoResistiva: null,
      constanteTempo: null,
      pressao: '',
      pressaoSuporte: '',
      backup: '',
      tobin: null,
      relacaoPF: null
    },
    gasometria: {
      ph: '',
      po2: '',
      pco2: '',
      sat: '',
      bic: '',
      be: ''
    }
  },
  nephrology: {
    diurese: '',
    entradas: '',
    bh: null,
    hemodialise: '',
    ureia: '',
    creat: '',
    tfg: '',
    na: '',
    k: '',
    ca: '',
    p: '',
    mg: '',
    aspectoUrina: ''
  },
  gi: {
    abdomeRha: 'RHA+',
    abdomeCaracteristicas: {
      flacido: true,
      distendido: false,
      doloroso: false,
      indolor: true
    },
    dieta: 'Oral',
    vazao: '',
    kcal: '',
    proteinas: '',
    evacuacao: 'Sim',
    evacuacaoDias: ''
  },
  hematology: {
    sangramento: 'Ausente',
    sangramentoLocal: '',
    cateterDiaInsercao: '',
    hb: '',
    ht: '',
    plaqueta: '',
    leucocitos: '',
    bastao: '',
    irn: ''
  },
  infectious: {
    antibioticos: [],
    culturas: []
  },
  profilaxias: {
    tvp: 'Farmacológica ativa',
    colirio: 'Não se aplica (Vigil/Piscando)',
    ulceraGastrica: 'Inibidor de Bomba de Prótons ativo'
  },
  anotacoesMedicas: ''
};

const TEMPLATE_ICU_PATIENT: Omit<ClinicalEvolutionState, 'id' | 'createdAt'> = {
  patientId: {
    data: new Date().toLocaleDateString('pt-BR'),
    leito: 'Box 03 (UTI)',
    nome: 'Carlos Eduardo Ferreira da Silva',
    idade: '58',
    peso: '82',
    altura: '175',
    sexo: 'Masculino',
    dih: '5'
  },
  vitals: {
    fc: '86',
    pas: '128',
    pad: '74',
    pam: 92,
    fr: '14',
    sat: '96',
    tx: '36.6'
  },
  neurology: {
    comSedacao: true,
    rass: '-2',
    bps: {
      expressaoFacial: 1,
      membrosSuperiores: 1,
      toleranciaVentilacao: 2,
      score: 4
    },
    reflexos: 'Corneano, pupilar e tosse presentes bilateralmente. Força simétrica aos estímulos dolorosos.',
    ecgGcs: {
      aberturaOcular: 2,
      respostaVerbal: 0,
      respostaMotora: 4,
      reatividadePupilar: 0,
      score: 6
    },
    evaDor: '0',
    camIcu: {
      alteracaoAguda: false,
      desatencao: false,
      pensamentoDesorganizado: false,
      nivelConscienciaAlterado: true,
      hasDelirium: false
    },
    pupilas: {
      tamanho: 'Isocóricas',
      simetria: 'Simétricas',
      reflexoFotomotor: 'Fotorreagente bilateral',
      detalhePupilas: 'Pupilas medindo 2mm bilateralmente, simétricas, reativas.'
    }
  },
  cardiovascular: {
    ritmo: 'Regular',
    tec: '2.5',
    cianose: false,
    livedoMottling: '1',
    temperaturaExtremidades: 'Quentes',
    edemaExtremidades: 'Ausente',
    auscultaCardiaca: 'RCR 2T BNF sem sopros, sopros sistólicos ausentes.',
    pulsosPerifericos: 'Simétricos, cheios e palpáveis em todos os membros.',
    dvas: [
      {
        id: 'nor01',
        dva: 'Noradrenalina',
        concentracao: '0.16',
        concentracaoUnidade: 'mg/mL',
        mlh: '8',
        doseUnidade: 'mcg/kg/min',
        dose: '0.26'
      },
      {
        id: 'mid01',
        dva: 'Midazolam',
        concentracao: '1.0',
        concentracaoUnidade: 'mg/mL',
        mlh: '10',
        doseUnidade: 'mg/kg/h',
        dose: '0.12'
      }
    ]
  },
  respiratory: {
    tipoSuporte: 'IOT',
    iotData: '02/06',
    iotRima: '22',
    traqueoData: '',
    traqueoCanula: '',
    cateterVariavel: '',
    padraoVentilatorio: 'Paciente síncrono com a ventilação mecânica controlada, sem uso de musculatura acessória.',
    mvPresente: true,
    mvDiminuidoLado: '',
    crepitacaoLado: '',
    estertorLado: 'Discreta secreção em base pulmonar direita',
    sibiloLado: '',
    roncoLado: '',
    ventilador: {
      modo: 'VCV',
      volumeCorrente: '420',
      fr: '14',
      fio2: '40',
      peep: '8',
      sensibilidade: '2.0 L/min',
      fluxo: '60',
      volumeMinuto: '5.8',
      relacaoIE: '1:2',
      ppico: '24',
      pplato: '18',
      dp: 10,
      autoPeep: '1',
      complacenciaEst: 42,
      pressaoResistiva: 6,
      constanteTempo: 0.25,
      pressao: '',
      pressaoSuporte: '',
      backup: '',
      tobin: null,
      relacaoPF: 212
    },
    gasometria: {
      ph: '7.38',
      po2: '85',
      pco2: '42',
      sat: '97',
      bic: '24.2',
      be: '-1.2'
    }
  },
  nephrology: {
    diurese: '1450',
    entradas: '2100',
    bh: 650,
    hemodialise: 'Não realizada',
    ureia: '54',
    creat: '1.25',
    tfg: '75.2',
    na: '138',
    k: '4.1',
    ca: '8.8',
    p: '3.4',
    mg: '2.1',
    aspectoUrina: 'Citrino límpido'
  },
  gi: {
    abdomeRha: 'RHA+',
    abdomeCaracteristicas: {
      flacido: true,
      distendido: false,
      doloroso: false,
      indolor: true
    },
    dieta: 'SNE',
    vazao: '65',
    kcal: '1500',
    proteinas: '75',
    evacuacao: 'Sim',
    evacuacaoDias: ''
  },
  hematology: {
    sangramento: 'Ausente',
    sangramentoLocal: '',
    cateterDiaInsercao: 'PIA Radial Esquerda inserida em 02/06 (D4). CVC Jugular Interna D inserida em 02/06 (D4).',
    hb: '11.5',
    ht: '35.1',
    plaqueta: '185000',
    leucocitos: '10400',
    bastao: '4',
    irn: '1.14'
  },
  infectious: {
    antibioticos: [
      {
        id: 'atb01',
        nome: 'Piperacilina/Tazobactam (Tazocin) 4.5g IV q6h',
        d0: '02/06',
        diasTotais: '4'
      }
    ],
    culturas: [
      {
        id: 'clt01',
        data: '02/06',
        cultura: 'Hemocultura Central',
        resultado: 'Negativo'
      }
    ]
  },
  profilaxias: {
    tvp: 'Enoxaparina 40mg SC QD',
    colirio: 'Metilcelulose colírio 1gta VO 4/4h (Proteção ocular)',
    ulceraGastrica: 'Omeprazol 40mg IV QD'
  },
  anotacoesMedicas: 'Paciente em melhora hemodinâmica gradual sob dose moderada de vasopressores. Sedado levemente para otimização ventilatória protetora (RASS -2). Despertar diário planejado para as próximas 24 horas se perfusão periférica (Mottling e TEC) se mantiverem estáveis.'
};

export default function App() {
  const [currentId, setCurrentId] = useState<string>('');
  const [patientId, setPatientId] = useState<PatientIdInfo>(INITIAL_STATE.patientId);
  const [vitals, setVitals] = useState<VitalSigns>(INITIAL_STATE.vitals);
  const [neurology, setNeurology] = useState<NeurologicalInfo>(INITIAL_STATE.neurology);
  const [cardiovascular, setCardiovascular] = useState<CardiovascularInfo>(INITIAL_STATE.cardiovascular);
  const [respiratory, setRespiratory] = useState<RespiratoryInfo>(INITIAL_STATE.respiratory);
  const [nephrology, setNephrology] = useState<NephrologyInfo>(INITIAL_STATE.nephrology);
  const [gi, setGi] = useState<GastrointestinalInfo>(INITIAL_STATE.gi);
  const [hematology, setHematology] = useState<HematologyInfo>(INITIAL_STATE.hematology);
  const [infectious, setInfectious] = useState<ClinicalEvolutionState['infectious']>(INITIAL_STATE.infectious);
  const [profilaxias, setProfilaxias] = useState<Profilaxias>(INITIAL_STATE.profilaxias);
  const [anotacoes, setAnotacoes] = useState<string>(INITIAL_STATE.anotacoesMedicas);

  // Saved list in localStorage
  const [savedRecords, setSavedRecords] = useState<ClinicalEvolutionState[]>([]);

  // Load records from local storage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('bedside_icu_evolutions');
      if (stored) {
        const parsed = JSON.parse(stored) as ClinicalEvolutionState[];
        setSavedRecords(parsed);
        if (parsed.length > 0) {
          loadPatientRecord(parsed[0]);
        } else {
          startNewBlankPatient();
        }
      } else {
        startNewBlankPatient();
      }
    } catch (e) {
      console.error('Error loading stored records', e);
      startNewBlankPatient();
    }
  }, []);

  // Save the record to memory each time any field changes (Debounced or instant)
  const saveStateToLocalStorage = (recordsToSave: ClinicalEvolutionState[]) => {
    localStorage.setItem('bedside_icu_evolutions', JSON.stringify(recordsToSave));
  };

  const getFullActiveState = (): ClinicalEvolutionState => {
    return {
      id: currentId,
      patientId,
      vitals,
      neurology,
      cardiovascular,
      respiratory,
      nephrology,
      gi,
      hematology,
      infectious,
      profilaxias,
      anotacoesMedicas: anotacoes,
      createdAt: new Date().toISOString()
    };
  };

  const startNewBlankPatient = () => {
    const newId = Math.random().toString(36).substring(3, 9);
    setCurrentId(newId);
    setPatientId({...INITIAL_STATE.patientId, data: new Date().toLocaleDateString('pt-BR')});
    setVitals(INITIAL_STATE.vitals);
    setNeurology(INITIAL_STATE.neurology);
    setCardiovascular(INITIAL_STATE.cardiovascular);
    setRespiratory(INITIAL_STATE.respiratory);
    setNephrology(INITIAL_STATE.nephrology);
    setGi(INITIAL_STATE.gi);
    setHematology(INITIAL_STATE.hematology);
    setInfectious(INITIAL_STATE.infectious);
    setProfilaxias(INITIAL_STATE.profilaxias);
    setAnotacoes(INITIAL_STATE.anotacoesMedicas);
  };

  const handleSavePatient = () => {
    const active = getFullActiveState();
    let updated: ClinicalEvolutionState[];
    const exists = savedRecords.find(r => r.id === active.id);
    if (exists) {
      updated = savedRecords.map(r => r.id === active.id ? active : r);
    } else {
      updated = [...savedRecords, active];
    }
    setSavedRecords(updated);
    saveStateToLocalStorage(updated);
    alert('Evolução do paciente salva com sucesso na lista local!')
  };

  const handleRemoveSavedPatient = (idToRemove: string) => {
    const updated = savedRecords.filter(r => r.id !== idToRemove);
    setSavedRecords(updated);
    saveStateToLocalStorage(updated);
    if (currentId === idToRemove) {
      if (updated.length > 0) {
        loadPatientRecord(updated[0]);
      } else {
        startNewBlankPatient();
      }
    }
  };

  const loadPatientRecord = (rec: ClinicalEvolutionState) => {
    setCurrentId(rec.id);
    setPatientId(rec.patientId);
    setVitals(rec.vitals);
    setNeurology(rec.neurology);
    setCardiovascular(rec.cardiovascular);
    setRespiratory(rec.respiratory);
    setNephrology(rec.nephrology);
    setGi(rec.gi);
    setHematology(rec.hematology);
    setInfectious(rec.infectious);
    setProfilaxias(rec.profilaxias);
    setAnotacoes(rec.anotacoesMedicas || '');
  };

  // Pre-fill realistic ICU patient data
  const handleLoadDemoTemplate = () => {
    const demoId = Math.random().toString(36).substring(3, 9);
    setCurrentId(demoId);
    setPatientId({...TEMPLATE_ICU_PATIENT.patientId, data: new Date().toLocaleDateString('pt-BR')});
    setVitals(TEMPLATE_ICU_PATIENT.vitals);
    setNeurology(TEMPLATE_ICU_PATIENT.neurology);
    setCardiovascular(TEMPLATE_ICU_PATIENT.cardiovascular);
    setRespiratory(TEMPLATE_ICU_PATIENT.respiratory);
    setNephrology(TEMPLATE_ICU_PATIENT.nephrology);
    setGi(TEMPLATE_ICU_PATIENT.gi);
    setHematology(TEMPLATE_ICU_PATIENT.hematology);
    setInfectious(TEMPLATE_ICU_PATIENT.infectious);
    setProfilaxias(TEMPLATE_ICU_PATIENT.profilaxias);
    setAnotacoes(TEMPLATE_ICU_PATIENT.anotacoesMedicas);
  };

  const handleClearAllFields = () => {
    if (window.confirm('Tem certeza de que deseja limpar todos os campos desta evolução? Os dados não salvos serão perdidos.')) {
      startNewBlankPatient();
    }
  };

  const activeFullState = getFullActiveState();

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-800 pt-0">
      {/* Clinician Bedside ICU Applet Header */}
      <header id="icu-header-container" className="bg-slate-900 border-b border-slate-850 px-6 py-4 text-white relative sm:sticky top-0 left-0 right-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-indigo-700 text-white rounded-xl shadow-lg border border-indigo-400">
              <Heart className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <h1 id="app-header-title" className="text-md sm:text-lg font-sans font-bold tracking-tight">Evolução Beira-Leito UTI</h1>
              <p className="text-[10px] sm:text-xs text-slate-400 font-medium">Avaliação Crítica e Calculador Automático de Escores Médicos</p>
            </div>
          </div>

          {/* Quick loading / Patient list selector */}
          <div className="flex items-center gap-2">
            {savedRecords.length > 0 && (
              <div className="flex items-center gap-1.5 pl-0 sm:pl-3">
                <select
                  id="active-patient-selector"
                  className="bg-slate-800 border border-slate-700 text-xs text-white rounded-lg p-2 max-w-[200px]"
                  value={currentId}
                  onChange={(e) => {
                    const found = savedRecords.find(r => r.id === e.target.value);
                    if (found) loadPatientRecord(found);
                  }}
                >
                  {savedRecords.map(rec => (
                    <option key={rec.id} value={rec.id}>
                      Leito {rec.patientId.leito || 'N/I'} - {rec.patientId.nome ? rec.patientId.nome.slice(0, 15) + '...' : 'Paciente'}
                    </option>
                  ))}
                </select>
                <button
                  id="delete-selected-patient-btn"
                  onClick={() => handleRemoveSavedPatient(currentId)}
                  className="text-rose-450 hover:bg-rose-950/40 p-2 rounded text-xs"
                  title="Apagar este paciente da memória"
                >
                  Excluir
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Layout Block */}
      <main className="max-w-7xl w-full mx-auto p-4 flex-grow grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column - Diagnostic Form Sections (7 Cols) */}
        <div className="lg:col-span-7 col-span-1 space-y-6">
          <PatientIdent
            patient={patientId}
            vitals={vitals}
            onChangePatient={(f, v) => setPatientId(prev => ({...prev, [f]: v}))}
            onChangeVitals={(f, v) => setVitals(prev => ({...prev, [f]: v}))}
          />

          <NeurologySection
            neuro={neurology}
            onChangeNeuro={(f, v) => setNeurology(prev => ({...prev, [f]: v}))}
          />

          <CardioSection
            cardio={cardiovascular}
            patientWeight={patientId.peso}
            onChangeCardio={(f, v) => setCardiovascular(prev => ({...prev, [f]: v}))}
          />

          <RespiroSection
            respiro={respiratory}
            patient={patientId}
            onChangeRespiro={(f, v) => setRespiratory(prev => ({...prev, [f]: v}))}
          />

          <NefroSection
            nefro={nephrology}
            patient={patientId}
            onChangeNefro={(f, v) => setNephrology(prev => ({...prev, [f]: v}))}
          />

          <GIAndOthers
            gi={gi}
            hemato={hematology}
            infectious={infectious}
            profilaxias={profilaxias}
            anotacoes={anotacoes}
            onChangeGI={(f, v) => setGi(prev => ({...prev, [f]: v}))}
            onChangeHemato={(f, v) => setHematology(prev => ({...prev, [f]: v}))}
            onChangeInfectious={(f, v) => setInfectious(prev => ({...prev, [f]: v}))}
            onChangeProfilaxias={(f, v) => setProfilaxias(prev => ({...prev, [f]: v}))}
            onChangeAnotacoes={(v) => setAnotacoes(v)}
          />
        </div>

        {/* Right Column - Printable and Exportable Monospace Output Prontuário (5 Cols - Sticky) */}
        <div className="lg:col-span-5 col-span-1 lg:sticky lg:top-24 space-y-6">
          <ClinicalSummary
            state={activeFullState}
            onClear={handleClearAllFields}
            onLoadTemplate={handleLoadDemoTemplate}
          />

          {/* Guidelines quick tips */}
          <div className="bg-white rounded-xl p-5 border border-slate-205 shadow-sm text-xs">
            <h4 className="font-sans font-semibold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Info className="h-4 w-4 text-indigo-500" />
              Guia Rápido de Preenchimento
            </h4>
            <ul className="list-disc list-inside space-y-2 text-slate-550 pl-1 leading-relaxed">
              <li>Preencha a <strong>Seção 1 (Idade / Peso / Sexo)</strong> para permitir o cálculo automático do clearance de creatinina (Cockcroft-Gault TFG).</li>
              <li>Calculadora <strong>BPS</strong> exige que todos os três campos de comportamento doloroso estejam selecionados para somar de 3 a 12.</li>
              <li>No painel de ventilação mecânica, introduzir <strong>Volume Corrente (mL)</strong>, <strong>PEEP</strong> e <strong>Pressão Platô</strong> calcula instantaneamente a complacência do pulmão e a Driving Pressure (condução protetora).</li>
              <li>A evolução em tempo real gerada à direita pode ser selecionada, copiada inteiramente ou baixada como arquivo <code>.TXT</code> para colar no prontuário eletrônico oficial do hospital.</li>
            </ul>
          </div>
        </div>
      </main>

      {/* Humble Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-500 py-6 px-6 text-center text-xs mt-12 w-full">
        <p className="font-semibold">Evolução Beira-Leito UTI — Assistência Médica Inteligente</p>
        <p className="mt-1 font-mono text-[10px]">Desenvolvido com diretrizes clínicas de ventilação protetora e escores padrão-ouro das UTIs brasileiras.</p>
      </footer>
    </div>
  );
}
