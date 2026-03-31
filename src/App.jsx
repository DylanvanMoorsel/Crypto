import { useState, useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import "./App.css";
 
// de 3 coins die ik gebruik
const COINS = ["bitcoin", "ethereum", "solana"];
 
// api url voor de prijzen
const API_URL = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=eur&include_24hr_change=true&x_cg_demo_api_key=CG-GELfdWVmVWAYUrdgU4pXoGfk";
 
// api url voor alle 100 coins
const ALL_COINS_URL = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=eur&order=market_cap_desc&per_page=100&page=1&x_cg_demo_api_key=CG-GELfdWVmVWAYUrdgU4pXoGfk";
 
// info per coin
const COIN_META = {
  bitcoin:  { label: "Bitcoin",  symbol: "BTC", icon: "₿", color: "#f7931a" },
  ethereum: { label: "Ethereum", symbol: "ETH", icon: "Ξ", color: "#627eea" },
  solana:   { label: "Solana",   symbol: "SOL", icon: "◎", color: "#9945ff" },
};
 
// kleuren voor de pie chart
const TOP10_COLORS = ["#f7931a", "#627eea", "#9945ff", "#00d4aa", "#e84142", "#2775ca", "#f0b90b", "#e6007a", "#16c784", "#ff6b35"];
 
// prijs naar euros
function formatPrice(price) {
  if (typeof price !== "number") {
    return price;
  }
  return "€" + price.toLocaleString("nl-NL");
}
 
// verandering naar procent
function formatChange(change) {
  if (typeof change !== "number") {
    return null;
  }
  if (change >= 0) {
    return "+" + change.toFixed(2) + "%";
  } else {
    return change.toFixed(2) + "%";
  }
}
 
// header bovenaan
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
 
// icoontje van een coin
function CoinIcon({ icon }) {
  return <span className="coin-icon">{icon}</span>;
}
 
// prijs weergeven
function PriceDisplay({ price }) {
  return <p className="price">{formatPrice(price)}</p>;
}
 
// verandering in groen of rood
function ChangeDisplay({ change }) {
  if (change === null || change === undefined) {
    return null;
  }
 
  if (change >= 0) {
    return <p className="green">{formatChange(change)}</p>;
  } else {
    return <p className="red">{formatChange(change)}</p>;
  }
}
 
// lijn grafiek per coin
function LineChart({ coinId, history }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const meta = COIN_META[coinId];
 
  useEffect(() => {
    if (history.length < 2) {
      return;
    }
 
    // oude chart verwijderen
    if (chartRef.current) {
      chartRef.current.destroy();
    }
 
    // labels voor de x-as
    const labels = [];
    for (let i = 0; i < history.length; i++) {
      labels.push(i + 1);
    }
 
    // nieuwe chart aanmaken
    chartRef.current = new Chart(canvasRef.current, {
      type: "line",
      data: {
        labels: labels,
        datasets: [{
          label: meta.label,
          backgroundColor: meta.color + "33",
          borderColor: meta.color,
          data: history,
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
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [history]);
 
  return <canvas ref={canvasRef} height={80} />;
}
 
// kaart voor 1 coin
function CoinCard({ coinId, data, history, onFavorite, isFavorite }) {
  const meta = COIN_META[coinId];
 
  let price = "Laden...";
  let change = null;
 
  if (data) {
    price = data.eur;
    change = data.eur_24h_change;
  }
 
  let starIcon = "☆";
  if (isFavorite) {
    starIcon = "⭐";
  }
 
  return (
    <div className="card">
      <div className="card-header">
        <CoinIcon icon={meta.icon} />
        <div>
          <h3>{meta.label} ({meta.symbol})</h3>
        </div>
        <button className="fav-btn" onClick={() => onFavorite(coinId)}>
          {starIcon}
        </button>
      </div>
      <PriceDisplay price={price} />
      <ChangeDisplay change={change} />
      <LineChart coinId={coinId} history={history} />
    </div>
  );
}
 
// alle 3 coin kaarten
function CoinList({ prices, histories, favorites, onFavorite }) {
  return (
    <div className="coin-list">
      {COINS.map((coin) => (
        <CoinCard
          key={coin}
          coinId={coin}
          data={prices[coin]}
          history={histories[coin]}
          onFavorite={onFavorite}
          isFavorite={favorites.includes(coin)}
        />
      ))}
    </div>
  );
}
 
// pie chart van de top 10
function PriceChart({ allCoins }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
 
  useEffect(() => {
    if (allCoins.length === 0) {
      return;
    }
 
    if (chartRef.current) {
      chartRef.current.destroy();
    }
 
    // eerste 10 pakken
    const top10 = allCoins.slice(0, 10);
 
    const namen = [];
    const marktwaarden = [];
 
    for (let i = 0; i < top10.length; i++) {
      namen.push(top10[i].name);
      marktwaarden.push(top10[i].market_cap);
    }
 
    chartRef.current = new Chart(canvasRef.current, {
      type: "pie",
      data: {
        labels: namen,
        datasets: [{
          backgroundColor: TOP10_COLORS,
          data: marktwaarden,
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
 
// detailpagina van een coin
function CoinDetail({ coin, onBack }) {
  if (!coin) {
    return null;
  }
 
  // kleur bepalen voor de verandering
  function getColor(val) {
    if (val === null || val === undefined) {
      return "";
    }
    if (val >= 0) {
      return "green";
    } else {
      return "red";
    }
  }
 
  // percentage opmaken
  function getPct(val) {
    if (val === null || val === undefined) {
      return "-";
    }
    if (val >= 0) {
      return "+" + val.toFixed(2) + "%";
    } else {
      return val.toFixed(2) + "%";
    }
  }
 
  return (
    <div className="card detail-card">
      <button onClick={onBack}>← Terug</button>
 
      {/* naam en prijs */}
      <div className="detail-header">
        <div className="detail-title-row">
          {coin.image && <img src={coin.image} alt={coin.name} width={52} height={52} className="detail-img" />}
          <div>
            <h2 className="detail-name">{coin.name}</h2>
            <span className="detail-symbol">{coin.symbol.toUpperCase()} · #{coin.market_cap_rank}</span>
          </div>
        </div>
        <div className="detail-price-block">
          <p className="detail-price">{formatPrice(coin.current_price)}</p>
          <p className={"detail-change " + getColor(coin.price_change_percentage_24h)}>
            {getPct(coin.price_change_percentage_24h)} (24u)
          </p>
        </div>
      </div>
 
      {/* stat blokjes */}
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
          <span className={"detail-stat-value " + getColor(coin.price_change_percentage_7d)}>
            {getPct(coin.price_change_percentage_7d)}
          </span>
        </div>
        <div className="detail-stat">
          <span className="detail-stat-label">30 dagen</span>
          <span className={"detail-stat-value " + getColor(coin.price_change_percentage_30d)}>
            {getPct(coin.price_change_percentage_30d)}
          </span>
        </div>
      </div>
 
      {/* alle data */}
      <p className="detail-all-label">Alle gegevens</p>
      <table className="detail-table">
        <tbody>
          <tr><td className="detail-key">naam</td><td>{coin.name}</td></tr>
          <tr><td className="detail-key">symbool</td><td>{coin.symbol}</td></tr>
          <tr><td className="detail-key">prijs</td><td>{formatPrice(coin.current_price)}</td></tr>
          <tr><td className="detail-key">marktcap</td><td>{formatPrice(coin.market_cap)}</td></tr>
          <tr><td className="detail-key">volume 24u</td><td>{formatPrice(coin.total_volume)}</td></tr>
          <tr><td className="detail-key">hoogste prijs ooit</td><td>{formatPrice(coin.ath)}</td></tr>
          <tr><td className="detail-key">laagste prijs ooit</td><td>{formatPrice(coin.atl)}</td></tr>
          <tr><td className="detail-key">verandering 24u</td><td className={getColor(coin.price_change_percentage_24h)}>{getPct(coin.price_change_percentage_24h)}</td></tr>
          <tr><td className="detail-key">verandering 7d</td><td className={getColor(coin.price_change_percentage_7d)}>{getPct(coin.price_change_percentage_7d)}</td></tr>
          <tr><td className="detail-key">verandering 30d</td><td className={getColor(coin.price_change_percentage_30d)}>{getPct(coin.price_change_percentage_30d)}</td></tr>
          <tr><td className="detail-key">circulerend aanbod</td><td>{coin.circulating_supply}</td></tr>
          <tr><td className="detail-key">totaal aanbod</td><td>{coin.total_supply}</td></tr>
          <tr><td className="detail-key">marktcap rang</td><td>#{coin.market_cap_rank}</td></tr>
        </tbody>
      </table>
    </div>
  );
}
 
// lijst van alle 100 coins
function AllCoinsList({ coins, onSelect, favorites, onFavorite }) {
  const [search, setSearch] = useState("");
 
  // zoeken in de lijst
  function handleSearch(e) {
    setSearch(e.target.value);
  }
 
  // gefilterde lijst maken
  const filtered = [];
  for (let i = 0; i < coins.length; i++) {
    const coin = coins[i];
    if (coin.name.toLowerCase().includes(search.toLowerCase()) || coin.symbol.toLowerCase().includes(search.toLowerCase())) {
      filtered.push(coin);
    }
  }
 
  return (
    <div className="card" style={{ marginTop: "20px" }}>
      <h2>Alle coins (top 100)</h2>
 
      {/* zoekveld */}
      <input
        className="search-input"
        type="text"
        placeholder="Zoek een coin..."
        value={search}
        onChange={handleSearch}
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
          {filtered.map((coin) => {
            let veranderingKleur = "red";
            if (coin.price_change_percentage_24h >= 0) {
              veranderingKleur = "green";
            }
 
            let ster = "☆";
            if (favorites.includes(coin.id)) {
              ster = "⭐";
            }
 
            return (
              <tr key={coin.id} onClick={() => onSelect(coin)} style={{ cursor: "pointer" }}>
                <td>{coin.market_cap_rank}</td>
                <td>
                  <img src={coin.image} alt={coin.name} width={20} style={{ marginRight: 6, verticalAlign: "middle" }} />
                  {coin.name} ({coin.symbol.toUpperCase()})
                </td>
                <td>{formatPrice(coin.current_price)}</td>
                <td className={veranderingKleur}>
                  {formatChange(coin.price_change_percentage_24h)}
                </td>
                <td onClick={(e) => { e.stopPropagation(); onFavorite(coin.id); }}>
                  {ster}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
 
// hoofd component
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
 
  // prijzen ophalen
  async function fetchPrices() {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setPrices(data);
 
      // geschiedenis bijwerken
      const newHistories = {
        bitcoin: [...histories.bitcoin],
        ethereum: [...histories.ethereum],
        solana: [...histories.solana],
      };
 
      for (let i = 0; i < COINS.length; i++) {
        const coin = COINS[i];
        const newPrice = data[coin].eur;
        newHistories[coin].push(newPrice);
 
        // max 20 prijzen bewaren
        if (newHistories[coin].length > 20) {
          newHistories[coin].shift();
        }
      }
 
      setHistories(newHistories);
 
      const tijd = new Date().toLocaleTimeString("nl-NL");
      setLastUpdated(tijd);
 
    } catch (error) {
      console.error("Er ging iets fout:", error);
    }
  }
 
  // alle coins ophalen
  async function fetchAllCoins() {
    try {
      const response = await fetch(ALL_COINS_URL);
      const data = await response.json();
      setAllCoins(data);
    } catch (error) {
      console.error("Er ging iets fout:", error);
    }
  }
 
  // favoriet toevoegen of verwijderen
  function toggleFavorite(coinId) {
    if (favorites.includes(coinId)) {
      // verwijderen uit favorieten
      const nieuweLijst = favorites.filter((f) => f !== coinId);
      setFavorites(nieuweLijst);
    } else {
      // toevoegen aan favorieten
      setFavorites([...favorites, coinId]);
    }
  }
 
  // 1 keer uitvoeren bij het laden
  useEffect(() => {
    fetchPrices();
    fetchAllCoins();
 
    // elke 30 seconden verversen
    const interval = setInterval(fetchPrices, 30000);
    return () => clearInterval(interval);
  }, []);
 
  // detailpagina tonen
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
 
      {/* favorieten balk */}
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
 