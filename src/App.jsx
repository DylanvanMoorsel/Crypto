import { useState, useEffect, useRef } from "react";
import Chart from "chart.js/auto";
 
const COINS = ["bitcoin", "ethereum", "solana"];
const API_URL = (ids) =>
  `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=eur&include_24hr_change=true&x_cg_demo_api_key=CG-GELfdWVmVWAYUrdgU4pXoGfk`;
 
const ALL_COINS_URL =
  "https://api.coingecko.com/api/v3/coins/markets?vs_currency=eur&order=market_cap_desc&per_page=100&page=1&x_cg_demo_api_key=CG-GELfdWVmVWAYUrdgU4pXoGfk";
 
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
 
function CoinCard({ coinId, data, history, onFavorite, isFavorite }) {
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
        <button
          className="fav-btn"
          onClick={() => onFavorite(coinId)}
          title="Favoriet"
        >
          {isFavorite ? "⭐" : "☆"}
        </button>
      </div>
      <PriceDisplay price={price ?? "Laden..."} />
      <ChangeDisplay change={change} />
      <LineChart coinId={coinId} history={history} />
    </div>
  );
}
 
function CoinList({ prices, histories, favorites, onFavorite }) {
  return (
    <div className="coin-list">
      {COINS.map((coin) => (
        <CoinCard
          key={coin}
          coinId={coin}
          data={prices[coin]}
          history={histories[coin] ?? []}
          onFavorite={onFavorite}
          isFavorite={favorites.includes(coin)}
        />
      ))}
    </div>
  );
}
 
const TOP10_COLORS = [
  "#f7931a", "#627eea", "#9945ff", "#00d4aa", "#e84142",
  "#2775ca", "#f0b90b", "#e6007a", "#16c784", "#ff6b35",
];
 
