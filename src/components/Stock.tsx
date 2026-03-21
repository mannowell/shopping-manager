import React, { useState, useEffect } from 'react';
import { Button, TextField, MenuItem, Select, InputLabel, FormControl, Typography, List, ListItem, ListItemText, IconButton, Divider, Box } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningIcon from '@mui/icons-material/Warning';
import db, { Item } from '../db';

const categories = [
  'Não Perecíveis', 'Embutidos', 'Enlatados', 'Temperos/Especiarias', 'Água Potável', 'Lanches Rápidos'
];

const Stock = () => {
  const [stockItems, setStockItems] = useState<Item[]>([]);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [validity, setValidity] = useState('');

  useEffect(() => {
    db.items.where('isPerishable').equals(0).toArray().then(setStockItems);
  }, []);

  const addStockItem = async () => {
    if (name && category) {
      const newItem: Item = { 
        name, 
        category, 
        quantity, 
        market: 'Estoque', 
        price: 0, 
        isPerishable: false, 
        stock: quantity, 
        dateAdded: new Date().toISOString().split('T')[0], 
        validity 
      };
      const id = await db.items.add(newItem);
      setStockItems([...stockItems, { ...newItem, id }]);
      setName('');
      setCategory('');
      setQuantity(1);
      setValidity('');
    }
  };

  const removeStockItem = async (id: number) => {
    await db.items.delete(id);
    setStockItems(stockItems.filter(item => item.id !== id));
  };

  const getStockAlerts = (item: Item) => {
    const alerts: string[] = [];
    if (item.stock && item.stock < 2) {
      alerts.push('Estoque baixo (menos de 2 unidades)');
    }
    if (item.validity) {
      const today = new Date();
      const validityDate = new Date(item.validity);
      const daysToExpire = Math.ceil((validityDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
      if (daysToExpire <= 7) {
        alerts.push(`Validade próxima (${daysToExpire} dias restantes)`);
      }
    }
    return alerts.length > 0 ? alerts.join(' | ') : '';
  };

  return (
    <Box sx={{ padding: '20px', backgroundColor: '#e8f5e9', borderRadius: '8px' }}>
      <Typography variant="h4" color="secondary">Estoque</Typography>
      <FormControl fullWidth style={{ marginTop: '20px' }}>
        <TextField label="Nome do Item" value={name} onChange={(e) => setName(e.target.value)} />
      </FormControl>
      <FormControl fullWidth style={{ marginTop: '20px' }}>
        <InputLabel>Categoria</InputLabel>
        <Select value={category} onChange={(e) => setCategory(e.target.value)}>
          {categories.map(cat => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
        </Select>
      </FormControl>
      <FormControl fullWidth style={{ marginTop: '20px' }}>
        <TextField label="Quantidade" type="number" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value))} />
      </FormControl>
      <FormControl fullWidth style={{ marginTop: '20px' }}>
        <TextField 
          label="Data de Validade (opcional)" 
          type="date" 
          value={validity} 
          onChange={(e) => setValidity(e.target.value)} 
          InputLabelProps={{ shrink: true }} 
        />
      </FormControl>
      <Button variant="contained" color="secondary" onClick={addStockItem} style={{ marginTop: '20px' }}>
        Adicionar ao Estoque
      </Button>
      <Divider style={{ margin: '20px 0' }} />
      <Typography variant="h6" color="textPrimary">Itens no Estoque:</Typography>
      <List>
        {stockItems.map(item => (
          <ListItem key={item.id} secondaryAction={
            <IconButton edge="end" onClick={() => removeStockItem(item.id!)}>
              <DeleteIcon />
            </IconButton>
          }>
            <ListItemText
              primary={`${item.name}`}
              secondary={
                <>
                  {`Categoria: ${item.category} | Quantidade: ${item.stock} | Validade: ${item.validity || 'Não informada'}`}
                  {getStockAlerts(item) && (
                    <Typography variant="body2" color="warning.main" sx={{ display: 'flex', alignItems: 'center', marginTop: '5px' }}>
                      <WarningIcon fontSize="small" sx={{ marginRight: '5px' }} /> {getStockAlerts(item)}
                    </Typography>
                  )}
                </>
              }
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default Stock;