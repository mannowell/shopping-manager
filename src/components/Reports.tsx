import React, { useState, useEffect } from 'react';
import { Typography, Divider, Box, Button } from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import db, { Item, Promotion } from '../db';
import jsPDF from 'jspdf';

const markets = ['Intermarché', 'ALDI'];

const Reports = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);

  useEffect(() => {
    db.items.toArray().then(setItems);
    db.promotions.toArray().then(setPromotions);
  }, []);

  const calculateTotalByMarket = () => {
    const totals: { [key: string]: number } = {};
    markets.forEach(market => {
      const marketItems = items.filter(item => item.market === market && !item.planned);
      totals[market] = marketItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    });
    return totals;
  };

  const calculatePromoSavings = () => {
    let savings = 0;
    items.forEach(item => {
      const promotion = promotions.find(promo => 
        promo.name.toLowerCase() === item.name.toLowerCase() && 
        promo.market === item.market && 
        new Date(promo.validUntil) >= new Date(item.dateAdded || '')
      );
      if (promotion && item.price < (item.price * 1.2)) {
        const normalPrice = item.price * 1.2;
        savings += (normalPrice - item.price) * item.quantity;
      }
    });
    return savings.toFixed(2);
  };

  const calculateTopItems = () => {
    const itemFrequency: { [key: string]: number } = {};
    items.filter(item => !item.planned).forEach(item => {
      itemFrequency[item.name] = (itemFrequency[item.name] || 0) + item.quantity;
    });
    return Object.entries(itemFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));
  };

  const totals = calculateTotalByMarket();
  const savings = calculatePromoSavings();
  const topItems = calculateTopItems();

  const exportReportsToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Relatórios de Compras', 10, 10);
    doc.setFontSize(12);

    let y = 20;
    doc.text('Total Gasto por Supermercado:', 10, y);
    y += 10;
    markets.forEach(market => {
      doc.text(`${market}: €${totals[market].toFixed(2)}`, 10, y);
      y += 10;
    });

    y += 10;
    doc.text('Economia com Promoções:', 10, y);
    y += 10;
    doc.text(`Total economizado: €${savings}`, 10, y);

    y += 20;
    doc.text('Itens Mais Comprados:', 10, y);
    y += 10;
    topItems.forEach(item => {
      doc.text(`${item.name}: ${item.count} unidades`, 10, y);
      y += 10;
    });

    doc.save(`relatorios_compras_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <Box sx={{ padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
      <Typography variant="h4" color="primary">Relatórios</Typography>
      <Button variant="contained" color="primary" onClick={exportReportsToPDF} startIcon={<PictureAsPdfIcon />} style={{ marginTop: '10px' }}>
        Exportar Relatórios como PDF
      </Button>
      <Divider style={{ margin: '20px 0' }} />

      <Typography variant="h6" color="textPrimary">Total Gasto por Supermercado</Typography>
      {markets.map(market => (
        <Typography key={market} variant="body1" sx={{ marginTop: '10px' }}>
          {market}: €{totals[market].toFixed(2)}
        </Typography>
      ))}

      <Divider style={{ margin: '20px 0' }} />
      <Typography variant="h6" color="textPrimary">Economia com Promoções</Typography>
      <Typography variant="body1" sx={{ marginTop: '10px' }}>
        Total economizado: €{savings}
      </Typography>

      <Divider style={{ margin: '20px 0' }} />
      <Typography variant="h6" color="textPrimary">Itens Mais Comprados</Typography>
      {topItems.map(item => (
        <Typography key={item.name} variant="body1" sx={{ marginTop: '10px' }}>
          {item.name}: {item.count} unidades
        </Typography>
      ))}
    </Box>
  );
};

export default Reports;