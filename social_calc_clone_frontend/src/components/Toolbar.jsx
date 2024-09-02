import React, { useRef } from "react";
import {
  ButtonGroup,
  IconButton,
  Toolbar as MuiToolbar,
  Typography,
  Tooltip,
  Box,
} from "@mui/material";
import TableRowsIcon from "@mui/icons-material/TableRows";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";
import AddIcon from "@mui/icons-material/Add";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import SaveIcon from "@mui/icons-material/Save";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import "./Toolbar.css";

const Toolbar = ({
  addRow,
  addColumn,
  sessionId,
  exportToCSV,
  importFromCSV,
}) => {
  const handleCopySessionId = () => {
    navigator.clipboard.writeText(sessionId).then(() => {
      // console.log("Session ID copied to clipboard");
    });
  };
  const fileInputRef = useRef(null);
  const refHandler = (e)=>{

    importFromCSV(e)
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  }
  return (
    <MuiToolbar
      sx={{
        justifyContent: "space-between",
        padding: "0px 2vw 0px 0px!important", // Smaller padding
        minHeight: "32px", // Adjusted height
        height: "2vh",
        backgroundColor: "#ddd",
        borderBottom: "1px solid #ddd",
        gap: "1rem",
      }}
    >
      {/* Button group for adding rows and columns */}
      <ButtonGroup
        variant="outlined"
        size="small"
        sx={{
          display: "flex",
          alignItems: "center",
          borderRadius: "4px",
          marginLeft: "8px",
          gap: "1vw",
        }}
      >
        <Tooltip title="Export">
          <IconButton
            onClick={exportToCSV}
            color="primary"
            aria-label="export to CSV"
          >
            <SaveIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Import CSV">
          <IconButton color="primary" aria-label="import CSV" component="label">
            <UploadFileIcon />
            <input
              type="file"
              accept=".csv"
              onChange={refHandler}
              hidden
              ref={fileInputRef}
            />
          </IconButton>
        </Tooltip>
        <Tooltip title="Add Row">
          <IconButton
            onClick={addRow}
            color="primary"
            size="small"
            sx={{ padding: "4px 8px", borderRadius: "8px" }}
          >
            <AddIcon fontSize="small" />
            <TableRowsIcon fontSize="small" />
            <Typography variant="caption" sx={{ marginLeft: "4px" }}>
              Add Row
            </Typography>
          </IconButton>
        </Tooltip>
        <Tooltip title="Add Column">
          <IconButton
            onClick={addColumn}
            color="primary"
            size="small"
            sx={{ padding: "4px 8px", borderRadius: "8px" }}
          >
            <AddIcon fontSize="small" />
            <ViewColumnIcon fontSize="small" />
            <Typography variant="caption" sx={{ marginLeft: "4px" }}>
              Add Column
            </Typography>
          </IconButton>
        </Tooltip>
      </ButtonGroup>

      {/* Session ID display and copy button */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          border: "1px solid #ddd",
          borderRadius: "12px",
          padding: "2px 8px",
          marginRight: "8px",
        }}
      >
        <Tooltip title="Copy Session ID">
          <IconButton
            onClick={handleCopySessionId}
            size="small"
            sx={{ color: "grey.500", padding: "2px" }}
          >
            <ContentCopyIcon fontSize="small" />
          </IconButton>
          <Typography variant="caption" sx={{ marginLeft: "4px" }}>
            {sessionId}
          </Typography>
        </Tooltip>
      </Box>
    </MuiToolbar>
  );
};

export default Toolbar;
