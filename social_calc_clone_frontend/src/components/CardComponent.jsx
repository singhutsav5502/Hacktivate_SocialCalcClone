import React from "react";
import { Card, CardContent } from "@mui/material";

const CardComponent = ({ title, description, imageUrl, children }) => {
  return (
    <Card
      sx={{ maxWidth: '100%', margin: "2rem auto", padding: "1rem", boxShadow: 3 }}
    >
      <CardContent>{children}</CardContent>
    </Card>
  );
};

export default CardComponent;
