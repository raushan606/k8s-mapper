import React from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';

interface Namespace {
  id: string;
  name: string;
}

interface NamespaceDropdownProps {
  namespaces: Namespace[];
  selectedNamespace: string | null;
  onNamespaceChange: (namespaceId: string | null) => void;
}

export const NamespaceDropdown: React.FC<NamespaceDropdownProps> = ({
  namespaces,
  selectedNamespace,
  onNamespaceChange,
}) => {
  const handleChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    onNamespaceChange(value === 'all' ? null : value);
  };

  return (
    <FormControl fullWidth size="small">
      <InputLabel id="namespace-select-label">Namespace</InputLabel>
      <Select
        labelId="namespace-select-label"
        id="namespace-select"
        value={selectedNamespace || 'all'}
        label="Namespace"
        onChange={handleChange}
      >
        <MenuItem value="all">All Namespaces</MenuItem>
        {namespaces.map((namespace) => (
          <MenuItem key={namespace.id} value={namespace.id}>
            {namespace.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};