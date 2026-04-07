import { useState } from "react";

// tabel met alle 100 coins, zoekbalk en favorieten
// coins, onSelect, favorites en onFavorite komen als props binnen vanuit App.jsx
function AllCoinsList({ coins, onSelect, favorites, onFavorite }) {
  // useState: zoekterm opslaan zodat de lijst live filtert terwijl je typt
  const [search, setSearch] = useState("");

  // coins filteren: alleen tonen als naam of symbool overeenkomt met de zoekterm
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

      {/* zoekveld: elke toetsaanslag update de search state */}
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
            // kleur groen of rood op basis van de 24u verandering
            let kleur = "text-red-400";
            if (coin.price_change_percentage_24h >= 0) {
              kleur = "text-green-400";
            }

            // lege of gevulde ster afhankelijk van favorieten
            let ster = "☆";
            if (favorites.includes(coin.id)) {
              ster = "⭐";
            }

            // verandering opmaken met + of - teken
            let verandering = "-";
            if (coin.price_change_percentage_24h !== null && coin.price_change_percentage_24h !== undefined) {
              verandering = coin.price_change_percentage_24h.toFixed(2) + "%";
              if (coin.price_change_percentage_24h >= 0) {
                verandering = "+" + verandering;
              }
            }

            return (
              // klikken op een rij roept onSelect aan → detailpagina opent
              <tr key={coin.id} className="cursor-pointer hover:bg-gray-700" onClick={() => onSelect(coin)}>
                <td className="p-2 border-b border-gray-700">{coin.market_cap_rank}</td>
                <td className="p-2 border-b border-gray-700">
                  <img src={coin.image} alt={coin.name} width={20} className="mr-1.5 align-middle inline" />
                  {coin.name} ({coin.symbol.toUpperCase()})
                </td>
                <td className="p-2 border-b border-gray-700">€{coin.current_price.toLocaleString("nl-NL")}</td>
                <td className={`p-2 border-b border-gray-700 ${kleur}`}>{verandering}</td>
                {/* stopPropagation voorkomt dat de rij-klik ook afgaat bij de ster */}
                <td className="p-2 border-b border-gray-700" onClick={(e) => { e.stopPropagation(); onFavorite(coin.id); }}>{ster}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default AllCoinsList;
