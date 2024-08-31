import React from 'react';
import { ButtonGroup, IconButton, Toolbar as MuiToolbar, Typography, Tooltip } from '@mui/material';
import TableRowsIcon from '@mui/icons-material/TableRows';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import AddIcon from '@mui/icons-material/Add';
import './Toolbar.css';

const Toolbar = ({ addRow, addColumn }) => {
  return (
    <MuiToolbar
      sx={{
        justifyContent: 'flex-start',
        padding: '0px !important', // Smaller padding
        minHeight: '32px', // Adjusted height
        height: '2vh',
        backgroundColor: 'white',
        borderBottom: '1px solid #ddd',
        gap:'1rem'
      }}
    >
      <ButtonGroup
        variant="outlined"
        size="small"
        sx={{
          display: 'flex',
          alignItems: 'center',
          borderRadius: '4px',
          marginLeft: '8px',
        }}
      >
        <Tooltip title="Add Row">
          <IconButton onClick={addRow} size="small" sx={{ padding: '4px 8px', borderRadius:'8px' }}>
            <AddIcon fontSize="small" />
            <TableRowsIcon fontSize="small" />
            <Typography variant="caption" sx={{ marginLeft: '4px' }}>Add Row</Typography>
          </IconButton>
        </Tooltip>
        <Tooltip title="Add Column">
          <IconButton onClick={addColumn} size="small" sx={{ padding: '4px 8px', borderRadius:'8px' }}>
            <AddIcon fontSize="small" />
            <ViewColumnIcon fontSize="small" />
            <Typography variant="caption" sx={{ marginLeft: '4px' }}>Add Column</Typography>
          </IconButton>
        </Tooltip>
      </ButtonGroup>
    </MuiToolbar>
  );
};

export default Toolbar;
