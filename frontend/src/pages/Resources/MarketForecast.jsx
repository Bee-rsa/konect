import { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import Navbar from '../../components/Common/Navbar';

const CURRENCY_SYMBOLS = ['USD', 'EUR', 'GBP'];
const REFRESH_MS = 5 * 60 * 1000;

// Plug in your commodity endpoint here when ready.
// Expected response shape:
// {
//   gold: 2184.32,
//   silver: 24.82,
//   brent: 82.4,
//   updatedAt: "2026-03-20T10:15:00Z"
// }
//
// Leave as empty string to disable live commodities gracefully.
const COMMODITY_API_URL = '';

const formatNumber = (value, digits = 2) =>
  Number(value).toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  });

const getPreviousDateISO = () => {
  const date = new Date();
  date.setDate(date.getDate() - 1);

  while (date.getDay() === 0 || date.getDay() === 6) {
    date.setDate(date.getDate() - 1);
  }

  return date.toISOString().split('T')[0];
};

const getChangeMeta = (current, previous) => {
  if (!previous || previous === 0) {
    return {
      percent: 0,
      trend: 'flat'
    };
  }

  const percent = ((current - previous) / previous) * 100;

  if (percent > 0) return { percent, trend: 'up' };
  if (percent < 0) return { percent, trend: 'down' };

  return { percent, trend: 'flat' };
};

const getTrendStyles = (trend) => {
  if (trend === 'up') {
    return {
      text: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: '↑'
    };
  }

  if (trend === 'down') {
    return {
      text: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: '↓'
    };
  }

  return {
    text: 'text-slate-600',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    icon: '•'
  };
};

const getLevelStyles = (color) => {
  switch (color) {
    case 'red':
      return 'bg-red-50 text-red-700 border-red-200';
    case 'amber':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'green':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'blue':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200';
  }
};

const MiniBar = ({ label, value, width, colorClass }) => (
  <div>
    <div className="mb-2 flex items-center justify-between text-sm">
      <span className="text-slate-600">{label}</span>
      <span className="font-semibold text-slate-800">{value}</span>
    </div>
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
      <div className={`h-full rounded-full ${colorClass}`} style={{ width }} />
    </div>
  </div>
);

MiniBar.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  width: PropTypes.string.isRequired,
  colorClass: PropTypes.string.isRequired
};

const ForecastGauge = ({ score }) => {
  const fuelRiskWidth = `${Math.min(100, Math.max(20, score + 10))}%`;
  const fxVolWidth = `${Math.min(100, Math.max(20, score))}%`;
  const portWidth = `${Math.min(100, Math.max(20, 100 - Math.abs(score - 60)))}%`;
  const truckingWidth = `${Math.min(100, Math.max(20, 88 - Math.abs(score - 45)))}%`;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">Freight Sentiment</h3>
          <p className="text-xs text-slate-500">Live logistics pressure indicator</p>
        </div>
        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-custom-blue">
          Live
        </span>
      </div>

      <div className="flex flex-col items-center justify-center py-4">
        <div className="relative flex h-40 w-40 items-center justify-center rounded-full border-[12px] border-blue-100 bg-gradient-to-br from-white to-slate-50">
          <div className="text-center">
            <div className="text-3xl font-bold text-slate-900">{score}</div>
            <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
              / 100
            </div>
          </div>
        </div>

        <p className="mt-4 text-center text-sm font-medium text-slate-700">
          Market pressure is currently <span className="text-custom-blue">being driven mainly by FX movement</span>.
        </p>
      </div>

      <div className="space-y-4">
        <MiniBar
          label="Fuel Risk"
          value={score >= 70 ? 'High' : score >= 50 ? 'Moderate' : 'Stable'}
          width={fuelRiskWidth}
          colorClass="bg-red-500"
        />
        <MiniBar
          label="FX Volatility"
          value={score >= 65 ? 'High' : score >= 45 ? 'Medium' : 'Low'}
          width={fxVolWidth}
          colorClass="bg-amber-500"
        />
        <MiniBar
          label="Port Stability"
          value={score >= 60 ? 'Watch' : 'Stable'}
          width={portWidth}
          colorClass="bg-blue-500"
        />
        <MiniBar
          label="Regional Trucking"
          value="Stable"
          width={truckingWidth}
          colorClass="bg-emerald-500"
        />
      </div>
    </div>
  );
};

