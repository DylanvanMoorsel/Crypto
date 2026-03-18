import { useState, useEffect, useRef } from "react";
import Chart from "chart.js/auto";

const COINS = ["bitcoin", "ethereum", "solana"];
const API_URL = (ids) =>
  `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=eur&include_24hr_change=true&x_cg_demo_api_key=CG-GELfdWVmVWAYUrdgU4pXoGfk`;

const COIN_META = {
  bitcoin:  { label: "Bitcoin",  symbol: "BTC", icon: "₿", color: "#f7931a" },
  ethereum: { label: "Ethereum", symbol: "ETH", icon: "Ξ", color: "#627eea" },
  solana:   { label: "Solana",   symbol: "SOL", icon: "◎", color: "#9945ff" },
};

const barColors = ["#f7931a", "#627eea", "#9945ff"];

function formatPrice(price) {
  if (typeof price !== "number") return price;
  return new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" }).format(price);
}

function formatChange(change) {
  if (typeof change !== "number") return null;
  const sign = change >= 0 ? "+" : "";
  return `${sign}${change.toFixed(2)}%`;
}

function Header({ onRefresh, lastUpdated }) {
  return (
    <div className="header">
      <div className="logo">CryptoDash</div>
      <div className="header-right">
        {lastUpdated && (
          <span className="last-updated">Bijgewerkt om {lastUpdated}</span>
        )}
        <button onClick={onRefresh}>Vernieuwen</button>
      </div>
    </div>
  );
}

function CoinIcon({ icon }) {
  return <span className="coin-icon">{icon}</span>;
}

function PriceDisplay({ price }) {
  return <p className="price">{formatPrice(price)}</p>;
}

function ChangeDisplay({ change }) {
  if (change === undefined || change === null) return null;
  const isPositive = change >= 0;
  return (
    <p className={isPositive ? "green" : "red"}>{formatChange(change)}</p>
  );
}

function LineChart({ coinId, history }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const meta = COIN_META[coinId];

  useEffect(() => {
    if (history.length < 2) return;

    const xValues = history.map((_, i) => `${i + 1}`);
    const yValues = history;

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    chartRef.current = new Chart(canvasRef.current, {
      type: "line",
      data: {
        labels: xValues,
        datasets: [{
          label: meta.label,
          backgroundColor: meta.color + "33",
          borderColor: meta.color,
          data: yValues,
          tension: 0.4,
          pointRadius: 3,
        }],
      },
      options: {
        plugins: {
          legend: { display: false },
        },
        scales: {
          x: { display: false },
          y: {
            ticks: {
              color: "#aaa",
              callback: (val) => "€" + val.toLocaleString("nl-NL"),
            },
            grid: { color: "rgba(255,255,255,0.05)" },
          },
        },
      },
    });

    return () => {
      if (chartRef.current) chartRef.current.destroy();
    };
  }, [history]);

  return <canvas ref={canvasRef} height={80} />;
}

function CoinCard({ coinId, data, history }) {
  const meta = COIN_META[coinId];
  const price = data?.eur;
  const change = data?.eur_24h_change;

  return (
    <div className="card">
      <div className="card-header">
        <CoinIcon icon={meta.icon} />
        <div>
          <h3>{meta.label} ({meta.symbol})</h3>
        </div>
      </div>
      <PriceDisplay price={price ?? "Laden..."} />
      <ChangeDisplay change={change} />
      <LineChart coinId={coinId} history={history} />
    </div>
  );
}

function CoinList({ prices, histories }) {
  return (
    <div className="coin-list">
      {COINS.map((coin) => (
        <CoinCard
          key={coin}
          coinId={coin}
          data={prices[coin]}
          history={histories[coin] ?? []}
        />
      ))}
    </div>
  );
}

function PriceChart({ prices }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    const xValues = COINS.map((coin) => COIN_META[coin].label);
    const yValues = COINS.map((coin) => prices[coin]?.eur ?? 0);

    if (yValues.every((v) => v === 0)) return;

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    chartRef.current = new Chart(canvasRef.current, {
      type: "pie",
      data: {
        labels: xValues,
        datasets: [{
          backgroundColor: barColors,
          data: yValues,
        }],
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: "Prijsverdeling Crypto",
            color: "#ffffff",
            font: { size: 16 },
          },
          legend: {
            labels: { color: "#ffffff" },
          },
        },
      },
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [prices]);

  return (
    <div className="card chart-card">
      <canvas ref={canvasRef} id="myChart" />
    </div>
  );
}

function App() {
  const [prices, setPrices] = useState({});
  const [histories, setHistories] = useState({
    bitcoin: [],
    ethereum: [],
    solana: [],
  });
  const [lastUpdated, setLastUpdated] = useState(null);

  function fetchPrices() {
    const ids = COINS.join(",");
    fetch(API_URL(ids))
      .then((res) => res.json())
      .then((data) => {
        setPrices(data);

        // Voeg nieuwe prijs toe aan geschiedenisen houd alleen de laatste 20 bij
        setHistories((prev) => {
          const updated = { ...prev };
          COINS.forEach((coin) => {
            const newPrice = data[coin]?.eur;
            if (typeof newPrice === "number") {
              updated[coin] = [...(prev[coin] ?? []), newPrice].slice(-20);
            }
          });
          return updated;
        });

        const now = new Date().toLocaleTimeString("nl-NL");
        setLastUpdated(now);
      })
      .catch((err) => console.error("Fout bij ophalen:", err));
  }

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container">
      <Header onRefresh={fetchPrices} lastUpdated={lastUpdated} />
      <h1>Market Overview</h1>
      <CoinList prices={prices} histories={histories} />
      <PriceChart prices={prices} />
    </div>
  );
}

export default App;