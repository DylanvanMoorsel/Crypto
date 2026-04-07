import { useState, useEffect } from "react";
import "./App.css";

import Header from "./components/Header";
import CoinCard from "./components/CoinCard";
import PieChart from "./components/PieChart";
import CoinDetail from "./components/CoinDetail";
import AllCoinsList from "./components/AllCoinsList";

// api url voor de 3 coin prijzen
const API_URL = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=eur&include_24hr_change=true&x_cg_demo_api_key=CG-GELfdWVmVWAYUrdgU4pXoGfk";

// api url voor alle 100 coins
const ALL_COINS_URL = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=eur&order=market_cap_desc&per_page=100&page=1&x_cg_demo_api_key=CG-GELfdWVmVWAYUrdgU4pXoGfk";

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
        <CoinCard
          id="bitcoin" label="Bitcoin (BTC)" icon="₿" color="#f7931a"
          data={bitcoinPrijs} history={bitcoinHistory}
          onFavorite={toggleFavorite} isFavorite={favorites.includes("bitcoin")}
        />
        <CoinCard
          id="ethereum" label="Ethereum (ETH)" icon="Ξ" color="#627eea"
          data={ethereumPrijs} history={ethereumHistory}
          onFavorite={toggleFavorite} isFavorite={favorites.includes("ethereum")}
        />
        <CoinCard
          id="solana" label="Solana (SOL)" icon="◎" color="#9945ff"
          data={solanaPrijs} history={solanaHistory}
          onFavorite={toggleFavorite} isFavorite={favorites.includes("solana")}
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
