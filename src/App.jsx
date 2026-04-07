import { useState, useEffect } from "react";
import "./App.css";

import Header from "./components/layout/Header";
import CoinCard from "./components/coins/CoinCard";
import CoinDetail from "./components/coins/CoinDetail";
import AllCoinsList from "./components/coins/AllCoinsList";
import PieChart from "./components/charts/PieChart";

// URL voor de 3 coin prijzen (bitcoin, ethereum, solana) van de CoinGecko API
const API_URL = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=eur&include_24hr_change=true&x_cg_demo_api_key=CG-GELfdWVmVWAYUrdgU4pXoGfk";

// URL voor de top 100 coins gesorteerd op marktwaarde
const ALL_COINS_URL = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=eur&order=market_cap_desc&per_page=100&page=1&x_cg_demo_api_key=CG-GELfdWVmVWAYUrdgU4pXoGfk";

function App() {
  // useState = iets onthouden dat kan veranderen, React hertekent de pagina automatisch
  // syntax: const [waarde, setWaarde] = useState(beginwaarde)

  // huidige prijzen van de 3 coins
  const [bitcoinPrijs, setBitcoinPrijs] = useState(null);
  const [ethereumPrijs, setEthereumPrijs] = useState(null);
  const [solanaPrijs, setSolanaPrijs] = useState(null);

  // prijsgeschiedenis per coin (max 20), wordt gebruikt voor de lijngrafieken
  const [bitcoinHistory, setBitcoinHistory] = useState([]);
  const [ethereumHistory, setEthereumHistory] = useState([]);
  const [solanaHistory, setSolanaHistory] = useState([]);

  // tijdstip van de laatste update
  const [lastUpdated, setLastUpdated] = useState(null);

  // alle 100 coins voor de tabel en het taartdiagram
  const [allCoins, setAllCoins] = useState([]);

  // welke coin is aangeklikt? null = hoofdpagina tonen
  const [selectedCoin, setSelectedCoin] = useState(null);

  // lijst van favoriete coin-id's (bijv. ["bitcoin", "solana"])
  const [favorites, setFavorites] = useState([]);

  // haalt de 3 coin prijzen op van de API
  async function fetchPrices() {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();

      // prijzen opslaan in state
      setBitcoinPrijs(data.bitcoin);
      setEthereumPrijs(data.ethereum);
      setSolanaPrijs(data.solana);

      // nieuwe prijs toevoegen aan de geschiedenis, oudste verwijderen als er meer dan 20 zijn
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

      const tijd = new Date().toLocaleTimeString("nl-NL");
      setLastUpdated(tijd);

    } catch (error) {
      console.error("Er ging iets fout:", error);
    }
  }

  // haalt de top 100 coins op, wordt maar 1 keer uitgevoerd bij het laden
  async function fetchAllCoins() {
    try {
      const response = await fetch(ALL_COINS_URL);
      const data = await response.json();
      setAllCoins(data);
    } catch (error) {
      console.error("Er ging iets fout:", error);
    }
  }

  // voegt een coin toe aan favorieten of verwijdert hem
  function toggleFavorite(coinId) {
    if (favorites.includes(coinId)) {
      const nieuweLijst = favorites.filter((f) => f !== coinId);
      setFavorites(nieuweLijst);
    } else {
      setFavorites([...favorites, coinId]);
    }
  }

  // useEffect = iets uitvoeren buiten React om, zoals een API-aanroep of timer
  // de [] zorgt ervoor dat dit maar 1 keer draait bij het laden, niet bij elke render
  useEffect(() => {
    fetchPrices();
    fetchAllCoins();

    // elke 30 seconden de prijzen verversen
    const interval = setInterval(fetchPrices, 30000);

    // timer stoppen als de app sluit (cleanup)
    return () => clearInterval(interval);
  }, []);

  // als er een coin is aangeklikt, toon de detailpagina in plaats van de hoofdpagina
  if (selectedCoin) {
    return (
      <div className="max-w-4xl mx-auto my-10 p-8 rounded-2xl bg-gray-900 border border-gray-700 shadow-2xl">
        <Header onRefresh={fetchPrices} lastUpdated={lastUpdated} />
        <CoinDetail coin={selectedCoin} onBack={() => setSelectedCoin(null)} />
      </div>
    );
  }

  // hoofdpagina
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

      {/* de 3 coin kaarten, elke kaart krijgt zijn eigen data en geschiedenis mee */}
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
