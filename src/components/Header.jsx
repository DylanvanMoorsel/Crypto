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

export default Header;
