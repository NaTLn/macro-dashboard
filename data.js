// ============================================
// MACRO·INTEL — Static Data & Configuration
// ============================================

const TICKERS = [
  { sym: 'S&P 500',  price: 5218.40, chg: +0.31, category: 'equity' },
  { sym: 'NASDAQ',   price: 16342.10,chg: -0.18, category: 'equity' },
  { sym: 'FTSE 100', price: 8342.50, chg: +0.62, category: 'equity' },
  { sym: 'DAX',      price: 21104.20,chg: -1.41, category: 'equity' },
  { sym: 'GOLD',     price: 4677.50, chg: +0.88, category: 'commodity' },
  { sym: 'SILVER',   price: 33.12,   chg: +1.21, category: 'commodity' },
  { sym: 'OIL WTI',  price: 71.24,   chg: -1.12, category: 'commodity' },
  { sym: 'BTC/USD',  price: 82450,   chg: +1.43, category: 'crypto' },
  { sym: 'ETH/USD',  price: 1842,    chg: +0.94, category: 'crypto' },
  { sym: 'EUR/USD',  price: 1.0812,  chg: -0.22, category: 'fx' },
  { sym: 'GBP/USD',  price: 1.2934,  chg: -0.09, category: 'fx' },
  { sym: 'USD/JPY',  price: 149.82,  chg: +0.31, category: 'fx' },
  { sym: 'DXY',      price: 104.21,  chg: +0.19, category: 'fx' },
  { sym: 'US 10Y',   price: 4.38,    chg: +0.04, category: 'bonds' },
  { sym: 'UK 10Y',   price: 4.62,    chg: +0.02, category: 'bonds' },
  { sym: 'COPPER',   price: 4.68,    chg: -0.44, category: 'commodity' },
];

const NEWS_DATA = [
  {
    tag: 'geo', tagLabel: 'Geopolitical',
    headline: 'Trump tariff escalation: 25% levies on EU imports spark Brussels retaliatory threat against US services sector',
    meta: '2h ago · Reuters', hot: true
  },
  {
    tag: 'macro', tagLabel: 'Macro',
    headline: 'US PCE inflation holds at 2.8% — Fed signals "higher for longer" path into H2 2026 as services costs remain stubborn',
    meta: '4h ago · Bloomberg'
  },
  {
    tag: 'central', tagLabel: 'Central Banks',
    headline: 'BoE holds at 4.5%, splits 7-2 — MPC minutes flag services inflation as persistent risk, June cut odds fade to 38%',
    meta: '6h ago · FT'
  },
  {
    tag: 'trade', tagLabel: 'Trade',
    headline: 'China retaliates with rare earth export curbs targeting US semiconductor supply chain — ASML, NVDA shares slide',
    meta: '8h ago · WSJ'
  },
  {
    tag: 'energy', tagLabel: 'Energy',
    headline: 'OPEC+ emergency meeting called — Saudi Arabia signals possible production cut reversal as US shale output surges',
    meta: '10h ago · Energy Intelligence', hot: true
  },
  {
    tag: 'macro', tagLabel: 'Macro',
    headline: 'Germany enters technical recession — Q1 GDP -0.3% marks second consecutive quarterly contraction, ECB cut pressure mounts',
    meta: '12h ago · Eurostat'
  },
  {
    tag: 'central', tagLabel: 'Central Banks',
    headline: 'Fed minutes: Officials divided on June cut — majority see two cuts in 2026 as appropriate but data-dependent',
    meta: '1d ago · FOMC'
  },
  {
    tag: 'geo', tagLabel: 'Geopolitical',
    headline: 'Red Sea shipping routes disrupted again — Houthi attacks resume after ceasefire collapse, Suez transit costs spike 40%',
    meta: '1d ago · Lloyd\'s List'
  },
  {
    tag: 'trade', tagLabel: 'Trade',
    headline: 'USD strength weighing on EM currencies — TRY, BRL, MXN all hit multi-month lows vs dollar on risk-off sentiment',
    meta: '1d ago · FX Street'
  },
  {
    tag: 'macro', tagLabel: 'Macro',
    headline: 'UK CPI surprise upside 3.1% — services component refuses to budge, pressuring BoE hawks and GBP/USD lower',
    meta: '2d ago · ONS'
  },
  {
    tag: 'energy', tagLabel: 'Energy',
    headline: 'Natural gas surges 12% on unseasonable demand — European storage levels drop below 5-year seasonal average',
    meta: '2d ago · Bloomberg'
  },
  {
    tag: 'geo', tagLabel: 'Geopolitical',
    headline: 'BRICS nations accelerate gold reserve accumulation — combined purchases hit 5-year high as de-dollarisation deepens',
    meta: '2d ago · Reuters'
  },
];

