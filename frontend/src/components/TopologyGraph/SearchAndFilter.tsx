import React, { useState } from 'react';
import { NodeData } from '../../types/kubernetes';

interface SearchAndFilterProps {
  onSearch: (query: string) => void;
  onFilterChange: (filters: {
    types: string[];
    namespaces: string[];
    labels: string[];
  }) => void;
  availableNamespaces: string[];
  availableLabels: string[];
}

export const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  onSearch,
  onFilterChange,
  availableNamespaces,
  availableLabels,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedNamespaces, setSelectedNamespaces] = useState<string[]>([]);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);

  const resourceTypes = ['Pod', 'Service', 'Ingress', 'Namespace'];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query);
  };

  const handleTypeChange = (type: string) => {
    const newTypes = selectedTypes.includes(type)
      ? selectedTypes.filter((t) => t !== type)
      : [...selectedTypes, type];
    setSelectedTypes(newTypes);
    onFilterChange({
      types: newTypes,
      namespaces: selectedNamespaces,
      labels: selectedLabels,
    });
  };

  const handleNamespaceChange = (namespace: string) => {
    const newNamespaces = selectedNamespaces.includes(namespace)
      ? selectedNamespaces.filter((n) => n !== namespace)
      : [...selectedNamespaces, namespace];
    setSelectedNamespaces(newNamespaces);
    onFilterChange({
      types: selectedTypes,
      namespaces: newNamespaces,
      labels: selectedLabels,
    });
  };

  const handleLabelChange = (label: string) => {
    const newLabels = selectedLabels.includes(label)
      ? selectedLabels.filter((l) => l !== label)
      : [...selectedLabels, label];
    setSelectedLabels(newLabels);
    onFilterChange({
      types: selectedTypes,
      namespaces: selectedNamespaces,
      labels: newLabels,
    });
  };

  const handleReset = () => {
    setSearchQuery('');
    setSelectedTypes([]);
    setSelectedNamespaces([]);
    setSelectedLabels([]);
    onSearch('');
    onFilterChange({
      types: [],
      namespaces: [],
      labels: [],
    });
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        backgroundColor: 'white',
        padding: '15px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        zIndex: 1000,
        width: '300px',
      }}
    >
      <div style={{ marginBottom: '15px' }}>
        <input
          type="text"
          placeholder="Search resources..."
          value={searchQuery}
          onChange={handleSearchChange}
          style={{
            width: '100%',
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #ddd',
          }}
        />
      </div>

      <div style={{ marginBottom: '15px' }}>
        <strong>Resource Types:</strong>
        {resourceTypes.map((type) => (
          <div key={type} style={{ marginTop: '5px' }}>
            <label>
              <input
                type="checkbox"
                checked={selectedTypes.includes(type)}
                onChange={() => handleTypeChange(type)}
              />
              {type}
            </label>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: '15px' }}>
        <strong>Namespaces:</strong>
        {availableNamespaces.map((namespace) => (
          <div key={namespace} style={{ marginTop: '5px' }}>
            <label>
              <input
                type="checkbox"
                checked={selectedNamespaces.includes(namespace)}
                onChange={() => handleNamespaceChange(namespace)}
              />
              {namespace}
            </label>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: '15px' }}>
        <strong>Labels:</strong>
        {availableLabels.map((label) => (
          <div key={label} style={{ marginTop: '5px' }}>
            <label>
              <input
                type="checkbox"
                checked={selectedLabels.includes(label)}
                onChange={() => handleLabelChange(label)}
              />
              {label}
            </label>
          </div>
        ))}
      </div>

      <button
        onClick={handleReset}
        style={{
          width: '100%',
          padding: '8px',
          backgroundColor: '#f44336',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        Reset Filters
      </button>
    </div>
  );
}; 