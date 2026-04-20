import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart3, 
  Home, 
  DollarSign, 
  Users, 
  Building2, 
  ChevronDown, 
  Info, 
  Zap, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight,
  Coffee,
  Croissant,
  Utensils,
  Scissors,
  Sparkles,
  ShoppingCart,
  Shirt,
  Dumbbell,
  Percent,
  Wallet,
  Scale,
  Check
} from 'lucide-react';
import { PRESETS, Preset, BENCHMARKS } from './constants';

const PRESET_ICONS: Record<string, any> = {
  Coffee,
  Croissant,
  Utensils,
  Scissors,
  Sparkles,
  ShoppingCart,
  Shirt,
  Dumbbell
};

// --- Types ---
interface PnLResult {
  revenue: number;
  rent: number;
  mallFee: number;
  cogs: number;
  acq: number;
  mkt: number;
  variableTotal: number;
  grossAfterVar: number;
  fotGross: number;
  fotTaxes: number;
  fotTotal: number;
  fixedTotal: number;
  ebitda: number;
  da: number;
  ebit: number;
  tax: number;
  net: number;
  cashNet: number;
  rentTotal: number;
}

// --- Formatters ---
const fmt = (n: number) => {
  if (!isFinite(n)) return '∞';
  const a = Math.abs(n);
  const sign = n < 0 ? '−' : '';
  // Используем пробел как разделитель тысяч для всех чисел
  const formatted = Math.round(a).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return sign + formatted + ' ₸';
};

