// react hooks importeren
import { useState, useEffect, useRef } from "react";
 
// chart.js voor de grafieken
import Chart from "chart.js/auto";
 
// css importeren
import "./App.css";
// api url voor de 3 coin prijzen
const API_URL = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=eur&include_24hr_change=true&x_cg_demo_api_key=CG-GELfdWVmVWAYUrdgU4pXoGfk";
 
// api url voor alle 100 coins
const ALL_COINS_URL = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=eur&order=market_cap_desc&per_page=100&page=1&x_cg_demo_api_key=CG-GELfdWVmVWAYUrdgU4pXoGfk";
 
// header bovenaan met de naam en vernieuw knop
function Header({ onRefresh, lastUpdated }) {
  return (
    <div className="header">
      <div className="logo">CryptoDash</div>
      <div className="header-right">
        {/* tijdstip alleen tonen als het er is */}
        {lastUpdated && <span className="last-updated">Bijgewerkt om {lastUpdated}</span>}
        <button onClick={onRefresh}>Vernieuwen</button>
      </div>
    </div>
  );
}
 
// prijs weergeven in euros
function PriceDisplay({ price }) {
  // als het nog geen getal is (bijv. "Laden...") gewoon de tekst tonen
  if (typeof price !== "number") {
    return <p className="price">{price}</p>;
  }
  // anders netjes opmaken met 2 decimalen
  return <p className="price">€{price.toLocaleString("nl-NL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>;
}
 
// verandering tonen in groen of rood
function ChangeDisplay({ change }) {
  // als er geen waarde is niks tonen
  if (change === null || change === undefined) {
    return null;
  }
  // positief = groen met + teken
  if (change >= 0) {
    return <p className="green">+{change.toFixed(2)}%</p>;
  }
  // negatief = rood
  return <p className="red">{change.toFixed(2)}%</p>;
}
 
// lijn grafiek van de prijsgeschiedenis
function LineChart({ color, history }) {
  // verwijzing naar het canvas element waar de grafiek op komt
  const canvasRef = useRef(null);
  // de grafiek zelf opslaan zodat we hem later kunnen verwijderen
  const chartRef = useRef(null);
 
  // grafiek opnieuw tekenen als de history verandert
  useEffect(() => {
    // minimaal 2 punten nodig voor een lijn
    if (history.length < 2) {
      return;
    }
 
    // oude grafiek verwijderen anders stapelen ze op
    if (chartRef.current) {
      chartRef.current.destroy();
    }
 
    // labels voor de x-as (1, 2, 3, ...)
    const labels = [];
    for (let i = 0; i < history.length; i++) {
      labels.push(i + 1);
    }
 
    // nieuwe grafiek aanmaken
    chartRef.current = new Chart(canvasRef.current, {
      type: "line",
      data: {
        labels: labels,
        datasets: [{
          backgroundColor: color + "33",
          borderColor: color,
          data: history,
          tension: 0.4,
          pointRadius: 3,
        }],
      },
      options: {
        plugins: { legend: { display: false } },
        scales: {
          x: { display: false },
          y: {
            ticks: { color: "#aaa", callback: (val) => "€" + val.toLocaleString("nl-NL") },
            grid: { color: "rgba(255,255,255,0.05)" },
          },
        },
      },
    });
 
    // grafiek opruimen als het component verdwijnt
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [history]);
 
  return <canvas ref={canvasRef} height={80} />;
}
 
// kaart voor bitcoin
function BitcoinCard({ data, history, onFavorite, isFavorite }) {
  let price = "Laden...";
  let change = null;
  // data invullen als de api klaar is
  if (data) {
    price = data.eur;
    change = data.eur_24h_change;
  }
  return (
    <div className="card">
      <div className="card-header">
        <span className="coin-icon">₿</span>
        <h3>Bitcoin (BTC)</h3>
        {/* ster knop voor favorieten */}
        <button className="fav-btn" onClick={() => onFavorite("bitcoin")}>
          {isFavorite ? "⭐" : "☆"}
        </button>
      </div>
      <PriceDisplay price={price} />
      <ChangeDisplay change={change} />
      <LineChart color="#f7931a" history={history} />
    </div>
  );
}
 
// kaart voor ethereum
function EthereumCard({ data, history, onFavorite, isFavorite }) {
  let price = "Laden...";
  let change = null;
  if (data) {
    price = data.eur;
    change = data.eur_24h_change;
  }
  return (
    <div className="card">
      <div className="card-header">
        <span className="coin-icon">Ξ</span>
        <h3>Ethereum (ETH)</h3>
        <button className="fav-btn" onClick={() => onFavorite("ethereum")}>
          {isFavorite ? "⭐" : "☆"}
        </button>
      </div>
      <PriceDisplay price={price} />
      <ChangeDisplay change={change} />
      <LineChart color="#627eea" history={history} />
    </div>
  );
}
 
// kaart voor solana
function SolanaCard({ data, history, onFavorite, isFavorite }) {
  let price = "Laden...";
  let change = null;
  if (data) {
    price = data.eur;
    change = data.eur_24h_change;
  }
  return (
    <div className="card">
      <div className="card-header">
        <span className="coin-icon">◎</span>
        <h3>Solana (SOL)</h3>
        <button className="fav-btn" onClick={() => onFavorite("solana")}>
          {isFavorite ? "⭐" : "☆"}
        </button>
      </div>
      <PriceDisplay price={price} />
      <ChangeDisplay change={change} />
      <LineChart color="#9945ff" history={history} />
    </div>
  );
}
 
// taart diagram van de top 10 coins op marktwaarde
function PieChart({ allCoins }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
 
  useEffect(() => {
    // stoppen als er nog geen data is
    if (allCoins.length === 0) {
      return;
    }
 
    // oude grafiek verwijderen
    if (chartRef.current) {
      chartRef.current.destroy();
    }
 
    const namen = [];
    const waarden = [];
    const kleuren = ["#f7931a", "#627eea", "#9945ff", "#00d4aa", "#e84142", "#2775ca", "#f0b90b", "#e6007a", "#16c784", "#ff6b35"];
 
    // eerste 10 coins pakken
    for (let i = 0; i < 10; i++) {
      namen.push(allCoins[i].name);
      waarden.push(allCoins[i].market_cap);
    }
 
    // grafiek aanmaken
    chartRef.current = new Chart(canvasRef.current, {
      type: "pie",
      data: {
        labels: namen,
        datasets: [{ backgroundColor: kleuren, data: waarden }],
      },
      options: {
        plugins: {
          title: { display: true, text: "Marktaandeel top 10 coins", color: "#ffffff", font: { size: 16 } },
          legend: { labels: { color: "#ffffff" } },
          // tooltip netjes opmaken
          tooltip: {
            callbacks: {
              label: (item) => {
                const waarde = item.raw;
                return " €" + waarde.toLocaleString("nl-NL", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
              }
            }
          }
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
      <canvas ref={canvasRef} />
    </div>
  );
}
 
// detailpagina van een coin
function CoinDetail({ coin, onBack }) {
  if (!coin) {
    return null;
  }
 
  // geeft "green" of "red" terug op basis van positief of negatief
  function getColor(val) {
    if (val === null || val === undefined) {
      return "";
    }
    if (val >= 0) {
      return "green";
    }
    return "red";
  }
 
  // maakt van een getal een percentage met + of - teken
  function getPct(val) {
    if (val === null || val === undefined) {
      return "-";
    }
    if (val >= 0) {
      return "+" + val.toFixed(2) + "%";
    }
    return val.toFixed(2) + "%";
  }
 
  return (
    <div className="card detail-card">
      {/* terug knop */}
      <button onClick={onBack}>← Terug</button>
 
      {/* naam en prijs bovenaan */}
      <div className="detail-header">
        <div className="detail-title-row">
          {coin.image && <img src={coin.image} alt={coin.name} width={52} height={52} className="detail-img" />}
          <div>
            <h2 className="detail-name">{coin.name}</h2>
            <span className="detail-symbol">{coin.symbol.toUpperCase()} · #{coin.market_cap_rank}</span>
          </div>
        </div>
        <div className="detail-price-block">
          <p className="detail-price">€{coin.current_price.toLocaleString("nl-NL")}</p>
          <p className={"detail-change " + getColor(coin.price_change_percentage_24h)}>
            {getPct(coin.price_change_percentage_24h)} (24u)
          </p>
        </div>
      </div>
 
      {/* 4 stat blokjes */}
      <div className="detail-stats">
        <div className="detail-stat">
          <span className="detail-stat-label">Marktcap</span>
          <span className="detail-stat-value">€{coin.market_cap.toLocaleString("nl-NL")}</span>
        </div>
        <div className="detail-stat">
          <span className="detail-stat-label">Volume 24u</span>
          <span className="detail-stat-value">€{coin.total_volume.toLocaleString("nl-NL")}</span>
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
 
      {/* alle gegevens van de coin in een tabel, id wordt niet getoond */}
      <p className="detail-all-label">Alle gegevens</p>
      <table className="detail-table">
        <tbody>
          <tr><td className="detail-key">naam</td><td>{coin.name}</td></tr>
          <tr><td className="detail-key">symbool</td><td>{coin.symbol}</td></tr>
          <tr><td className="detail-key">prijs</td><td>€{coin.current_price.toLocaleString("nl-NL")}</td></tr>
          <tr><td className="detail-key">marktcap</td><td>€{coin.market_cap.toLocaleString("nl-NL")}</td></tr>
          <tr><td className="detail-key">volume 24u</td><td>€{coin.total_volume.toLocaleString("nl-NL")}</td></tr>
          <tr><td className="detail-key">hoogste prijs ooit</td><td>€{coin.ath.toLocaleString("nl-NL")}</td></tr>
          <tr><td className="detail-key">laagste prijs ooit</td><td>€{coin.atl.toLocaleString("nl-NL")}</td></tr>
          <tr><td className="detail-key">verandering 24u</td><td className={getColor(coin.price_change_percentage_24h)}>{getPct(coin.price_change_percentage_24h)}</td></tr>
          <tr><td className="detail-key">verandering 7d</td><td className={getColor(coin.price_change_percentage_7d)}>{getPct(coin.price_change_percentage_7d)}</td></tr>
          <tr><td className="detail-key">verandering 30d</td><td className={getColor(coin.price_change_percentage_30d)}>{getPct(coin.price_change_percentage_30d)}</td></tr>
          <tr><td className="detail-key">circulerend aanbod</td><td>{coin.circulating_supply}</td></tr>
          <tr><td className="detail-key">totaal aanbod</td><td>{coin.total_supply}</td></tr>
          <tr><td className="detail-key">rang</td><td>#{coin.market_cap_rank}</td></tr>
        </tbody>
      </table>
    </div>
  );
}
 
// lijst van alle 100 coins met zoekbalk
function AllCoinsList({ coins, onSelect, favorites, onFavorite }) {
  // zoekterm opslaan
  const [search, setSearch] = useState("");
 
  // coins filteren op zoekterm
  const filtered = [];
  for (let i = 0; i < coins.length; i++) {
    const coin = coins[i];
    const naamMatch = coin.name.toLowerCase().includes(search.toLowerCase());
    const symboolMatch = coin.symbol.toLowerCase().includes(search.toLowerCase());
    if (naamMatch || symboolMatch) {
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
          {filtered.map((coin) => {
            // kleur bepalen voor de verandering
            let kleur = "red";
            if (coin.price_change_percentage_24h >= 0) {
              kleur = "green";
            }
 
            // ster bepalen voor favorieten
            let ster = "☆";
            if (favorites.includes(coin.id)) {
              ster = "⭐";
            }
 
            // verandering opmaken, sommige coins hebben geen waarde
            let verandering = "-";
            if (coin.price_change_percentage_24h !== null && coin.price_change_percentage_24h !== undefined) {
              verandering = coin.price_change_percentage_24h.toFixed(2) + "%";
              if (coin.price_change_percentage_24h >= 0) {
                verandering = "+" + verandering;
              }
            }
 
            return (
              // klikken op een rij opent de detailpagina
              <tr key={coin.id} onClick={() => onSelect(coin)} style={{ cursor: "pointer" }}>
                <td>{coin.market_cap_rank}</td>
                <td>
                  <img src={coin.image} alt={coin.name} width={20} style={{ marginRight: 6, verticalAlign: "middle" }} />
                  {coin.name} ({coin.symbol.toUpperCase()})
                </td>
                <td>€{coin.current_price.toLocaleString("nl-NL")}</td>
                <td className={kleur}>{verandering}</td>
                {/* stopPropagation zodat de rij klik niet afgaat bij de ster */}
                <td onClick={(e) => { e.stopPropagation(); onFavorite(coin.id); }}>{ster}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
 
// hoofd component waar alles samenkomt
function App() {
  // prijzen van de 3 coins
  const [bitcoinPrijs, setBitcoinPrijs] = useState(null);
  const [ethereumPrijs, setEthereumPrijs] = useState(null);
  const [solanaPrijs, setSolanaPrijs] = useState(null);
 
  // prijsgeschiedenis voor de lijn grafieken
  const [bitcoinHistory, setBitcoinHistory] = useState([]);
  const [ethereumHistory, setEthereumHistory] = useState([]);
  const [solanaHistory, setSolanaHistory] = useState([]);
 
  // tijdstip van laatste update
  const [lastUpdated, setLastUpdated] = useState(null);
  // alle 100 coins
  const [allCoins, setAllCoins] = useState([]);
  // welke coin is aangeklikt
  const [selectedCoin, setSelectedCoin] = useState(null);
  // favorieten lijst
  const [favorites, setFavorites] = useState([]);
 
  // prijzen ophalen van de api
  async function fetchPrices() {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
 
      // prijzen opslaan
      setBitcoinPrijs(data.bitcoin);
      setEthereumPrijs(data.ethereum);
      setSolanaPrijs(data.solana);
 
      // nieuwe prijs toevoegen aan geschiedenis, max 20 bewaren
      setBitcoinHistory((prev) => {
        const nieuw = [...prev, data.bitcoin.eur];
        if (nieuw.length > 20) nieuw.shift();
        return nieuw;
      });
 
      setEthereumHistory((prev) => {
        const nieuw = [...prev, data.ethereum.eur];
        if (nieuw.length > 20) nieuw.shift();
        return nieuw;
      });
 
      setSolanaHistory((prev) => {
        const nieuw = [...prev, data.solana.eur];
        if (nieuw.length > 20) nieuw.shift();
        return nieuw;
      });
 
      // tijdstip opslaan
      const tijd = new Date().toLocaleTimeString("nl-NL");
      setLastUpdated(tijd);
 
    } catch (error) {
      console.error("Er ging iets fout:", error);
    }
  }
 
  // alle 100 coins ophalen
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
 
  // 1 keer uitvoeren bij het laden, daarna elke 30 seconden verversen
  useEffect(() => {
    fetchPrices();
    fetchAllCoins();
    const interval = setInterval(fetchPrices, 30000);
    return () => clearInterval(interval);
  }, []);
 
  // detailpagina tonen als een coin is aangeklikt
  if (selectedCoin) {
    return (
      <div className="container">
        <Header onRefresh={fetchPrices} lastUpdated={lastUpdated} />
        <CoinDetail coin={selectedCoin} onBack={() => setSelectedCoin(null)} />
      </div>
    );
  }
 
  // normale hoofdpagina
  return (
    <div className="container">
      <Header onRefresh={fetchPrices} lastUpdated={lastUpdated} />
 
      {/* favorieten balk, alleen tonen als er favorieten zijn */}
      {favorites.length > 0 && (
        <div className="favorites-bar">
          ⭐ Favorieten: {favorites.join(", ")}
        </div>
      )}
 
      <h1>Market Overview</h1>
 
      {/* de 3 coin kaarten */}
      <div className="coin-list">
        <BitcoinCard
          data={bitcoinPrijs}
          history={bitcoinHistory}
          onFavorite={toggleFavorite}
          isFavorite={favorites.includes("bitcoin")}
        />
        <EthereumCard
          data={ethereumPrijs}
          history={ethereumHistory}
          onFavorite={toggleFavorite}
          isFavorite={favorites.includes("ethereum")}
        />
        <SolanaCard
          data={solanaPrijs}
          history={solanaHistory}
          onFavorite={toggleFavorite}
          isFavorite={favorites.includes("solana")}
        />
      </div>
 
      {/* taart diagram */}
      <PieChart allCoins={allCoins} />
 
      {/* lijst van alle coins */}
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