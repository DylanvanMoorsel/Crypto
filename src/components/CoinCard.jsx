import LineChart from "./LineChart";

function PriceDisplay({ price }) {
  if (typeof price !== "number") {
    return <p className="text-2xl font-bold my-1">{price}</p>;
  }
  return <p className="text-2xl font-bold my-1">€{price.toLocaleString("nl-NL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>;
}

function ChangeDisplay({ change }) {
  if (change === null || change === undefined) {
    return null;
  }
  if (change >= 0) {
    return <p className="text-green-400">+{change.toFixed(2)}%</p>;
  }
  return <p className="text-red-400">{change.toFixed(2)}%</p>;
}

// generieke kaart voor een coin
function CoinCard({ id, label, icon, color, data, history, onFavorite, isFavorite }) {
  let price = "Laden...";
  let change = null;
  if (data) {
    price = data.eur;
    change = data.eur_24h_change;
  }
  return (
    <div className="bg-gray-800 rounded-xl p-5 border border-gray-700 hover:-translate-y-1 transition-transform">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-3xl">{icon}</span>
        <h3>{label}</h3>
        <button className="bg-transparent border-0 text-2xl cursor-pointer p-0 ml-auto" onClick={() => onFavorite(id)}>
          {isFavorite ? "⭐" : "☆"}
        </button>
      </div>
      <PriceDisplay price={price} />
      <ChangeDisplay change={change} />
      <LineChart color={color} history={history} />
    </div>
  );
}

export default CoinCard;
