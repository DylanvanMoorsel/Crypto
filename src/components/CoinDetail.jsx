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

    </div>
  );
}

export default CoinDetail;
