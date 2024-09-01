import React from "react";
import { Card, CardContent } from "@mui/material";

const CardComponent = ({ title, description, imageUrl, children, opacity=1 }) => {
  return (
    <Card
      sx={{ maxWidth: '100%',minHeight:'auto', margin: "2rem auto", padding: "1rem", boxShadow: 3, backgroundColor:`rgba(255,255,255,${opacity})` }}
    >
      <CardContent>{children}</CardContent>
    </Card>
  );
};

export default CardComponent;
