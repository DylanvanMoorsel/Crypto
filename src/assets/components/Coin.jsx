import React from 'react';

/**
 * Weergavecomponent voor een enkele cryptocurrency.
 *
 * Props:
 * - coin: object met gegevens van de API (name, symbol, current_price, image, etc.)
 *
 * Gebruik:
 * ```jsx
 * <Coin coin={coinData} />
 * ```
 */
function Coin({ coin }) {
  if (!coin) return null;

  return (
    <div className="flex items-center justify-between px-4 py-2 border-b border-[#e0e0e0]">
      <img
        className="mr-3"
        src={coin.image}
        alt={`${coin.name} logo`}
        width={32}
        height={32}
      />
      <div className="flex-1 flex flex-col">
        <h2 className="m-0 text-base font-semibold">{coin.name}</h2>
        <p className="m-0 text-sm text-gray-500">{coin.symbol.toUpperCase()}</p>
      </div>
      <div className="text-base font-medium">
        ${coin.current_price.toLocaleString()}
      </div>
    </div>
  );
}

export default Coin;
