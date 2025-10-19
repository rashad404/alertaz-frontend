"use client";

import React, { useState } from 'react';
import { WizardData } from '../AlertCreationWizard';

interface AssetSelectionProps {
  data: WizardData;
  onUpdate: (data: Partial<WizardData>) => void;
}

const AssetSelection: React.FC<AssetSelectionProps> = ({ data, onUpdate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [customAsset, setCustomAsset] = useState('');
  const [useCustom, setUseCustom] = useState(false);

  if (!data.alertType) {
    return <div>Please select a service first.</div>;
  }

  const assets = data.alertType.assets || {};
  const assetEntries = Object.entries(assets).filter(([code, name]) =>
    code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAssetSelect = (assetCode: string) => {
    onUpdate({ asset: assetCode });
    setUseCustom(false);
  };

  const handleCustomAsset = () => {
    if (customAsset.trim()) {
      onUpdate({ asset: customAsset.trim() });
      setUseCustom(true);
    }
  };

  // Special handling for services that don't need asset selection
  const needsAssetSelection = ['crypto', 'stock', 'currency'].includes(data.alertType.slug);

  if (!needsAssetSelection) {
    // For services like weather or website monitoring
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {data.alertType.slug === 'weather' ? 'Enter Location' : 'Enter URL or Details'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {data.alertType.slug === 'weather'
              ? 'Enter the location you want to monitor'
              : 'Enter the URL or identifier to monitor'
            }
          </p>
        </div>

        <div>
          <input
            type="text"
            value={data.asset || ''}
            onChange={(e) => onUpdate({ asset: e.target.value })}
            placeholder={
              data.alertType.slug === 'weather'
                ? 'e.g., Baku, Azerbaijan'
                : 'e.g., https://example.com'
            }
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        {data.asset && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>Monitoring:</strong> {data.asset}
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Select {data.alertType.slug === 'crypto' ? 'Cryptocurrency' : data.alertType.slug === 'stock' ? 'Stock' : 'Currency Pair'}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Choose the specific {data.alertType.slug} you want to monitor.
        </p>
      </div>

      {/* Search bar */}
      <div className="mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>

      {/* Predefined assets */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-64 overflow-y-auto">
        {assetEntries.map(([code, name]) => (
          <button
            key={code}
            onClick={() => handleAssetSelect(code)}
            className={`
              p-3 rounded-lg border text-left transition-all
              ${data.asset === code && !useCustom
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
              }
            `}
          >
            <div className="font-semibold text-gray-900 dark:text-white">{code}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">{name}</div>
          </button>
        ))}
      </div>

      {/* Custom asset option */}
      <div className="mt-6 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          Don't see what you're looking for? Enter a custom asset:
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={customAsset}
            onChange={(e) => setCustomAsset(e.target.value)}
            placeholder="e.g., SHIB, GME, EUR/USD"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <button
            onClick={handleCustomAsset}
            disabled={!customAsset.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Use Custom
          </button>
        </div>
      </div>

      {data.asset && (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong>Selected Asset:</strong> {data.asset}
            {useCustom && <span className="ml-2 text-xs text-blue-600">(Custom)</span>}
          </p>
        </div>
      )}
    </div>
  );
};

export default AssetSelection;