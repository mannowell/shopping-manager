import React, { useState, useEffect } from 'react';
import { Button, TextField, MenuItem, Select, InputLabel, FormControl, Typography, List, ListItem, ListItemText, IconButton, Divider, Box } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import db, { Promotion } from '../db';

const markets = ['Intermarché', 'ALDI'];

const Promotions = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [market, setMarket] = useState('');
  const [validUntil, setValidUntil] = useState('');

  useEffect(() => {
    db.promotions.toArray().then(setPromotions);
  }, []);

  const addPromotion = async () => {
    if (name && price && market && validUntil) {
      const newPromotion: Promotion = { name, price, market, validUntil };
      const id = await db.promotions.add(newPromotion);
      setPromotions([...promotions, { ...newPromotion, id }]);
      setName('');
      setPrice(0);
      setMarket('');
      setValidUntil('');
    }
  };

  const removePromotion = async (id: number) => {
    await db.promotions.delete(id);
    setPromotions(promotions.filter(promo => promo.id !== id));
  };

  const isPromotionValid = (validUntil: string) => {
    const today = new Date();
    const validUntilDate = new Date(validUntil);
    return validUntilDate >= today;
  };

  return (
    <Box sx={{ padding: '20px', backgroundColor: '#fff8e1', borderRadius: '8px' }}>
      <Typography variant="h4" color="warning.main">Promoções</Typography>
      <FormControl fullWidth style={{ marginTop: '20px' }}>
        <TextField label="Nome do Item" value={name} onChange={(e) => setName(e.target.value)} />
      </FormControl>
      <FormControl fullWidth style={{ marginTop: '20px' }}>
        <TextField label="Preço Promocional (€)" type="number" value={price} onChange={(e) => setPrice(parseFloat(e.target.value))} />
      </FormControl>
      <FormControl fullWidth style={{ marginTop: '20px' }}>
        <InputLabel>Supermercado</InputLabel>
        <Select value={market} onChange={(e) => setMarket(e.target.value)}>
          {markets.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
        </Select>
      </FormControl>
      <FormControl fullWidth style={{ marginTop: '20px' }}>
        <TextField 
          label="Válido Até" 
          type="date" 
          value={validUntil} 
          onChange={(e) => setValidUntil(e.target.value)} 
          InputLabelProps={{ shrink: true }} 
        />
      </FormControl>
      <Button variant="contained" color="warning" onClick={addPromotion} style={{ marginTop: '20px' }}>
        Adicionar Promoção
      </Button>
      <Divider style={{ margin: '20px 0' }} />
      <Typography variant="h6" color="textPrimary">Promoções Ativas:</Typography>
      <List>
        {promotions.filter(promo => isPromotionValid(promo.validUntil)).map(promo => (
          <ListItem key={promo.id} secondaryAction={
            <IconButton edge="end" onClick={() => removePromotion(promo.id!)}>
              <DeleteIcon />
            </IconButton>
          }>
            <ListItemText
              primary={`${promo.name} (${promo.market})`}
              secondary={`Preço Promocional: €${promo.price} | Válido Até: ${promo.validUntil}`}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default Promotions;