ForecastGauge.propTypes = {
  score: PropTypes.number.isRequired
};

const CommodityCard = ({ title, value, unit, description, accentClass }) => (
  <div className={`rounded-2xl border p-5 shadow-sm ${accentClass}`}>
    <p className="text-sm font-medium">{title}</p>
    <h3 className="mt-2 text-2xl font-bold">
      {value !== null && value !== undefined ? `${unit}${formatNumber(value, 2)}` : 'Unavailable'}
    </h3>
    <p className="mt-3 text-sm leading-6 opacity-90">{description}</p>
  </div>
);

CommodityCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.number,
  unit: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  accentClass: PropTypes.string.isRequired
};

const MarketForecast = () => {
  const [fxData, setFxData] = useState(null);
  const [commodities, setCommodities] = useState({
    gold: null,
    silver: null,
    brent: null,
    updatedAt: ''
  });

  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [commodityError, setCommodityError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchRates = useCallback(
    async ({ isManualRefresh = false } = {}) => {
      try {
        if (isManualRefresh || fxData) {
          setIsRefreshing(true);
        } else {
          setLoading(true);
        }

        setErrorMsg('');

        const symbolsParam = CURRENCY_SYMBOLS.join(',');
        const previousDate = getPreviousDateISO();

        const [latestRes, previousRes] = await Promise.all([
          fetch(`https://api.frankfurter.dev/v1/latest?base=ZAR&symbols=${symbolsParam}`),
          fetch(`https://api.frankfurter.dev/v1/${previousDate}?base=ZAR&symbols=${symbolsParam}`)
        ]);

        if (!latestRes.ok || !previousRes.ok) {
          throw new Error('Unable to fetch FX data.');
        }

        const latestJson = await latestRes.json();
        const previousJson = await previousRes.json();

        const cards = CURRENCY_SYMBOLS.map((symbol) => {
          const zarPerUnitCurrent = latestJson?.rates?.[symbol] ? 1 / latestJson.rates[symbol] : 0;
          const zarPerUnitPrevious = previousJson?.rates?.[symbol] ? 1 / previousJson.rates[symbol] : 0;
          const changeMeta = getChangeMeta(zarPerUnitCurrent, zarPerUnitPrevious);

          let note = 'Monitor imported cargo cost exposure.';
          if (symbol === 'USD') {
            note =
              changeMeta.trend === 'up'
                ? 'Imported cargo cost pressure rising.'
                : 'Dollar-linked landed cost pressure easing slightly.';
          }
          if (symbol === 'EUR') {
            note =
              changeMeta.trend === 'up'
                ? 'European sourcing becoming firmer in ZAR terms.'
                : 'European buying window slightly improved.';
          }
          if (symbol === 'GBP') {
            note =
              changeMeta.trend === 'up'
                ? 'UK procurement may need closer quote protection.'
                : 'UK sourcing costs softening modestly.';
          }

          return {
            title: `${symbol} / ZAR`,
            value: formatNumber(zarPerUnitCurrent, 2),
            change: `${changeMeta.percent >= 0 ? '+' : ''}${formatNumber(changeMeta.percent, 2)}%`,
            trend: changeMeta.trend,
            note
          };
        });

        const usdCard = cards.find((card) => card.title === 'USD / ZAR');
        const eurCard = cards.find((card) => card.title === 'EUR / ZAR');
        const gbpCard = cards.find((card) => card.title === 'GBP / ZAR');

        const usdValue = Number(usdCard?.value || 0);
        const eurValue = Number(eurCard?.value || 0);
        const gbpValue = Number(gbpCard?.value || 0);

        const avgFxPressure = (usdValue + eurValue + gbpValue) / 3;
        const sentimentScore = Math.max(25, Math.min(92, Math.round((avgFxPressure - 14) * 5)));

        const routeForecasts = [
          {
            route: 'Durban → Shanghai',
            level: usdValue >= 19 ? 'High' : usdValue >= 17 ? 'Moderate' : 'Low',
            eta: usdValue >= 19 ? 'Watchlist' : 'Stable',
            color: usdValue >= 19 ? 'red' : usdValue >= 17 ? 'amber' : 'green',
            description: 'Asia import lanes are sensitive to currency pressure and quote timing.'
          },
          {
            route: 'Durban → Rotterdam',
            level: eurValue >= 21 ? 'High' : eurValue >= 19 ? 'Moderate' : 'Low',
            eta: eurValue >= 21 ? 'Delayed' : 'Stable',
            color: eurValue >= 21 ? 'red' : eurValue >= 19 ? 'amber' : 'green',
            description: 'European routing remains more exposed when EUR/ZAR strengthens.'
          },
          {
            route: 'Johannesburg → Lusaka',
            level: 'Low',
            eta: 'Stable',
            color: 'green',
            description: 'Regional trucking remains less exposed than deep-sea import pricing.'
          },
          {
            route: 'Cape Town → London',
            level: gbpValue >= 24 ? 'High' : gbpValue >= 22 ? 'Moderate' : 'Low',
            eta: gbpValue >= 24 ? 'Watchlist' : 'Stable',
            color: gbpValue >= 24 ? 'red' : gbpValue >= 22 ? 'amber' : 'blue',
            description: 'UK-linked cargo costs track GBP shifts closely during quote windows.'
          }
        ];

        const plannerNotes = [
          usdValue >= 18.5
            ? 'Review USD-linked quotations and shorten quote validity where needed.'
            : 'USD-linked shipments look more manageable, but keep quote windows disciplined.',
          eurValue >= 20
            ? 'European imports may need stronger landed-cost buffers.'
            : 'European sourcing pressure is moderate for now.',
          'Use regional trucking stability as a balancing lever for SADC route planning.'
        ];

        const insightFeed = [
          {
            title: 'Exchange-rate movement remains the clearest live signal',
            tag: 'FX Watch',
            body: 'This page is driven by live browser-side exchange-rate data and refreshed automatically.'
          },
          {
            title: usdValue >= 18.5 ? 'Dollar strength may tighten import margins' : 'Dollar pressure is relatively contained',
            tag: 'USD / ZAR',
            body:
              usdValue >= 18.5
                ? 'Procurement teams should monitor landed cost and quote expiry windows closely.'
                : 'Import cost pressure from USD exposure is present, but not at peak levels.'
          },
          {
            title: eurValue >= 20 ? 'European sourcing conditions are firmer' : 'European sourcing conditions are steadier',
            tag: 'EUR / ZAR',
            body:
              eurValue >= 20
                ? 'Expect more sensitivity on Europe-linked freight costing.'
                : 'Europe-linked planning is currently less strained than higher-pressure scenarios.'
          }
        ];

        setFxData({
          cards,
          routeForecasts,
          plannerNotes,
          insightFeed,
          sentimentScore,
          latestDate: latestJson?.date || '',
          previousDate: previousJson?.date || ''
        });

        setLastUpdated(new Date());
      } catch {
        setErrorMsg('Could not load live market data right now.');
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    [fxData]
  );

  const fetchCommodities = useCallback(async () => {
    if (!COMMODITY_API_URL) {
      setCommodityError('Commodity feed not configured yet.');
      return;
    }

    try {
      setCommodityError('');

      const res = await fetch(COMMODITY_API_URL);

      if (!res.ok) {
        throw new Error('Unable to fetch commodity data.');
      }

      const data = await res.json();

      setCommodities({
        gold: typeof data.gold === 'number' ? data.gold : null,
        silver: typeof data.silver === 'number' ? data.silver : null,
        brent: typeof data.brent === 'number' ? data.brent : null,
        updatedAt: data.updatedAt || ''
      });
    } catch {
      setCommodityError('Could not load commodity data right now.');
    }
  }, []);

  useEffect(() => {
    fetchRates();
    fetchCommodities();
  }, [fetchRates, fetchCommodities]);

  useEffect(() => {
    if (!autoRefresh) return undefined;

    const interval = setInterval(() => {
      fetchRates();
      fetchCommodities();
    }, REFRESH_MS);

    return () => clearInterval(interval);
  }, [autoRefresh, fetchRates, fetchCommodities]);

  const overallSummary = useMemo(() => {
    if (!fxData) {
      return {
        headline: 'Market Forecast',
        subheadline: 'Track the core pricing signals shaping freight decisions across ocean, road, and cross-border logistics.',
        outlook: 'Loading live exchange-rate signals...'
      };
    }

    const usdCard = fxData.cards.find((card) => card.title === 'USD / ZAR');
    const usdValue = Number(usdCard?.value || 0);

    return {
      headline: 'Market Forecast',
      subheadline: 'Live exchange-rate signals for freight planning, import costing, and quote risk awareness.',
      outlook:
        usdValue >= 18.5
          ? 'Short-term outlook: Elevated import cost pressure'
          : 'Short-term outlook: Moderate logistics cost pressure'
    };
  }, [fxData]);

  return (
    <div className="min-h-screen bg-slate-50 font-poppins">
      <Navbar />

      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 shadow-xl">
          <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-12 lg:p-8">
            <div className="lg:col-span-8">
              <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-100">
                Freight iT Intelligence
              </span>

              <h1 className="mt-4 text-2xl font-bold text-white sm:text-3xl">
                {overallSummary.headline}
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200 sm:text-base">
                {overallSummary.subheadline}
              </p>

              <div className="mt-5 inline-flex rounded-2xl bg-white/10 px-4 py-3 text-sm font-medium text-blue-100 backdrop-blur-sm">
                {overallSummary.outlook}
              </div>
            </div>

            <div className="lg:col-span-4">
              <div className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-white">Live Snapshot</h2>
                  <span className="rounded-full bg-emerald-400/20 px-2.5 py-1 text-[11px] font-semibold text-emerald-200">
                    Live FX
                  </span>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="rounded-xl bg-white/10 px-3 py-3 text-slate-100">
                    FX source date: {fxData?.latestDate || 'Loading...'}
                  </div>
                  <div className="rounded-xl bg-white/10 px-3 py-3 text-slate-100">
                    Last refreshed: {lastUpdated ? lastUpdated.toLocaleTimeString() : 'Loading...'}
                  </div>
                  <div className="rounded-xl bg-white/10 px-3 py-3 text-slate-100">
                    Auto refresh: {autoRefresh ? 'ON' : 'OFF'}
                  </div>
                  <div className="rounded-xl bg-white/10 px-3 py-3 text-slate-100">
                    Commodities: {COMMODITY_API_URL ? 'Configured' : 'Not configured'}
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      fetchRates({ isManualRefresh: true });
                      fetchCommodities();
                    }}
                    disabled={loading || isRefreshing}
                    className="flex h-11 items-center justify-center rounded-xl bg-white text-sm font-semibold text-slate-800 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isRefreshing ? 'Refreshing...' : 'Refresh Now'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setAutoRefresh((prev) => !prev)}
                    className={`flex h-11 items-center justify-center rounded-xl text-sm font-semibold transition ${
                      autoRefresh
                        ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                        : 'bg-slate-700 text-white hover:bg-slate-800'
                    }`}
                  >
                    Auto Refresh {autoRefresh ? 'ON' : 'OFF'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {loading && (
          <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
            Loading live market data...
          </div>
        )}

        {errorMsg && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 shadow-sm">
            {errorMsg}
          </div>
        )}

        {!loading && !errorMsg && fxData && (
          <>
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {fxData.cards.map((card) => {
                const styles = getTrendStyles(card.trend);

                return (
                  <div
                    key={card.title}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-slate-500">{card.title}</p>
                        <h3 className="mt-2 text-2xl font-bold text-slate-900">{card.value}</h3>
                      </div>

                      <div className={`rounded-xl border px-3 py-1.5 text-xs font-semibold ${styles.bg} ${styles.text} ${styles.border}`}>
                        {styles.icon} {card.change}
                      </div>
                    </div>

                    <p className="mt-4 text-sm leading-6 text-slate-600">{card.note}</p>
                  </div>
                );
              })}
            </div>

            <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-slate-800">Commodities</h2>
                  <p className="text-sm text-slate-500">
                    Gold, silver, and oil pressure indicators for logistics planning.
                  </p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  {commodities.updatedAt ? `Updated ${new Date(commodities.updatedAt).toLocaleTimeString()}` : 'No live commodity timestamp'}
                </span>
              </div>

              {commodityError && (
                <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                  {commodityError}
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <CommodityCard
                  title="Gold"
                  value={commodities.gold}
                  unit="$"
                  description="Safe-haven demand can signal broader market risk sentiment."
                  accentClass="border-yellow-200 bg-yellow-50 text-yellow-900"
                />
                <CommodityCard
                  title="Silver"
                  value={commodities.silver}
                  unit="$"
                  description="Industrial demand can reflect production and trade activity."
                  accentClass="border-slate-300 bg-slate-100 text-slate-900"
                />
                <CommodityCard
                  title="Brent Oil"
                  value={commodities.brent}
                  unit="$"
                  description="Energy prices can influence fuel-linked freight cost pressure."
                  accentClass="border-red-200 bg-red-50 text-red-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
              <div className="space-y-6 xl:col-span-8">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-semibold text-slate-800">Logistics Market Outlook</h2>
                      <p className="text-sm text-slate-500">
                        Live currency signals translated into logistics planning guidance.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Ocean Freight
                      </div>
                      <div className="text-xl font-bold text-slate-900">
                        {fxData.sentimentScore >= 70 ? 'Rising Caution' : 'Manageable'}
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        FX-sensitive import lanes need tighter quotation discipline when ZAR weakens.
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-4">
                      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Road Freight
                      </div>
                      <div className="text-xl font-bold text-slate-900">Stable Bias</div>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        Regional trucking remains structurally steadier than international import pricing.
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-4">
                      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Import Costs
                      </div>
                      <div className="text-xl font-bold text-slate-900">
                        {fxData.sentimentScore >= 65 ? 'FX Sensitive' : 'Watchlist'}
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        Imported cargo planning should adapt to live exchange-rate movement before quote lock-in.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-5">
                    <h2 className="text-base font-semibold text-slate-800">Route Pressure Forecast</h2>
                    <p className="text-sm text-slate-500">
                      Indicative route outlook driven by current live FX conditions.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {fxData.routeForecasts.map((item) => (
                      <div
                        key={item.route}
                        className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                      >
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                          <div>
                            <h3 className="text-sm font-semibold text-slate-800">{item.route}</h3>
                            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                              {item.description}
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${getLevelStyles(item.color)}`}>
                              Pressure: {item.level}
                            </span>
                            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                              ETA: {item.eta}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6 xl:col-span-4">
                <ForecastGauge score={fxData.sentimentScore} />

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-slate-800">Planner Notes</h3>
                    <p className="text-xs text-slate-500">
                      Suggested actions based on the latest live readings.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {fxData.plannerNotes.map((note) => (
                      <div
                        key={note}
                        className="rounded-xl border border-blue-100 bg-blue-50 p-3 text-sm text-blue-800"
                      >
                        {note}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-slate-800">Insights Feed</h3>
                    <p className="text-xs text-slate-500">Live context for the logistics desk.</p>
                  </div>

                  <div className="space-y-4">
                    {fxData.insightFeed.map((item) => (
                      <div key={item.title} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <div className="mb-2 inline-flex rounded-full bg-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                          {item.tag}
                        </div>
                        <h4 className="text-sm font-semibold text-slate-800">{item.title}</h4>
                        <p className="mt-2 text-sm leading-6 text-slate-600">{item.body}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MarketForecast;