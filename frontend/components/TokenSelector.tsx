import { Token } from '../lib/tokens';

interface TokenSelectorProps {
  tokens: Token[];
  selectedToken: string;
  onSelect: (address: string) => void;
  label: string;
}

export function TokenSelector({ tokens, selectedToken, onSelect, label }: TokenSelectorProps) {
  const selected = tokens.find(t => t.address === selectedToken);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>
      <div className="relative">
        <select
          value={selectedToken}
          onChange={(e) => onSelect(e.target.value)}
          className="block w-full px-4 py-3 pr-10 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white appearance-none"
        >
          {tokens.map((token) => (
            <option key={token.address} value={token.address}>
              {token.symbol} - {token.name}
            </option>
          ))}
        </select>

        {/* Token icon display */}
        {selected && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 pointer-events-none">
            <img
              src={selected.iconUrl}
              alt={selected.symbol}
              className="w-full h-full object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement!.textContent = selected.icon;
                e.currentTarget.parentElement!.className = 'absolute left-3 top-1/2 -translate-y-1/2 text-lg';
              }}
            />
          </div>
        )}

        {/* Adjust padding when icon is shown */}
        <style jsx>{`
          select {
            padding-left: ${selected ? '2.5rem' : '1rem'};
          }
        `}</style>
      </div>
    </div>
  );
}

// Token display component for cards
interface TokenDisplayProps {
  token: Token;
  amount?: string;
  showAddress?: boolean;
}

export function TokenDisplay({ token, amount, showAddress = false }: TokenDisplayProps) {
  return (
    <div className="flex items-center space-x-3">
      <div className="w-8 h-8 relative flex-shrink-0">
        <img
          src={token.iconUrl}
          alt={token.symbol}
          className="w-full h-full object-contain"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            e.currentTarget.parentElement!.textContent = token.icon;
            e.currentTarget.parentElement!.className = 'text-2xl flex items-center justify-center w-8 h-8';
          }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline space-x-2">
          <span className="font-semibold text-gray-900 dark:text-white">
            {token.symbol}
          </span>
          {amount && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {amount}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
          {token.name}
        </p>
        {showAddress && (
          <p className="text-xs font-mono text-gray-400 dark:text-gray-500 truncate">
            {token.address.slice(0, 6)}...{token.address.slice(-4)}
          </p>
        )}
      </div>
    </div>
  );
}