function PriceChart({ allCoins }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
 
  useEffect(() => {
    if (!allCoins || allCoins.length === 0) return;
 
    const top10 = allCoins.slice(0, 10);
    const xValues = top10.map((coin) => coin.name);
    const yValues = top10.map((coin) => coin.market_cap ?? 0);
 
    if (yValues.every((v) => v === 0)) return;
 
    if (chartRef.current) {
      chartRef.current.destroy();
    }
 
    chartRef.current = new Chart(canvasRef.current, {
      type: "pie",
      data: {
        labels: xValues,
        datasets: [{
          backgroundColor: TOP10_COLORS,
          data: yValues,
        }],
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: "Marktaandeel top 10 coins",
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
  }, [allCoins]);
 
  return (
    <div className="card chart-card">
      <canvas ref={canvasRef} id="myChart" />
    </div>
  );
}
 
// Detailpagina voor een coin uit de lijst van 100
function CoinDetail({ coin, onBack }) {
  if (!coin) return null;
 
  // Toon alle velden behalve id
  const entries = Object.entries(coin).filter(([key]) => key !== "id");
 
  const change24h = coin.price_change_percentage_24h;
  const change7d = coin.price_change_percentage_7d;
  const change30d = coin.price_change_percentage_30d;
 
  function colorChange(val) {
    if (val === null || val === undefined) return "";
    return val >= 0 ? "green" : "red";
  }
 
  function fmtPct(val) {
    if (val === null || val === undefined) return "-";
    const sign = val >= 0 ? "+" : "";
    return `${sign}${val.toFixed(2)}%`;
  }
 
  return (
    <div className="card detail-card">
      <button onClick={onBack}>← Terug</button>
 
      {/* Header met coin info en prijs */}
      <div className="detail-header">
        <div className="detail-title-row">
          {coin.image && <img src={coin.image} alt={coin.name} width={52} height={52} className="detail-img" />}
          <div>
            <h2 className="detail-name">{coin.name}</h2>
            <span className="detail-symbol">{coin.symbol?.toUpperCase()} · #{coin.market_cap_rank}</span>
          </div>
        </div>
        <div className="detail-price-block">
          <p className="detail-price">{formatPrice(coin.current_price)}</p>
          <p className={`detail-change ${colorChange(change24h)}`}>{fmtPct(change24h)} (24u)</p>
        </div>
      </div>
 
      {/* Stat blokjes */}
      <div className="detail-stats">
        <div className="detail-stat">
          <span className="detail-stat-label">Marktcap</span>
          <span className="detail-stat-value">{formatPrice(coin.market_cap)}</span>
        </div>
        <div className="detail-stat">
          <span className="detail-stat-label">Volume 24u</span>
          <span className="detail-stat-value">{formatPrice(coin.total_volume)}</span>
        </div>
        <div className="detail-stat">
          <span className="detail-stat-label">7 dagen</span>
          <span className={`detail-stat-value ${colorChange(change7d)}`}>{fmtPct(change7d)}</span>
        </div>
        <div className="detail-stat">
          <span className="detail-stat-label">30 dagen</span>
          <span className={`detail-stat-value ${colorChange(change30d)}`}>{fmtPct(change30d)}</span>
        </div>
      </div>
 
      {/* Alle overige velden */}
      <p className="detail-all-label">Alle gegevens</p>
      <table className="detail-table">
        <tbody>
          {entries.map(([key, value]) => (
            <tr key={key}>
              <td className="detail-key">{key}</td>
              <td>{typeof value === "object" ? JSON.stringify(value) : String(value ?? "-")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
 
// Lijst van top 100 coins
function AllCoinsList({ coins, onSelect, favorites, onFavorite }) {
  const [search, setSearch] = useState("");
 
  const filtered = coins.filter((coin) =>
    coin.name.toLowerCase().includes(search.toLowerCase()) ||
    coin.symbol.toLowerCase().includes(search.toLowerCase())
  );
 
  return (
    <div className="card" style={{ marginTop: "20px" }}>
      <h2>Alle coins (top 100)</h2>
      <input
        className="search-input"
        type="text"
        placeholder="Zoek een coin..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <table className="coins-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Coin</th>
            <th>Prijs</th>
            <th>24u</th>
            <th>Fav</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((coin) => (
            <tr key={coin.id} onClick={() => onSelect(coin)} style={{ cursor: "pointer" }}>
              <td>{coin.market_cap_rank}</td>
              <td>
                <img src={coin.image} alt={coin.name} width={20} style={{ marginRight: 6, verticalAlign: "middle" }} />
                {coin.name} ({coin.symbol.toUpperCase()})
              </td>
              <td>{formatPrice(coin.current_price)}</td>
              <td className={coin.price_change_percentage_24h >= 0 ? "green" : "red"}>
                {formatChange(coin.price_change_percentage_24h)}
              </td>
              <td onClick={(e) => { e.stopPropagation(); onFavorite(coin.id); }}>
                {favorites.includes(coin.id) ? "⭐" : "☆"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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
  const [allCoins, setAllCoins] = useState([]);
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [favorites, setFavorites] = useState([]);
 
  function fetchPrices() {
    const ids = COINS.join(",");
    fetch(API_URL(ids))
      .then((res) => res.json())
      .then((data) => {
        setPrices(data);
 
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
 
  function fetchAllCoins() {
    fetch(ALL_COINS_URL)
      .then((res) => res.json())
      .then((data) => setAllCoins(data))
      .catch((err) => console.error("Fout bij ophalen alle coins:", err));
  }
 
  function toggleFavorite(coinId) {
    setFavorites((prev) =>
      prev.includes(coinId) ? prev.filter((f) => f !== coinId) : [...prev, coinId]
    );
  }
 
  useEffect(() => {
    fetchPrices();
    fetchAllCoins();
    const interval = setInterval(fetchPrices, 30000);
    return () => clearInterval(interval);
  }, []);
 
  // Als een coin is geselecteerd, toon de detailpagina
  if (selectedCoin) {
    return (
      <div className="container">
        <Header onRefresh={fetchPrices} lastUpdated={lastUpdated} />
        <CoinDetail coin={selectedCoin} onBack={() => setSelectedCoin(null)} />
      </div>
    );
  }
 
  return (
    <div className="container">
      <Header onRefresh={fetchPrices} lastUpdated={lastUpdated} />
 
      {favorites.length > 0 && (
        <div className="favorites-bar">
          ⭐ Favorieten: {favorites.join(", ")}
        </div>
      )}
 
      <h1>Market Overview</h1>
      <CoinList
        prices={prices}
        histories={histories}
        favorites={favorites}
        onFavorite={toggleFavorite}
      />
      <PriceChart allCoins={allCoins} />
      <AllCoinsList
        coins={allCoins}
        onSelect={setSelectedCoin}
        favorites={favorites}
        onFavorite={toggleFavorite}
      />
    </div>
  );
}
 
export default App;
 