const CONVICTION_ASSETS = [
  { asset: 'GOLD',    dir: 'long',  score: 91, color: '#22c55e',
    analysis: 'De-dollarisation cycle + central bank accumulation + safe-haven demand. 16% correction from ATH offers re-entry.' },
  { asset: 'BTC',     dir: 'long',  score: 78, color: '#f59e0b',
    analysis: 'Post-halving cycle intact. Institutional ETF inflows sustaining bid. Risk-on rotation catalyst needed.' },
  { asset: 'DXY',     dir: 'long',  score: 74, color: '#3b82f6',
    analysis: 'Tariff flight-to-safety bid. Fed higher-for-longer differentiates USD vs EUR/GBP. Above 104 = structural.' },
  { asset: 'EUR/USD', dir: 'short', score: 70, color: '#ef4444',
    analysis: 'Germany recession + ECB forced to cut while Fed holds. Rate differential widening against EUR.' },
  { asset: 'SILVER',  dir: 'long',  score: 72, color: '#06b6d4',
    analysis: 'Lagging gold in the metals complex. Gold/silver ratio elevated. Industrial + monetary demand converging.' },
  { asset: 'US 10Y',  dir: 'short', score: 67, color: '#ef4444',
    analysis: 'Fiscal pressure, sticky inflation, supply glut from Treasury issuance. Real yields elevated but yield curve re-steepening.' },
  { asset: 'OIL',     dir: 'watch', score: 55, color: '#f59e0b',
    analysis: 'OPEC uncertainty vs demand concerns. Geopolitical risk premium vs supply glut. Directional conviction low.' },
  { asset: 'COPPER',  dir: 'watch', score: 49, color: '#f59e0b',
    analysis: 'China slowdown weighing vs green capex demand. Watch PMI data for directional signal.' },
];

const SIGNALS = [
  { icon: '📉', text: 'Yield curve still inverted — 2s10s at -25bps, 18 consecutive months below zero. Historical recession lead time 12–18 months.', str: 'HIGH', col: '#ef4444' },
  { icon: '🏦', text: 'M2 money supply contracting YoY — liquidity tightening in progress. Historically precedes risk asset pressure by 6–9 months.', str: 'HIGH', col: '#ef4444' },
  { icon: '📦', text: 'ISM Manufacturing sub-50 for 4th consecutive month — contraction confirmed. New orders component particularly weak at 44.2.', str: 'MED', col: '#f59e0b' },
  { icon: '⛽', text: 'Energy complex diverging — natural gas +12% while oil slides. Watch crack spreads for demand destruction signal.', str: 'MED', col: '#f59e0b' },
  { icon: '🌍', text: 'EM central banks accumulating gold at record pace — BRICS de-dollarisation accelerating. Structural multi-year demand floor.', str: 'HIGH', col: '#22c55e' },
  { icon: '💵', text: 'DXY above 104 historically stresses EM debt servicing. Watch TRY, BRL, ZAR for credit stress signals.', str: 'MED', col: '#f59e0b' },
];

const EVENTS = [
  { date: 'Apr 2',  imp: 'high', text: 'ADP Non-Farm Employment · US — Pre-NFP read on labour market health' },
  { date: 'Apr 4',  imp: 'high', text: 'US NFP & Unemployment Rate · Major market mover, watch for surprise' },
  { date: 'Apr 9',  imp: 'high', text: 'FOMC Minutes Release · Fed language and dissent detail — June cut signal?' },
  { date: 'Apr 10', imp: 'med',  text: 'US CPI Inflation March · Crucial for Fed path — consensus 2.8% YoY' },
  { date: 'Apr 16', imp: 'med',  text: 'UK CPI Inflation · ONS release — services component key watch' },
  { date: 'Apr 17', imp: 'high', text: 'ECB Rate Decision · Lagarde presser — Germany recession may force cut' },
  { date: 'Apr 23', imp: 'med',  text: 'UK GDP Estimate Q1 · Prelim read — recession risk assessment' },
  { date: 'Apr 30', imp: 'high', text: 'FOMC Rate Decision · May meeting — hold expected, language critical' },
];

const CYCLES = [
  { name: 'US Business Cycle',   phase: 'Late Expansion', cls: 'phase-late' },
  { name: 'Credit Cycle',        phase: 'Contraction',    cls: 'phase-cont' },
  { name: 'Commodity Supercycle',phase: 'Expansion',      cls: 'phase-exp'  },
  { name: 'Dollar Cycle',        phase: 'Strengthening',  cls: 'phase-exp'  },
  { name: 'Equity Bull/Bear',    phase: 'Late Bull',      cls: 'phase-late' },
  { name: 'Rate Cycle',          phase: 'Peak / Hold',    cls: 'phase-hold' },
];

const HEATMAP_DATA = [
  {
    category: 'Equities',
    assets: [
      { label: 'SPX',  val: +0.3 }, { label: 'NDX',  val: -0.2 },
      { label: 'FTSE', val: +0.8 }, { label: 'DAX',  val: -1.4 },
      { label: 'NKY',  val: +1.1 }, { label: 'HSI',  val: -0.9 },
      { label: 'EEM',  val: +0.2 },
    ]
  },
  {
    category: 'Commodities',
    assets: [
      { label: 'GOLD', val: +2.1 }, { label: 'SLVR', val: +1.8 },
      { label: 'OIL',  val: -2.3 }, { label: 'GAS',  val: +3.1 },
      { label: 'COPR', val: -0.8 }, { label: 'CORN', val: +0.4 },
      { label: 'WHET', val: -0.3 },
    ]
  },
  {
    category: 'Crypto',
    assets: [
      { label: 'BTC',  val: +4.2 }, { label: 'ETH',  val: +3.1 },
      { label: 'SOL',  val: +5.8 }, { label: 'XRP',  val: +2.4 },
      { label: 'BNB',  val: +1.9 }, { label: 'ADA',  val: -0.7 },
      { label: 'DOT',  val: +0.9 },
    ]
  },
  {
    category: 'FX',
    assets: [
      { label: 'EUR',  val: -0.6 }, { label: 'GBP',  val: -0.3 },
      { label: 'JPY',  val: +0.8 }, { label: 'CNH',  val: +0.4 },
      { label: 'AUD',  val: -1.1 }, { label: 'MXN',  val: +1.3 },
      { label: 'DXY',  val: +0.5 },
    ]
  },
];
