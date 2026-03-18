import React from 'react';
import './Coin.css';

/**
 * Presentational component for a single cryptocurrency coin.
 *
 * Props
 * - coin: object containing details returned from the API (name, symbol,
 *   current_price, image, etc.).
 *
 * Example usage:
 * ```jsx
 * <Coin coin={someCoinData} />
 * ```
 */
function Coin({ coin }) {
  if (!coin) {
    return null;
  }

  return (
    <div className="coin">
      <img
        className="coin__logo"
        src={coin.image}
        alt={`${coin.name} logo`}
        width={32}
        height={32}
      />
      <div className="coin__info">
        <h2 className="coin__name">{coin.name}</h2>
        <p className="coin__symbol">{coin.symbol.toUpperCase()}</p>
      </div>
      <div className="coin__price">
        ${coin.current_price.toLocaleString()}
      </div>
    </div>
  );
}

export default Coin;
