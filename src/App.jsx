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
    <div className="flex justify-between items-center mb-6">
      <div className="font-bold text-2xl text-indigo-400">CryptoDash</div>
      <div className="flex items-center gap-3">
        {/* tijdstip alleen tonen als het er is */}
        {lastUpdated && <span className="text-sm text-gray-400">Bijgewerkt om {lastUpdated}</span>}
        <button className="rounded-lg px-5 py-2 bg-indigo-500 border-0 text-white cursor-pointer hover:bg-indigo-600" onClick={onRefresh}>Vernieuwen</button>
      </div>
    </div>
  );
}

// prijs weergeven in euros
function PriceDisplay({ price }) {
  // als het nog geen getal is (bijv. "Laden...") gewoon de tekst tonen
  if (typeof price !== "number") {
    return <p className="text-2xl font-bold my-1">{price}</p>;
  }
  // anders netjes opmaken met 2 decimalen
  return <p className="text-2xl font-bold my-1">€{price.toLocaleString("nl-NL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>;
}

// verandering tonen in groen of rood
function ChangeDisplay({ change }) {
  // als er geen waarde is niks tonen
  if (change === null || change === undefined) {
    return null;
  }
  // positief = groen met + teken
  if (change >= 0) {
    return <p className="text-green-400">+{change.toFixed(2)}%</p>;
  }
  // negatief = rood
  return <p className="text-red-400">{change.toFixed(2)}%</p>;
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
    <div className="bg-gray-800 rounded-xl p-5 border border-gray-700 hover:-translate-y-1 transition-transform">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-3xl">₿</span>
        <h3>Bitcoin (BTC)</h3>
        {/* ster knop voor favorieten */}
        <button className="bg-transparent border-0 text-2xl cursor-pointer p-0 ml-auto" onClick={() => onFavorite("bitcoin")}>
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
    <div className="bg-gray-800 rounded-xl p-5 border border-gray-700 hover:-translate-y-1 transition-transform">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-3xl">Ξ</span>
        <h3>Ethereum (ETH)</h3>
        <button className="bg-transparent border-0 text-2xl cursor-pointer p-0 ml-auto" onClick={() => onFavorite("ethereum")}>
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
    <div className="bg-gray-800 rounded-xl p-5 border border-gray-700 hover:-translate-y-1 transition-transform">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-3xl">◎</span>
        <h3>Solana (SOL)</h3>
        <button className="bg-transparent border-0 text-2xl cursor-pointer p-0 ml-auto" onClick={() => onFavorite("solana")}>
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
    <div className="bg-gray-800 rounded-xl p-5 border border-gray-700 mt-5 max-w-sm mx-auto">
      <canvas ref={canvasRef} />
    </div>
  );
}

// detailpagina van een coin
function CoinDetail({ coin, onBack }) {
  if (!coin) {
    return null;
  }

  // geeft groen of rood terug op basis van positief of negatief
  function getColor(val) {
    if (val === null || val === undefined) {
      return "";
    }
    if (val >= 0) {
      return "text-green-400";
    }
    return "text-red-400";
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
    <div className="bg-gray-800 rounded-xl p-5 border border-gray-700 mt-5">
      {/* terug knop */}
      <button className="rounded-lg px-5 py-2 bg-indigo-500 border-0 text-white cursor-pointer hover:bg-indigo-600 flex items-center gap-1 mb-5" onClick={onBack}>← Terug</button>

      {/* naam en prijs bovenaan */}
      <div className="flex justify-between items-start mb-5 flex-wrap gap-3">
        <div className="flex items-center gap-4">
          {coin.image && <img src={coin.image} alt={coin.name} width={52} height={52} className="rounded-full" />}
          <div>
            <h2 className="m-0 text-2xl">{coin.name}</h2>
            <span className="text-sm text-gray-400">{coin.symbol.toUpperCase()} · #{coin.market_cap_rank}</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold m-0">€{coin.current_price.toLocaleString("nl-NL")}</p>
          <p className={`mt-1 text-base ${getColor(coin.price_change_percentage_24h)}`}>
            {getPct(coin.price_change_percentage_24h)} (24u)
          </p>
        </div>
      </div>

      {/* 4 stat blokjes */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-gray-700 rounded-xl p-3 flex flex-col gap-1 border border-gray-600">
          <span className="text-xs text-gray-400 uppercase">Marktcap</span>
          <span className="text-sm font-bold">€{coin.market_cap.toLocaleString("nl-NL")}</span>
        </div>
        <div className="bg-gray-700 rounded-xl p-3 flex flex-col gap-1 border border-gray-600">
          <span className="text-xs text-gray-400 uppercase">Volume 24u</span>
          <span className="text-sm font-bold">€{coin.total_volume.toLocaleString("nl-NL")}</span>
        </div>
        <div className="bg-gray-700 rounded-xl p-3 flex flex-col gap-1 border border-gray-600">
          <span className="text-xs text-gray-400 uppercase">7 dagen</span>
          <span className={`text-sm font-bold ${getColor(coin.price_change_percentage_7d)}`}>
            {getPct(coin.price_change_percentage_7d)}
          </span>
        </div>
        <div className="bg-gray-700 rounded-xl p-3 flex flex-col gap-1 border border-gray-600">
          <span className="text-xs text-gray-400 uppercase">30 dagen</span>
          <span className={`text-sm font-bold ${getColor(coin.price_change_percentage_30d)}`}>
            {getPct(coin.price_change_percentage_30d)}
          </span>
        </div>
      </div>

      {/* alle gegevens van de coin in een tabel */}
      <p className="text-xs text-gray-400 font-bold uppercase mb-2">Alle gegevens</p>
      <table className="w-full border-collapse text-xs">
        <tbody>
          <tr><td className="text-gray-400 w-48 font-bold p-1.5 border-b border-gray-700">naam</td><td className="p-1.5 border-b border-gray-700">{coin.name}</td></tr>
          <tr><td className="text-gray-400 w-48 font-bold p-1.5 border-b border-gray-700">symbool</td><td className="p-1.5 border-b border-gray-700">{coin.symbol}</td></tr>
          <tr><td className="text-gray-400 w-48 font-bold p-1.5 border-b border-gray-700">prijs</td><td className="p-1.5 border-b border-gray-700">€{coin.current_price.toLocaleString("nl-NL")}</td></tr>
          <tr><td className="text-gray-400 w-48 font-bold p-1.5 border-b border-gray-700">marktcap</td><td className="p-1.5 border-b border-gray-700">€{coin.market_cap.toLocaleString("nl-NL")}</td></tr>
          <tr><td className="text-gray-400 w-48 font-bold p-1.5 border-b border-gray-700">volume 24u</td><td className="p-1.5 border-b border-gray-700">€{coin.total_volume.toLocaleString("nl-NL")}</td></tr>
          <tr><td className="text-gray-400 w-48 font-bold p-1.5 border-b border-gray-700">hoogste prijs ooit</td><td className="p-1.5 border-b border-gray-700">€{coin.ath.toLocaleString("nl-NL")}</td></tr>
          <tr><td className="text-gray-400 w-48 font-bold p-1.5 border-b border-gray-700">laagste prijs ooit</td><td className="p-1.5 border-b border-gray-700">€{coin.atl.toLocaleString("nl-NL")}</td></tr>
          <tr><td className="text-gray-400 w-48 font-bold p-1.5 border-b border-gray-700">verandering 24u</td><td className={`p-1.5 border-b border-gray-700 ${getColor(coin.price_change_percentage_24h)}`}>{getPct(coin.price_change_percentage_24h)}</td></tr>
          <tr><td className="text-gray-400 w-48 font-bold p-1.5 border-b border-gray-700">verandering 7d</td><td className={`p-1.5 border-b border-gray-700 ${getColor(coin.price_change_percentage_7d)}`}>{getPct(coin.price_change_percentage_7d)}</td></tr>
          <tr><td className="text-gray-400 w-48 font-bold p-1.5 border-b border-gray-700">verandering 30d</td><td className={`p-1.5 border-b border-gray-700 ${getColor(coin.price_change_percentage_30d)}`}>{getPct(coin.price_change_percentage_30d)}</td></tr>
          <tr><td className="text-gray-400 w-48 font-bold p-1.5 border-b border-gray-700">circulerend aanbod</td><td className="p-1.5 border-b border-gray-700">{coin.circulating_supply}</td></tr>
          <tr><td className="text-gray-400 w-48 font-bold p-1.5 border-b border-gray-700">totaal aanbod</td><td className="p-1.5 border-b border-gray-700">{coin.total_supply}</td></tr>
          <tr><td className="text-gray-400 w-48 font-bold p-1.5 border-b border-gray-700">rang</td><td className="p-1.5 border-b border-gray-700">#{coin.market_cap_rank}</td></tr>
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
    <div className="bg-gray-800 rounded-xl p-5 border border-gray-700 mt-5">
      <h2>Alle coins (top 100)</h2>

      {/* zoekveld */}
      <input
        className="w-full p-2.5 rounded-lg border border-gray-600 bg-gray-700 text-white text-base mb-4 placeholder:text-gray-400"
        type="text"
        placeholder="Zoek een coin..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            <th className="text-left p-2 border-b border-gray-600 text-gray-400">#</th>
            <th className="text-left p-2 border-b border-gray-600 text-gray-400">Coin</th>
            <th className="text-left p-2 border-b border-gray-600 text-gray-400">Prijs</th>
            <th className="text-left p-2 border-b border-gray-600 text-gray-400">24u</th>
            <th className="text-left p-2 border-b border-gray-600 text-gray-400">Fav</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((coin) => {
            // kleur bepalen voor de verandering
            let kleur = "text-red-400";
            if (coin.price_change_percentage_24h >= 0) {
              kleur = "text-green-400";
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
              <tr key={coin.id} className="cursor-pointer hover:bg-gray-700" onClick={() => onSelect(coin)}>
                <td className="p-2 border-b border-gray-700">{coin.market_cap_rank}</td>
                <td className="p-2 border-b border-gray-700">
                  <img src={coin.image} alt={coin.name} width={20} className="mr-1.5 align-middle inline" />
                  {coin.name} ({coin.symbol.toUpperCase()})
                </td>
                <td className="p-2 border-b border-gray-700">€{coin.current_price.toLocaleString("nl-NL")}</td>
                <td className={`p-2 border-b border-gray-700 ${kleur}`}>{verandering}</td>
                {/* stopPropagation zodat de rij klik niet afgaat bij de ster */}
                <td className="p-2 border-b border-gray-700" onClick={(e) => { e.stopPropagation(); onFavorite(coin.id); }}>{ster}</td>
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
      <div className="max-w-4xl mx-auto my-10 p-8 rounded-2xl bg-gray-900 border border-gray-700 shadow-2xl">
        <Header onRefresh={fetchPrices} lastUpdated={lastUpdated} />
        <CoinDetail coin={selectedCoin} onBack={() => setSelectedCoin(null)} />
      </div>
    );
  }

  // normale hoofdpagina
  return (
    <div className="max-w-4xl mx-auto my-10 p-8 rounded-2xl bg-gray-900 border border-gray-700 shadow-2xl">
      <Header onRefresh={fetchPrices} lastUpdated={lastUpdated} />

      {/* favorieten balk, alleen tonen als er favorieten zijn */}
      {favorites.length > 0 && (
        <div className="bg-yellow-900/50 border border-yellow-600 rounded-lg px-4 py-2 mb-5 text-sm text-yellow-400">
          ⭐ Favorieten: {favorites.join(", ")}
        </div>
      )}

      <h1>Market Overview</h1>

      {/* de 3 coin kaarten */}
      <div className="flex flex-col gap-4">
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