const fmtShort = (n: number) => {
  if (!isFinite(n)) return '∞';
  const a = Math.abs(n);
  const sign = n < 0 ? '−' : '';
  if (a >= 1000000) return sign + (a / 1000000).toFixed(a % 1000000 < 100000 ? 0 : 1).replace('.0', '') + ' млн';
  if (a >= 10000) return sign + (a / 1000).toFixed(0) + ' тыс';
  return sign + Math.round(a).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

export default function App() {
  const [currentPresetKey, setCurrentPresetKey] = useState('coffee');
  const [showResults, setShowResults] = useState(false);
  
  // -- Form States --
  const [area, setArea] = useState(PRESETS.coffee.area);
  const [rentBase, setRentBase] = useState(PRESETS.coffee.rent);
  const [check, setCheck] = useState(PRESETS.coffee.check);
  const [clients, setClients] = useState(PRESETS.coffee.clients);
  const [days, setDays] = useState(PRESETS.coffee.days);
  const [rampUp, setRampUp] = useState(75); // %
  
  const [cogsPct, setCogsPct] = useState(PRESETS.coffee.cogs);
  const [acqPct, setAcqPct] = useState(2);
  const [mktPct, setMktPct] = useState(5);
  
  const [staff, setStaff] = useState(PRESETS.coffee.staff);
  const [salaryNet, setSalaryNet] = useState(PRESETS.coffee.salary);
  
  const [capex, setCapex] = useState(PRESETS.coffee.capex);
  const [wc, setWc] = useState(PRESETS.coffee.wc);
  
  const [options, setOptions] = useState({
    vat: false,
    ore: false,
    mall: false,
    taxFot: true,
    taxMode: 'simple' as 'simple' | 'general'
  });

  const [expandedSections, setExpandedSections] = useState({
    rev: true,
    rent: false,
    var: false,
    pay: false,
    tax: false
  });

  // -- Actions --
  const loadPreset = (key: string) => {
    setCurrentPresetKey(key);
    const p = PRESETS[key];
    setArea(p.area);
    setRentBase(p.rent);
    setCheck(p.check);
    setClients(p.clients);
    setDays(p.days);
    setCogsPct(p.cogs);
    setMktPct(p.mkt);
    setStaff(p.staff);
    setSalaryNet(p.salary);
    setCapex(p.capex);
    setWc(p.wc);
    // Optionally trigger calculation immediately
  };

  const toggleSection = (key: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleOption = (key: keyof typeof options) => {
    if (key === 'taxMode') return;
    setOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // -- Calculation Engine --
  const buildPnL = (multiplier: number): PnLResult => {
    const revenue = check * clients * days * multiplier;

    let rentPerM2 = rentBase;
    if (options.ore) rentPerM2 += 2000;
    if (options.vat) rentPerM2 *= 1.12;
    let rent = rentPerM2 * area;
    const mallFee = options.mall ? revenue * 0.03 : 0;

    const cogs = revenue * (cogsPct / 100);
    const acq = revenue * (acqPct / 100);
    const mkt = revenue * (mktPct / 100);
    const variableTotal = cogs + acq + mkt;

    const grossAfterVar = revenue - variableTotal;

    const fotGross = staff * salaryNet;
    const fotTaxes = options.taxFot ? fotGross * 0.22 : 0;
    const fotTotal = fotGross + fotTaxes;

    const fixedTotal = rent + mallFee + fotTotal;

    const ebitda = grossAfterVar - fixedTotal;
    const da = capex / 60;
    const ebit = ebitda - da;

    let tax = 0;
    if (options.taxMode === 'simple') {
      tax = revenue * 0.03;
    } else {
      tax = ebit > 0 ? ebit * 0.20 : 0;
    }

    const net = ebit - tax;
    const cashNet = ebitda - tax;

    return {
      revenue, rent, mallFee, cogs, acq, mkt, variableTotal,
      grossAfterVar, fotGross, fotTaxes, fotTotal, fixedTotal,
      ebitda, da, ebit, tax, net, cashNet,
      rentTotal: rent + mallFee
    };
  };

  const pnl = useMemo(() => buildPnL(1), [check, clients, days, rentBase, area, cogsPct, acqPct, mktPct, staff, salaryNet, capex, options]);
  const pnlRamp = useMemo(() => buildPnL(rampUp / 100), [pnl, rampUp]);

  const metrics = useMemo(() => {
    const rentPct = pnl.rentTotal / pnl.revenue * 100;
    const fotPct = pnl.fotTotal / pnl.revenue * 100;
    const ebitdaPct = pnl.ebitda / pnl.revenue * 100;
    const totalInvest = capex + wc;

    let payback: number;
    if (pnl.cashNet <= 0) {
      payback = Infinity;
    } else {
      const yr1Cash = pnlRamp.cashNet * 12;
      if (yr1Cash >= totalInvest) {
        payback = totalInvest / pnlRamp.cashNet;
      } else {
        const remaining = totalInvest - yr1Cash;
        payback = 12 + remaining / pnl.cashNet;
      }
    }

    const varRate = (cogsPct + acqPct + mktPct) / 100;
    const mallRate = options.mall ? 0.03 : 0;
    const effectiveMargin = 1 - varRate - mallRate - (options.taxMode === 'simple' ? 0.03 : 0);
    const beRevenue = effectiveMargin > 0 ? pnl.fixedTotal / effectiveMargin : Infinity;
    const beClients = Math.ceil(beRevenue / (check * days));
    const beCheck = Math.ceil(beRevenue / (clients * days));

    const safetyTraffic = pnl.revenue > beRevenue ? ((pnl.revenue - beRevenue) / pnl.revenue * 100) : 0;
    const totalCosts = pnl.variableTotal + pnl.fixedTotal;
    const opLeverage = pnl.fixedTotal / totalCosts * 100;

    let score = 0;
    if (rentPct < 15) score += 25; else if (rentPct < 25) score += 15; else if (rentPct < 35) score += 5;
    if (payback < 18) score += 30; else if (payback < 36) score += 18; else if (payback < 60) score += 8;
    if (safetyTraffic > 40) score += 20; else if (safetyTraffic > 15) score += 12; else if (safetyTraffic > 0) score += 5;
    if (ebitdaPct > 20) score += 15; else if (ebitdaPct > 10) score += 10; else if (ebitdaPct > 0) score += 5;
    if (opLeverage < 40) score += 10; else if (opLeverage < 60) score += 6; else score += 2;

    return { rentPct, fotPct, ebitdaPct, totalInvest, payback, beRevenue, beClients, beCheck, safetyTraffic, opLeverage, score };
  }, [pnl, pnlRamp, capex, wc, cogsPct, acqPct, mktPct, options, check, days, clients, rampUp]);

  const handleCalculate = () => {
    setShowResults(true);
    // Scroll to results would be here if needed
  };

  return (
    <div className="min-h-screen pb-20">
      {/* --- Hero --- */}
      <section className="relative px-6 pt-16 pb-8 text-center overflow-hidden">
        <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-teal/10 blur-[100px] pointer-events-none" />
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.05] tracking-tight mb-4"
        >
          Калькулятор<br />
          <em className="text-gradient-teal not-italic">окупаемости бизнеса</em>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-gray-400 text-lg max-w-2xl mx-auto"
        >
          Полный P&L с ФОТ, налогами и эквайрингом. Бенчмарки по типу бизнеса для Алматы.
        </motion.p>
      </section>

      <main className="max-w-7xl mx-auto px-6">
        {/* --- Preset Bar --- */}
        <div className="bg-surface border border-white/10 rounded-2xl p-5 mb-6">
          <div className="flex items-center justify-between mb-4 px-2">
            <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500">Тип бизнеса</span>
            <span className="text-[11px] font-mono text-gray-600">
              {PRESETS[currentPresetKey].meta}
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {Object.entries(PRESETS).map(([key, p]) => {
              const Icon = PRESET_ICONS[p.emoji];
              return (
                <button
                  key={key}
                  onClick={() => loadPreset(key)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all border ${
                    currentPresetKey === key 
                      ? 'bg-teal/10 border-teal/40 text-teal shadow-lg shadow-teal/5' 
                      : 'bg-surface2 border-white/5 text-gray-400 hover:text-white hover:border-white/10'
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
                  <span className="truncate">{p.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr,1.15fr] gap-6">
          {/* --- Form Card --- */}
          <div className="bg-surface border border-white/10 rounded-3xl p-8 form-shadow relative overflow-hidden h-fit">
            <div className="absolute top-0 right-0 w-60 h-60 bg-radial-at-tr from-teal/5 to-transparent pointer-events-none" />
            
            {/* 1. Выручка */}
            <Section 
              title="Выручка" 
              subtitle="Трафик, чек, рабочие дни" 
              icon={<BarChart3 className="w-4 h-4 text-teal" />}
              isExpanded={expandedSections.rev}
              onToggle={() => toggleSection('rev')}
            >
              <div className="grid grid-cols-2 gap-4">
                <Field label="Средний чек" unit="₸" tip="Средняя сумма одной покупки с учётом всех позиций">
                  <NumericInput 
                    value={check} 
                    onChange={setCheck}
                  />
                  <MarketHints range={PRESETS[currentPresetKey].checkRange} unit="₸" onSelect={setCheck} isMoney />
                </Field>
                <Field label="Клиентов в день" unit="чел." tip="Среднее количество покупателей в день в расчётный месяц">
                  <input 
                    type="number" 
                    value={clients} 
                    onChange={e => setClients(+e.target.value)}
                    className="input-field" 
                  />
                  <MarketHints range={PRESETS[currentPresetKey].clientsRange} unit="чел" onSelect={setClients} />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <Field label="Рабочих дней" unit="дн" tip="Кофейни работают 30 дней, услуги — 26–28, B2B — 22">
                  <input 
                    type="number" 
                    value={days} 
                    onChange={e => setDays(+e.target.value)}
                    className="input-field" 
                  />
                  <MarketHints range={PRESETS[currentPresetKey].daysRange} unit="дн" onSelect={setDays} />
                </Field>
                <Field label="Ramp-up (1-й год)" unit="%" tip="Новый бизнес выходит на плановую выручку постепенно. 75% — реалистично для первого года">
                  <input 
                    type="number" 
                    value={rampUp} 
                    onChange={e => setRampUp(+e.target.value)}
                    className="input-field" 
                  />
                  <span className="text-[10px] text-gray-600 mt-1">Применяется к окупаемости</span>
                </Field>
              </div>
            </Section>

            {/* 2. Аренда */}
            <Section 
              title="Помещение и аренда" 
              subtitle="Площадь + полная ставка" 
              icon={<Building2 className="w-4 h-4 text-teal" />}
              isExpanded={expandedSections.rent}
              onToggle={() => toggleSection('rent')}
            >
              <div className="grid grid-cols-2 gap-4">
                <Field label="Площадь" unit="м²">
                  <input 
                    type="number" 
                    value={area} 
                    onChange={e => setArea(+e.target.value)}
                    className="input-field" 
                  />
                  <MarketHints range={PRESETS[currentPresetKey].areaRange} unit="м²" onSelect={setArea} />
                </Field>
                <Field label="Ставка аренды" unit="₸/м²" tip="Базовая арендная ставка за 1 м². НДС и ОРЕ — отдельно ниже">
                  <NumericInput 
                    value={rentBase} 
                    onChange={setRentBase}
                  />
                  <MarketHints range={PRESETS[currentPresetKey].rentRange} unit="₸/м²" onSelect={setRentBase} isMoney />
                </Field>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                <ToggleBtn active={options.vat} onClick={() => toggleOption('vat')}>+ НДС 12%</ToggleBtn>
                <ToggleBtn active={options.ore} onClick={() => toggleOption('ore')}>+ ОРЕ / коммуналка</ToggleBtn>
                <ToggleBtn active={options.mall} onClick={() => toggleOption('mall')}>ТРЦ (маркет. 3%)</ToggleBtn>
              </div>
            </Section>

            {/* 3. Переменные */}
            <Section 
              title="Переменные расходы" 
              subtitle="COGS, эквайринг, маркетинг" 
              icon={<DollarSign className="w-4 h-4 text-teal" />}
              isExpanded={expandedSections.var}
              onToggle={() => toggleSection('var')}
            >
              <div className="grid grid-cols-3 gap-3">
                <Field label="COGS" unit="%" tip="Доля себестоимости товара/услуги в выручке (продукты, материалы)">
                  <input type="number" value={cogsPct} onChange={e => setCogsPct(+e.target.value)} className="input-field" />
                  <MarketHints range={PRESETS[currentPresetKey].cogsRange} unit="%" onSelect={setCogsPct} />
                </Field>
                <Field label="Эквайринг" unit="%" tip="Средняя комиссия банка за приём карт. В Казахстане: 1.5–2.5%">
                  <input type="number" value={acqPct} onChange={e => setAcqPct(+e.target.value)} className="input-field" />
                  <span className="text-[10px] text-gray-600 mt-1">90%+ платят картой</span>
                </Field>
                <Field label="Маркетинг" unit="%" tip="Реклама, SMM, акции. Для нового бизнеса 5–10% первый год">
                  <input type="number" value={mktPct} onChange={e => setMktPct(+e.target.value)} className="input-field" />
                  <span className="text-[10px] text-gray-600 mt-1">Запуск: 7–10% · зрелый: 3–5%</span>
                </Field>
              </div>
            </Section>

            {/* 4. Персонал */}
            <Section 
              title="Персонал (ФОТ)" 
              subtitle="Зарплаты + налоги" 
              icon={<Users className="w-4 h-4 text-teal" />}
              isExpanded={expandedSections.pay}
              onToggle={() => toggleSection('pay')}
            >
              <div className="grid grid-cols-2 gap-4">
                <Field label="Сотрудников" unit="чел." tip="Общее количество работников с учётом смен">
                  <input type="number" value={staff} onChange={e => setStaff(+e.target.value)} className="input-field" />
                  <MarketHints range={PRESETS[currentPresetKey].staffRange} unit="чел" onSelect={setStaff} />
                </Field>
                <Field label="ЗП на руки" unit="₸" tip="Чистая зарплата сотрудника. Налоги к ней добавятся автоматически (~22%)">
                  <NumericInput value={salaryNet} onChange={setSalaryNet} />
                  <MarketHints range={PRESETS[currentPresetKey].salaryRange} unit="₸" onSelect={setSalaryNet} isMoney />
                </Field>
              </div>
              <div className="mt-4">
                <ToggleBtn active={options.taxFot} onClick={() => toggleOption('taxFot')}>+ 22% соцналоги (ОПВ/ВОСМС)</ToggleBtn>
              </div>
            </Section>

            {/* 5. Налоги */}
            <Section 
              title="Налоги и инвестиции" 
              subtitle="Режим + CAPEX" 
              icon={<Home className="w-4 h-4 text-teal" />}
              isExpanded={expandedSections.tax}
              onToggle={() => toggleSection('tax')}
            >
              <div className="mb-4">
                <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-2 block">Налоговый режим</span>
                <div className="flex gap-2">
                  <ToggleBtn 
                    active={options.taxMode === 'simple'} 
                    onClick={() => setOptions(o => ({...o, taxMode: 'simple'}))}
                  >
                    Упрощёнка 3%
                  </ToggleBtn>
                  <ToggleBtn 
                    active={options.taxMode === 'general'} 
                    onClick={() => setOptions(o => ({...o, taxMode: 'general'}))}
                  >
                    ОУР (КПН 20%)
                  </ToggleBtn>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="CAPEX" unit="₸" tip="Ремонт, оборудование, мебель, вывеска, оформление ИП/ТОО">
                  <NumericInput value={capex} onChange={setCapex} />
                  <MarketHints range={PRESETS[currentPresetKey].capexRange} unit="₸" onSelect={setCapex} isMoney />
                </Field>
                <Field label="Оборотка" unit="₸" tip="Депозит за аренду + запас товара + подушка на первые месяцы">
                  <NumericInput value={wc} onChange={setWc} />
                  <span className="text-[10px] text-gray-600 mt-1">Депозит + товар + 2–3 мес подушки</span>
                </Field>
              </div>
            </Section>

            <button 
              onClick={handleCalculate}
              className="w-full mt-6 bg-gradient-to-br from-teal to-teal2 text-black font-black py-4 rounded-xl flex items-center justify-center gap-3 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-teal/20"
            >
              <BarChart3 className="w-5 h-5" /> Рассчитать P&L и окупаемость
            </button>
          </div>

          {/* --- Results --- */}
          <div className="flex flex-col gap-4 min-h-[600px]">
            {!showResults ? (
              <div className="flex-1 border-2 border-dashed border-white/10 rounded-[32px] flex flex-col items-center justify-center p-12 text-center text-gray-600 bg-surface/30 backdrop-blur-sm">
                <motion.div
                  animate={{ scale: [1, 1.05, 1], rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="w-20 h-20 bg-teal/5 rounded-full flex items-center justify-center mb-6 border border-teal/10"
                >
                  <TrendingUp className="w-10 h-10 text-teal opacity-30" />
                </motion.div>
                <h3 className="text-xl font-bold mb-2 text-gray-400">Готовы к расчету?</h3>
                <p className="text-sm max-w-[280px]">Выберите тип бизнеса сверху или настройте параметры вручную для детального прогноза.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* 1. Verdict Row */}
                <div className="grid grid-cols-1 md:grid-cols-[1.4fr,1fr] gap-4">
                  <VerdictCard score={metrics.score} pnl={pnl} metrics={metrics} />
                  <GaugeCard score={metrics.score} />
                </div>
                
                {/* 2. KPIs */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <KPICard title="Выручка" value={fmt(pnl.revenue)} sub={`${clients} × ${fmtShort(check)} × ${days}`} />
                  <KPICard 
                    title="EBITDA" 
                    value={fmt(pnl.ebitda)} 
                    sub={`${metrics.ebitdaPct.toFixed(1)}% от выручки`}
                    status={pnl.ebitda > 0 ? 'good' : 'bad'}
                  />
                  <KPICard 
                    title="Чистая прибыль" 
                    value={fmt(pnl.net)} 
                    sub="После всех налогов"
                    status={pnl.net > 0 ? 'success' : 'bad'}
                  />
                  <KPICard 
                    title="Аренда / Выручка" 
                    value={`${metrics.rentPct.toFixed(1)}%`} 
                    sub="Норма: до 20%"
                    status={metrics.rentPct < 15 ? 'good' : metrics.rentPct < 25 ? 'warn' : 'bad'}
                  />
                  <KPICard 
                    title="ФОТ / Выручка" 
                    value={`${metrics.fotPct.toFixed(1)}%`} 
                    sub="Норма: до 30%"
                    status={metrics.fotPct < 25 ? 'good' : metrics.fotPct < 35 ? 'warn' : 'bad'}
                  />
                  <KPICard 
                    title="Окупаемость" 
                    value={isFinite(metrics.payback) ? `${Math.ceil(metrics.payback)} мес` : '∞'} 
                    sub={`При ramp-up ${rampUp}%`}
                    status={metrics.payback < 18 ? 'good' : metrics.payback < 36 ? 'warn' : 'bad'}
                  />
                </div>

                {/* 3. Charts: Waterfall & CashFlow */}
                <WaterfallCard pnl={pnl} />
                <CashFlowCard pnl={pnl} capex={capex} wc={wc} rampUp={rampUp} />

                {/* 4. P&L Table */}
                <PnLTable pnl={pnl} inputs={{ cogsPct, acqPct, mktPct }} options={options} />

                {/* 5. Safety & Benchmarks */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SafetyBars inputs={{ clients, check, cogsPct, acqPct, mktPct }} metrics={metrics} pnl={pnl} options={options} />
                  <BenchmarksCard segment={currentPresetKey} metrics={metrics} />
                </div>

                {/* 6. Sensitivity */}
                <SensitivityMatrix baseEbitda={pnl.ebitda} check={check} clients={clients} days={days} inputs={{ area, rentBase, cogsPct, acqPct, mktPct, staff, salaryNet, capex, wc }} options={options} />

                {/* 7. Break Even */}
                <BreakEvenCard metrics={metrics} pnl={pnl} check={check} clients={clients} days={days} />

                {/* 8. Interpretations */}
                <InterpretationsList metrics={metrics} pnl={pnl} />

                {/* 9. CTA */}
                <section className="bg-gradient-to-br from-purple/10 to-pink/5 border border-purple/20 rounded-3xl p-8 text-center sm:text-left flex flex-col sm:flex-row items-center gap-6">
                  <div className="flex-1">
                    <h4 className="text-xl font-black mb-2">{pnl.ebitda > 0 ? 'Найдите локацию, где эта модель сработает' : 'Найдите локацию с меньшей арендой и большим трафиком'}</h4>
                    <p className="text-sm text-gray-400 mb-0">Citipedia покажет реальный трафик и конкурентов для любой точки Алматы. Найдите место, где эта модель принесет больше.</p>
                  </div>
                  <button className="bg-gradient-to-br from-purple to-pink px-8 py-4 rounded-xl font-black text-sm flex items-center gap-2 whitespace-nowrap hover:scale-105 transition-transform">
                    К анализу локаций <ArrowRight className="w-4 h-4" />
                  </button>
                </section>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// --- Sub-components ---

function Section({ title, subtitle, icon, children, isExpanded, onToggle }: any) {
  return (
    <div className={`border-b border-white/5 last:border-0 pb-6 mb-6 last:mb-0 last:pb-0 ${!isExpanded ? 'opacity-70' : ''}`}>
      <div 
        className="flex items-center justify-between cursor-pointer group mb-4"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-surface2 flex items-center justify-center">
            {icon}
          </div>
          <div>
            <h4 className="text-sm font-black tracking-tight">{title}</h4>
            <p className="text-[10px] text-gray-500">{subtitle}</p>
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${!isExpanded ? '-rotate-90' : ''}`} />
      </div>
      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({ label, unit, tip, children }: any) {
  return (
    <div className="flex flex-col gap-1.5 flex-1">
      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-1.5">
        {label} 
        {tip && (
          <div className="group relative">
            <Info className="w-3 h-3 opacity-30 cursor-help" />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-surface3 border border-white/10 p-2 rounded-lg text-[10px] text-gray-300 font-medium invisible group-hover:visible transition-all shadow-xl z-50">
              {tip}
            </div>
          </div>
        )}
      </label>
      <div className="relative">
        {Array.isArray(children) ? children[0] : children}
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-600 pointer-events-none uppercase">
          {unit}
        </span>
      </div>
      {Array.isArray(children) && children[1]}
    </div>
  );
}

function NumericInput({ value, onChange }: { value: number, onChange: (v: number) => void }) {
  const [displayValue, setDisplayValue] = useState(value === 0 ? '' : value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' '));
  
  useEffect(() => {
    setDisplayValue(value === 0 ? '' : value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' '));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\s/g, '');
    if (raw === '' || !isNaN(+raw)) {
      const num = raw === '' ? 0 : +raw;
      onChange(num);
      // Immediately format the input value for visual feedback
      setDisplayValue(raw.replace(/\B(?=(\d{3})+(?!\d))/g, ' '));
    }
  };

  return (
    <input 
      type="text" 
      value={displayValue} 
      onChange={handleChange}
      className="input-field" 
    />
  );
}

function MarketHints({ range, unit, onSelect, isMoney }: any) {
  const [lo, hi] = range;
  const mid = Math.round((lo + hi) / 2);
  
  const format = (v: number) => {
    if (isMoney && (unit === '₸' || unit === '₸/м²')) {
      if (v >= 1000000) return (v/1000000).toFixed(v%1000000===0?0:1) + 'M';
      if (v >= 1000) return (v/1000).toFixed(0) + 'k';
    }
    return v;
  };

  return (
    <div className="flex gap-1.5 mt-1.5">
      <span className="text-[9px] text-gray-600 self-center">Рынок:</span>
      {[lo, mid, hi].map((v, i) => (
        <button 
          key={i} 
          onClick={() => onSelect(v)}
          className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold transition-colors ${
            i === 0 ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 
            i === 1 ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20' : 
            'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
          }`}
        >
          {format(v)}
        </button>
      ))}
    </div>
  );
}

function ToggleBtn({ active, onClick, children }: any) {
  return (
    <button 
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-2 border ${
        active 
          ? 'bg-teal/10 border-teal/40 text-teal shadow-sm shadow-teal/5' 
          : 'bg-surface2 border-white/5 text-gray-500 hover:text-gray-300'
      }`}
    >
      <div className={`w-3.5 h-3.5 rounded flex items-center justify-center border transition-colors ${active ? 'border-teal bg-teal text-black' : 'border-current'}`}>
        {active && <Check className="w-2.5 h-2.5 stroke-[4px]" />}
      </div>
      {children}
    </button>
  );
}

function KPICard({ title, value, sub, status }: any) {
  const colorClass = status === 'good' ? 'text-teal' : status === 'success' ? 'text-emerald-400' : status === 'warn' ? 'text-amber-400' : status === 'bad' ? 'text-red-400' : 'text-white';
  return (
    <div className="bg-surface border border-white/5 rounded-2xl p-4 flex flex-col gap-1">
      <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500">{title}</span>
      <div className={`text-lg font-mono font-black ${colorClass}`}>{value}</div>
      <span className="text-[9px] text-gray-600 truncate">{sub}</span>
    </div>
  );
}

function VerdictCard({ score, pnl, metrics }: any) {
  let mode: 'good' | 'warn' | 'bad' = 'warn';
  if (pnl.ebitda <= 0) mode = 'bad';
  else if (score >= 70) mode = 'good';
  else if (score < 45) mode = 'bad';

  const config = {
    good: { icon: <CheckCircle2 className="w-10 h-10 text-emerald-400" />, title: 'Устойчивая модель', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
    warn: { icon: <Clock className="w-10 h-10 text-amber-400" />, title: 'Рабочая, но уязвимая', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
    bad: { icon: <AlertCircle className="w-10 h-10 text-red-500" />, title: pnl.ebitda <= 0 ? 'Бизнес не окупится' : 'Высокий риск', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/30' },
  }[mode];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`rounded-[32px] p-10 border-t-8 shadow-2xl ${config.bg} ${config.border} flex flex-col items-center sm:flex-row sm:items-start gap-8 relative overflow-hidden backdrop-blur-sm`}
      style={{ borderTopColor: mode === 'good' ? '#10b981' : mode === 'warn' ? '#f59e0b' : '#ef4444' }}
    >
      <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
        {config.icon}
      </div>
      <div className="mt-1 flex-shrink-0">{config.icon}</div>
      <div className="flex-1 text-center sm:text-left">
        <h3 className={`text-3xl font-black mb-3 ${config.color} tracking-tight`}>{config.title}</h3>
        <p className="text-gray-300 text-base leading-relaxed max-w-xl">
          {mode === 'bad' && pnl.ebitda <= 0 
            ? 'Прогноз отрицательный. При текущих вводных бизнес будет ежемесячно генерировать убыток. Модель требует радикального пересмотра.' 
            : mode === 'good' 
            ? `Окупаемость в ${Math.ceil(metrics.payback)} мес. при запасе прочности в ${metrics.safetyTraffic.toFixed(0)}%. Это сильная инвестиционная модель с маржинальностью EBITDA ${metrics.ebitdaPct.toFixed(0)}%.`
            : mode === 'warn'
            ? 'Модель прибыльна, но критически зависит от выполнения плана продаж. Проседание трафика более чем на 15% может обнулить прибыль.'
            : 'Маржинальность слишком низкая для безопасной работы. Риск потери капитала превышает потенциальную доходность.'}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center sm:justify-start gap-4">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-2xl bg-black/40 font-mono text-sm font-black text-white border border-white/10 uppercase shadow-inner">
            <span className="text-gray-500">Scoring:</span> {score} / 100
          </div>
          {mode === 'good' && (
             <div className="inline-flex items-center gap-2 px-5 py-2 rounded-2xl bg-emerald-500/20 font-bold text-xs text-emerald-400 border border-emerald-500/30 uppercase">
                Рекомендуем к реализации
             </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function PnLTable({ pnl, inputs, options }: any) {
  return (
    <div className="bg-surface border border-white/5 rounded-3xl p-8">
      <div className="mb-6">
        <h4 className="text-sm font-black uppercase tracking-widest text-gray-300">Отчёт о прибылях и убытках</h4>
        <p className="text-[10px] text-gray-500 mt-1">Месячный плановый период</p>
      </div>
      <div className="space-y-4">
        <PnLRow label="Выручка" value={fmt(pnl.revenue)} highlight />
        <div className="pl-4 space-y-2">
          <PnLRow label="− Себестоимость (COGS)" value={`−${fmt(pnl.cogs)}`} sub={`${inputs.cogsPct}%`} tertiary />
          <PnLRow label="− Эквайринг" value={`−${fmt(pnl.acq)}`} sub={`${inputs.acqPct}%`} tertiary />
          <PnLRow label="− Маркетинг" value={`−${fmt(pnl.mkt)}`} sub={`${inputs.mktPct}%`} tertiary />
        </div>
        <PnLRow 
          label="Валовая прибыль" 
          value={fmt(pnl.grossAfterVar)} 
          sub={`${((pnl.grossAfterVar/pnl.revenue)*100).toFixed(0)}%`} 
          highlight 
        />
        <div className="pl-4 space-y-2">
          <PnLRow label={`− Аренда${options.vat ? ' (с НДС)' : ''}${options.ore ? ' + ОРЕ' : ''}`} value={`−${fmt(pnl.rent)}`} tertiary />
          {options.mall && <PnLRow label="− Маркет. сбор ТРЦ" value={`−${fmt(pnl.mallFee)}`} tertiary />}
          <PnLRow label={`− ФОТ${options.taxFot ? ' (+ налоги 22%)' : ''}`} value={`−${fmt(pnl.fotTotal)}`} tertiary />
        </div>
        <PnLRow 
          label="EBITDA" 
          value={fmt(pnl.ebitda)} 
          sub={`${((pnl.ebitda/pnl.revenue)*100).toFixed(1)}%`} 
          highlight 
          color={pnl.ebitda < 0 ? 'text-red-400' : 'text-white'} 
        />
        <div className="pl-4 space-y-2">
          <PnLRow label="− Амортизация (60 мес)" value={`−${fmt(pnl.da)}`} tertiary />
          <PnLRow label={`− Налог ${options.taxMode === 'simple' ? '(3%)' : '(20%)'}`} value={`−${fmt(pnl.tax)}`} tertiary />
        </div>
        <div className="pt-4 border-t border-white/10">
          <PnLRow 
            label="Чистая прибыль" 
            value={fmt(pnl.net)} 
            highlight 
            big 
            color={pnl.net < 0 ? 'text-red-400' : 'text-teal'} 
          />
        </div>
      </div>
    </div>
  );
}

function PnLRow({ label, value, sub, highlight, tertiary, big, color = 'text-white' }: any) {
  return (
    <div className={`flex justify-between items-center text-xs ${highlight ? 'font-black' : 'font-medium'} ${tertiary ? 'text-gray-500' : ''}`}>
      <span className={tertiary ? 'text-gray-500' : 'text-gray-300'}>{label}</span>
      <div className="text-right flex items-center gap-3">
        {sub && <span className="font-mono text-[9px] text-gray-600">{sub}</span>}
        <span className={`font-mono ${color} ${big ? 'text-lg' : ''}`}>{value}</span>
      </div>
    </div>
  );
}

function SensitivityMatrix({ baseEbitda, check, clients, days, inputs, options }: any) {
  const trafficLabels = ['Трафик +20%', 'План', 'Трафик −20%'];
  const trafficMults = [1.2, 1.0, 0.8];
  const checkMults = [0.9, 1.0, 1.1];
  const checkLabels = ['Чек −10%', 'План', 'Чек +10%'];

  const getCellData = (tm: number, cm: number) => {
    const revenue = (check * cm) * (clients * tm) * days;
    let rentPM2 = inputs.rentBase;
    if (options.ore) rentPM2 += 2000;
    if (options.vat) rentPM2 *= 1.12;
    const rent = rentPM2 * inputs.area;
    const mallFee = options.mall ? revenue * 0.03 : 0;
    const varTotal = revenue * ((inputs.cogsPct + inputs.acqPct + inputs.mktPct) / 100);
    const fotTotal = (inputs.staff * inputs.salaryNet) * (options.taxFot ? 1.22 : 1);
    const ebitda = revenue - varTotal - rent - mallFee - fotTotal;

    const isBase = tm === 1.0 && cm === 1.0;
    const ratio = baseEbitda !== 0 ? ebitda / baseEbitda : 1;
    
    let bg = 'bg-surface2/50';
    let color = 'text-gray-300';
    let labelColor = 'rgba(255,255,255,0.4)';

    if (ebitda < 0) {
      bg = 'bg-red-500/10'; color = 'text-red-300';
    } else if (ratio < 0.5) {
      bg = 'bg-amber-500/20'; color = 'text-amber-300';
    } else if (ratio < 0.85) {
      bg = 'bg-amber-500/10'; color = 'text-amber-200';
    } else if (ratio < 1.15) {
      bg = 'bg-teal/10'; color = 'text-teal';
    } else {
      bg = 'bg-emerald-500/15'; color = 'text-emerald-300';
    }

    const delta = baseEbitda !== 0 ? ((ebitda - baseEbitda) / Math.abs(baseEbitda) * 100) : 0;

    return { val: fmtShort(ebitda), delta, color, bg, isBase };
  };

  return (
    <div className="bg-surface border border-white/10 rounded-[32px] p-8 overflow-hidden">
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg bg-teal/5 flex items-center justify-center border border-teal/10 text-teal">
              <Percent className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-black uppercase tracking-widest text-gray-300">Sensitivity Matrix</h4>
          </div>
          <p className="text-[10px] text-gray-500">Ожидаемая EBITDA при отклонениях от плана</p>
        </div>
        <div className="px-3 py-1 bg-surface2 border border-white/5 rounded-lg font-mono text-[10px] text-gray-400 uppercase">₸/мес</div>
      </div>

      <div className="relative">
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-1">
            <thead>
              <tr>
                <th className="w-24"></th>
                {checkLabels.map((l) => (
                  <th key={l} className="text-[9px] font-bold text-gray-600 uppercase tracking-widest pb-3 text-center">
                    {l}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {trafficMults.map((tm, rowIdx) => (
                <tr key={tm}>
                  <td className="text-[9px] font-bold text-gray-500 uppercase tracking-widest pr-4 text-right align-middle leading-tight">
                    {trafficLabels[rowIdx]}
                  </td>
                  {checkMults.map((cm) => {
                    const data = getCellData(tm, cm);
                    return (
                      <td 
                        key={cm} 
                        className={`
                          ${data.bg} ${data.color}
                          rounded-xl p-4 text-center transition-all duration-300
                          ${data.isBase ? 'ring-2 ring-teal ring-inset' : ''}
                        `}
                      >
                        <div className="font-mono text-xs font-black tracking-tight">{data.val}</div>
                        <div className="text-[8px] opacity-60 mt-1 font-bold">
                          {data.isBase ? 'БАЗОВЫЙ' : `${data.delta > 0 ? '+' : ''}${data.delta.toFixed(0)}%`}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function BreakEvenCard({ metrics, pnl, check, clients, days }: any) {
  const safety = metrics.safetyTraffic;
  return (
    <div className="bg-surface border border-white/10 rounded-3xl p-8">
       <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-teal/5 flex items-center justify-center border border-teal/10">
            <Scale className="w-4 h-4 text-teal" />
          </div>
          <h4 className="text-sm font-black uppercase tracking-widest text-gray-300">Точка безубыточности</h4>
        </div>
        <div className="px-3 py-1 rounded-full bg-teal/10 border border-teal/20 text-teal font-mono text-[10px] font-bold">
          Запас: {safety > 0 ? `+${safety.toFixed(0)}%` : 'КРИТИЧНО'}
        </div>
      </div>
      <div className="space-y-8">
        <BreakEvenRow 
          icon={<Users className="w-4 h-4" />} 
          label="Минимум клиентов/день" 
          value={metrics.beClients} 
          current={clients} 
          percentage={(metrics.beClients / clients) * 100}
        />
        <BreakEvenRow 
          icon={<DollarSign className="w-4 h-4" />} 
          label="Минимум средний чек" 
          value={fmt(metrics.beCheck)} 
          current={fmt(check)} 
          percentage={(metrics.beCheck / check) * 100}
        />
        <div className="pt-6 border-t border-white/5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-purple/5 flex items-center justify-center border border-purple/10">
            <Wallet className="w-5 h-5 text-purple" />
          </div>
          <div>
            <div className="text-[11px] font-black tracking-tight text-white uppercase">Operating Leverage: {metrics.opLeverage.toFixed(0)}%</div>
            <p className="text-[10px] text-gray-500 mt-1">
              {metrics.opLeverage < 40 ? 'Гибкая модель: низкие фикс-расходы.' : metrics.opLeverage < 60 ? 'Средняя устойчивость к колебаниям.' : 'Высокий риск: фикс-затраты доминируют.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function BreakEvenRow({ icon, label, value, current, percentage }: any) {
  const safePct = Math.min(100, Math.max(0, percentage));
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <div className="text-gray-500">{icon}</div>
        <div className="flex-1">
          <div className="text-[11px] font-bold tracking-tight">{label}: <span className="font-mono text-white text-xs">{value}</span></div>
          <div className="text-[9px] text-gray-600">План: {current}</div>
        </div>
      </div>
      <div className="h-1.5 w-full bg-surface2 rounded-full relative overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-red-500 via-amber-500 to-amber-500 rounded-full"
          style={{ width: `${safePct}%` }}
        />
        <div 
          className="absolute top-0 bottom-0 w-0.5 bg-teal h-3 -mt-[3px] rounded-full" 
          style={{ left: '98%' }} 
        />
      </div>
    </div>
  );
}

function InterpretationsList({ metrics, pnl }: any) {
  const points = [];
  if (metrics.rentPct < 15) points.push({ type: 'good', text: `Аренда ${metrics.rentPct.toFixed(1)}% — отличный показатель, большой запас прочности.` });
  else if (metrics.rentPct < 25) points.push({ type: 'warn', text: `Аренда ${metrics.rentPct.toFixed(1)}% — в норме, но уязвимо при падении трафика.` });
  else points.push({ type: 'bad', text: `Аренда ${metrics.rentPct.toFixed(1)}% — критически высокая. Безопасно до 20%.` });

  if (metrics.fotPct > 35) points.push({ type: 'bad', text: `ФОТ ${metrics.fotPct.toFixed(0)}% — слишком много. Пересмотрите штатку.` });
  else if (metrics.fotPct > 25) points.push({ type: 'warn', text: `ФОТ ${metrics.fotPct.toFixed(0)}% — на верхней границе нормы.` });

  if (pnl.ebitda <= 0) points.push({ type: 'bad', text: `EBITDA отрицательная. Операционная модель не работает.` });
  else if (metrics.safetyTraffic < 15) points.push({ type: 'bad', text: `Margin of Safety ${metrics.safetyTraffic.toFixed(0)}% — крайне мало.` });
  
  if (isFinite(metrics.payback) && metrics.payback > 36) points.push({ type: 'bad', text: `Окупаемость ${Math.ceil(metrics.payback)} мес — рискованно долго.` });
  else if (isFinite(metrics.payback) && metrics.payback <= 18) points.push({ type: 'good', text: `Окупаемость ${Math.ceil(metrics.payback)} мес — это быстро.` });

  if (metrics.opLeverage > 60) points.push({ type: 'warn', text: `Высокий operating leverage (${metrics.opLeverage.toFixed(0)}%). Падение выручки ударит по EBITDA сильнее.` });

  return (
    <div className="space-y-2">
      {points.map((p, i) => (
        <div key={i} className="bg-surface border border-white/5 rounded-2xl p-4 flex gap-4 items-start">
          <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${p.type === 'good' ? 'bg-emerald-400' : p.type === 'warn' ? 'bg-amber-400' : 'bg-red-400'}`} />
          <p className="text-xs text-gray-400 leading-relaxed font-medium" dangerouslySetInnerHTML={{ __html: p.text.replace(/(\d+(\.\d+)?%)/g, '<span class="text-white font-bold">$1</span>') }} />
        </div>
      ))}
    </div>
  );
}

// --- New V3 Components ---

function GaugeCard({ score }: { score: number }) {
  const r = 80;
  const cx = 100, cy = 100;
  const startAngle = 180;
  const endAngle = 180 + (score / 100) * 180;

  const polar = (angle: number) => {
    const rad = angle * Math.PI / 180;
    return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
  };

  const [vEx, vEy] = polar(endAngle);
  const largeArc = (endAngle - 180) > 180 ? 1 : 0;
  const valPath = `M ${cx - r} ${cy} A ${r} ${r} 0 ${largeArc} 1 ${vEx} ${vEy}`;

  let color = '#ef4444';
  let zoneText = 'Высокий риск';
  if (score >= 70) { color = '#10b981'; zoneText = 'Устойчиво'; }
  else if (score >= 45) { color = '#f59e0b'; zoneText = 'Пограничная'; }

  return (
    <div className="bg-surface border border-white/5 rounded-[32px] p-6 flex flex-col items-center justify-center relative overflow-hidden backdrop-blur-sm shadow-xl">
      <svg className="w-full max-w-[180px] block" viewBox="0 0 200 130">
        <defs>
          <linearGradient id="gauge-grad" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#ef4444"/>
            <stop offset="45%" stopColor="#f59e0b"/>
            <stop offset="70%" stopColor="#10b981"/>
          </linearGradient>
        </defs>
        <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="14" strokeLinecap="round"/>
        <path d={valPath} fill="none" stroke="url(#gauge-grad)" strokeWidth="14" strokeLinecap="round"/>
        <text x={cx} y={96} textAnchor="middle" fill="white" style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 32 }}>{score}</text>
        <text x={cx} y={115} textAnchor="middle" fill={color} style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 11, letterSpacing: '0.05em' }}>{zoneText.toUpperCase()}</text>
      </svg>
      <div className="mt-2 text-[9px] font-bold uppercase tracking-[0.2em] text-gray-500">Score · 0–100</div>
    </div>
  );
}

function WaterfallCard({ pnl }: { pnl: PnLResult }) {
  const steps = [
    { label: 'Выручка', value: pnl.revenue, type: 'total' },
    { label: 'COGS', value: -pnl.cogs, type: 'neg' },
    { label: 'Эквайринг', value: -pnl.acq, type: 'neg' },
    { label: 'Маркетинг', value: -pnl.mkt, type: 'neg' },
    { label: 'Аренда', value: -(pnl.rent + pnl.mallFee), type: 'neg' },
    { label: 'ФОТ', value: -pnl.fotTotal, type: 'neg' },
    { label: 'EBITDA', value: pnl.ebitda, type: pnl.ebitda >= 0 ? 'total' : 'neg-total' }
  ];

  let running = 0;
  const bars = steps.map((s, i) => {
    if (s.type === 'total') {
      const b = { ...s, y0: 0, y1: s.value };
      running = s.value;
      return b;
    } else if (s.type === 'neg-total') {
      running = s.value;
      return { ...s, y0: 0, y1: s.value };
    } else {
      const y0 = running;
      running += s.value;
      return { ...s, y0, y1: running };
    }
  });

  const W = 640, H = 280;
  const padT = 40, padB = 60, padX = 40;
  const plotW = W - padX * 2, plotH = H - padT - padB;
  const stepW = plotW / steps.length;
  const barW = stepW * 0.7;

  const maxVal = pnl.revenue * 1.05;
  const minVal = Math.min(0, pnl.ebitda) * 1.1;
  const range = maxVal - minVal;
  const yScale = (v: number) => padT + (maxVal - v) / range * plotH;

  return (
    <div className="bg-surface border border-white/5 rounded-[32px] p-8 overflow-hidden shadow-sm">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h4 className="text-sm font-black uppercase tracking-widest text-gray-300">Водопад прибыли</h4>
          <p className="text-[10px] text-gray-500 mt-1">От выручки к операционной прибыли</p>
        </div>
        <div className="px-3 py-1 bg-surface2 border border-white/5 rounded-lg font-mono text-[10px] text-gray-400">₸/мес</div>
      </div>
      <svg className="w-full block" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="wf-grad-pos" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgba(0,196,170,0.6)"/>
            <stop offset="100%" stopColor="rgba(0,196,170,0.3)"/>
          </linearGradient>
        </defs>
        <line x1={padX} y1={yScale(0)} x2={W - padX} y2={yScale(0)} stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
        {bars.map((b, i) => {
          const x = padX + i * stepW + (stepW - barW)/2;
          const yTop = yScale(Math.max(b.y0, b.y1));
          const yBot = yScale(Math.min(b.y0, b.y1));
          const h = Math.max(2, yBot - yTop);
          const color = (b.type === 'total' || b.type === 'total-pos') ? 'url(#wf-grad-pos)' : 'rgba(239,68,68,0.4)';
          const labelColor = (b.type === 'total' || b.type === 'total-pos') ? '#6ee7d4' : '#fca5a5';
          return (
            <g key={i}>
              <rect x={x} y={yTop} width={barW} height={h} fill={color} stroke={(b.type === 'total' || b.type === 'total-pos') ? 'rgba(0,196,170,0.6)' : 'rgba(239,68,68,0.6)'} strokeWidth="1" rx="4" />
              <text x={x + barW/2} y={b.value >= 0 ? yTop - 8 : yBot + 14} textAnchor="middle" fill={labelColor} style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700 }}>{fmtShort(Math.abs(b.value))}</text>
              <text x={x + barW/2} y={H - padB + 24} textAnchor="middle" fill="rgba(255,255,255,0.4)" style={{ fontFamily: 'var(--font-sans)', fontSize: 10, fontWeight: 800, textTransform: 'uppercase' }}>{b.label}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function CashFlowCard({ pnl, capex, wc, rampUp }: { pnl: PnLResult, capex: number, wc: number, rampUp: number }) {
  const months = 36;
  const totalInvest = capex + wc;
  const rampMonths = 6;
  
  const varRate = (pnl.cogs + pnl.acq + pnl.mkt) / pnl.revenue;
  const buildRampedCash = (m: number) => {
    const factor = m <= rampMonths ? (rampUp / 100) : 1;
    const rev = pnl.revenue * factor;
    const vC = rev * varRate;
    const fC = pnl.fixedTotal; 
    const tax = pnl.tax * factor;
    return rev - vC - fC - tax;
  };

  const data = [];
  let cum = -totalInvest;
  data.push({ m: 0, v: cum });
  for (let m = 1; m <= months; m++) {
    cum += buildRampedCash(m);
    data.push({ m, v: cum });
  }

  const W = 600, H = 200;
  const padL = 60, padR = 20, padT = 30, padB = 40;
  const plotW = W - padL - padR, plotH = H - padT - padB;
  const maxV = Math.max(0, ...data.map(d => d.v)), minV = Math.min(0, ...data.map(d => d.v));
  const range = (maxV - minV) || 1;

  const xScale = (m: number) => padL + (m / months) * plotW;
  const yScale = (v: number) => padT + (maxV - v) / range * plotH;
  const zeroY = yScale(0);

  const areaPath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(d.m)} ${yScale(d.v)}`).join(' ') + ` L ${xScale(months)} ${zeroY} L ${xScale(0)} ${zeroY} Z`;
  const linePath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(d.m)} ${yScale(d.v)}`).join(' ');

  return (
    <div className="bg-surface border border-white/5 rounded-[32px] p-8 shadow-sm">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h4 className="text-sm font-black uppercase tracking-widest text-gray-300">Накопленный доход</h4>
          <p className="text-[10px] text-gray-500 mt-1">График выхода на окупаемость за 36 месяцев</p>
        </div>
        <div className="px-3 py-1 bg-surface2 border border-white/5 rounded-lg font-mono text-[10px] text-gray-400 text-right uppercase">₸ накопл.</div>
      </div>
      <svg className="w-full block" viewBox={`0 0 ${W} ${H}`}>
        <line x1={padL} y1={zeroY} x2={W - padR} y2={zeroY} stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
        <path d={areaPath} fill={maxV > 0 ? 'rgba(0,196,170,0.1)' : 'rgba(239,68,68,0.1)'} stroke="none" />
        <path d={linePath} fill="none" stroke="#00c4aa" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        {[0, 12, 24, 36].map(m => (
          <text key={m} x={xScale(m)} y={H - padB + 20} textAnchor="middle" fill="rgba(255,255,255,0.3)" style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700 }}>{m === 0 ? 'старт' : `${m}м`}</text>
        ))}
        <text x={padL - 10} y={yScale(maxV)} textAnchor="end" fill="rgba(255,255,255,0.2)" fontSize="10">{fmtShort(maxV)}</text>
        <text x={padL - 10} y={yScale(minV)} textAnchor="end" fill="rgba(255,255,255,0.2)" fontSize="10">{fmtShort(minV)}</text>
      </svg>
    </div>
  );
}

function SafetyBars({ inputs, metrics, pnl, options }: any) {
  const varRate = (inputs.cogsPct + inputs.acqPct + inputs.mktPct) / 100;
  const taxRate = options.taxMode === 'simple' ? 0.03 : 0;
  const mallRate = options.mall ? 0.03 : 0;
  const rentMax = pnl.revenue * (1 - varRate - taxRate - mallRate) - pnl.fotTotal;
  const beRentPct = pnl.revenue > 0 ? (rentMax / pnl.revenue * 100) : 0;

  const rows = [
    { name: 'Трафик', plan: inputs.clients, be: metrics.beClients, unit: 'чел/д', better: 'more', max: Math.max(inputs.clients * 1.5, metrics.beClients * 1.8) },
    { name: 'Чек', plan: inputs.check, be: metrics.beCheck, unit: '₸', better: 'more', max: Math.max(inputs.check * 1.5, metrics.beCheck * 1.8) },
    { name: 'Аренда', plan: metrics.rentPct, be: Math.max(0, beRentPct), unit: '%', better: 'less', max: Math.max(metrics.rentPct * 1.8, beRentPct * 1.2, 40) }
  ];

  return (
    <div className="bg-surface border border-white/5 rounded-[32px] p-8 shadow-sm">
      <div className="flex items-center gap-3 mb-10">
        <div className="w-8 h-8 rounded-lg bg-teal/5 flex items-center justify-center border border-teal/10 text-teal">
          <Scale className="w-4 h-4" />
        </div>
        <h4 className="text-sm font-black uppercase tracking-widest text-gray-300">Запас прочности (Margin of Safety)</h4>
      </div>
      <div className="space-y-12">
        {rows.map(r => {
          const planPos = (r.plan / r.max) * 100;
          const bePos = (r.be / r.max) * 100;
          const isSafe = r.better === 'more' ? r.plan > r.be : r.plan < r.be;
          
          return (
            <div key={r.name} className="relative">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-tight">{r.name}</span>
                <span className={`text-[12px] font-mono font-black ${isSafe ? 'text-teal' : 'text-red-400'}`}>
                  {r.unit === '₸' ? fmtShort(r.plan) : r.plan.toFixed(r.unit==='%'?1:0)} {r.unit}
                </span>
              </div>
              <div className="h-4 bg-surface2 rounded-full relative overflow-visible border border-white/5">
                <div 
                  className="h-full absolute left-0 top-0 opacity-10 rounded-full"
                  style={{ 
                    width: '100%',
                    background: r.better === 'more' 
                      ? `linear-gradient(90deg, #ef4444 0%, #f59e0b 50%, #10b981 100%)`
                      : `linear-gradient(90deg, #10b981 0%, #f59e0b 50%, #ef4444 100%)`
                  }}
                />
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, Math.max(0, planPos))}%` }}
                  className="h-full bg-white/10 relative z-10 rounded-full"
                />
                <div className="absolute top-[-4px] bottom-[-4px] w-0.5 bg-white z-20 shadow-lg" style={{ left: `${bePos}%` }}>
                  <div className="absolute top-[-18px] left-1/2 -translate-x-1/2 text-[8px] font-black text-white bg-surface3 px-1.5 py-0.5 rounded border border-white/10 whitespace-nowrap">
                    BE: {r.unit === '₸' ? fmtShort(r.be) : r.be.toFixed(1)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BenchmarksCard({ segment, metrics }: { segment: string, metrics: any }) {
  const bench = BENCHMARKS[segment];
  if (!bench) return null;

  const rows = [
    { label: 'EBITDA %', value: metrics.ebitdaPct, range: bench.ebitda, better: 'more' },
    { label: 'Payback', value: metrics.payback, range: bench.payback, better: 'less' },
    { label: 'Rent %', value: metrics.rentPct, range: bench.rent, better: 'less' }
  ];

  return (
    <div className="bg-surface border border-white/5 rounded-[32px] p-8 shadow-sm">
      <div className="flex items-center gap-3 mb-10">
        <div className="w-8 h-8 rounded-lg bg-teal/5 flex items-center justify-center border border-teal/10 text-teal">
          <TrendingUp className="w-4 h-4" />
        </div>
        <h4 className="text-sm font-black uppercase tracking-widest text-gray-300">Рыночные бенчмарки</h4>
      </div>
      <div className="space-y-10">
        {rows.map(r => {
          const [bad, med, top] = r.range;
          const min = Math.min(bad, med, top, r.value) * 0.7;
          const max = Math.max(bad, med, top, r.value) * 1.3;
          const getP = (v: number) => (v - min) / (max - min) * 100;
          
          return (
            <div key={r.label}>
              <div className="flex justify-between items-center mb-3">
                <span className="text-[11px] font-bold text-gray-500 uppercase">{r.label}</span>
                <span className="text-xs font-black font-mono text-white">{r.label==='Payback'? (isFinite(r.value) ? Math.ceil(r.value) : '∞'): r.value.toFixed(1)}{r.label!=='Payback'?'%':' мес'}</span>
              </div>
              <div className="h-6 rounded-xl bg-surface2 relative overflow-hidden border border-white/5">
                <div className="absolute inset-0 opacity-20" style={{ 
                  background: r.better === 'more' 
                    ? `linear-gradient(90deg, #ef4444 0%, #f59e0b 50%, #10b981 100%)`
                    : `linear-gradient(90deg, #10b981 0%, #f59e0b 50%, #ef4444 100%)`
                }} />
                <div className="absolute w-0.5 h-full bg-white opacity-30 z-10" style={{ left: `${getP(med)}%` }} />
                <div className="absolute w-0.5 h-full bg-teal opacity-50 z-10" style={{ left: `${getP(top)}%` }} />
                <motion.div 
                  initial={{ left: 0 }}
                  animate={{ left: `${getP(r.value)}%` }}
                  className="absolute w-3 h-3 bg-white rounded-full shadow-xl border-2 border-teal z-20 top-1/2 -translate-y-1/2 -translate-x-1/2" 
                />
              </div>
              <div className="flex justify-between mt-1.5 opacity-30 font-mono text-[7px] uppercase tracking-wider">
                <span>Хуже рынка</span>
                <span className="text-white opacity-100">Медиана</span>
                <span className="text-teal opacity-100">Топ-25%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

