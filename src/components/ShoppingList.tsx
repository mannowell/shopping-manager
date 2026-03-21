import React, { useState, useEffect } from 'react';
import { Button, TextField, MenuItem, Select, InputLabel, FormControl, Typography, List, ListItem, ListItemText, IconButton, Divider, Checkbox, FormControlLabel, Box, Alert } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import WarningIcon from '@mui/icons-material/Warning';
import SaveIcon from '@mui/icons-material/Save';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import db, { Item, Promotion } from '../db';
import jsPDF from 'jspdf';

const categories = ['Perecíveis', 'Frutas', 'Proteínas', 'Não Perecíveis', 'Embutidos', 'Enlatados', 'Temperos/Especiarias', 'Água Potável', 'Lanches Rápidos'];
const markets = ['Intermarché', 'ALDI'];
const proteinTypes = ['Carne de Gado', 'Porco', 'Frango/Peru', 'Peixe'];

interface NewItem {
  name: string;
  category: string;
  quantity: number;
  price: number;
}

const ShoppingList = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [stockItems, setStockItems] = useState<Item[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [plannedItems, setPlannedItems] = useState<Item[]>([]);
  const [selectedProteins, setSelectedProteins] = useState<string[]>([]);
  const [showSubstitutions, setShowSubstitutions] = useState<{ [key: number]: boolean }>({});
  const [market, setMarket] = useState(localStorage.getItem('selectedMarket') || '');
  const [newItems, setNewItems] = useState<NewItem[]>([{ name: '', category: '', quantity: 1, price: 0 }]);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [savedList, setSavedList] = useState<Item[]>([]);

  useEffect(() => {
    db.items.where('isPerishable').equals(1).and(item => !item.planned).toArray().then(setItems);
    db.items.where('isPerishable').equals(0).toArray().then(setStockItems);
    db.items.where('planned').equals(1).toArray().then(setPlannedItems);
    db.promotions.toArray().then(setPromotions);
    const saved = localStorage.getItem('savedShoppingList');
    if (saved) setSavedList(JSON.parse(saved));
  }, []);

  const addNewItemField = () => {
    setNewItems([...newItems, { name: '', category: '', quantity: 1, price: 0 }]);
  };

  const updateNewItem = (index: number, field: keyof NewItem, value: string | number) => {
    const updatedItems = [...newItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setNewItems(updatedItems);
  };

  const addItemsToCart = async () => {
    if (!market) {
      alert('Por favor, selecione um supermercado antes de adicionar itens.');
      return;
    }

    const validItems = newItems.filter(item => item.name && item.category);
    if (validItems.length === 0) return;

    const itemsToAdd: Item[] = [];
    for (const item of validItems) {
      const promotion = promotions.find(promo => 
        promo.name.toLowerCase() === item.name.toLowerCase() && 
        promo.market === market && 
        isPromotionValid(promo.validUntil)
      );
      const finalPrice = promotion ? promotion.price : item.price;

      if (item.category !== 'Perecíveis' && item.category !== 'Frutas') {
        const stockItem = stockItems.find(s => s.name.toLowerCase() === item.name.toLowerCase());
        if (stockItem && stockItem.stock && stockItem.stock >= 2) {
          const confirmAdd = window.confirm(`O item "${item.name}" já está no estoque com ${stockItem.stock} unidades. Deseja adicionar à lista de compras mesmo assim?`);
          if (!confirmAdd) continue;
        }
      }

      const newItem = { 
        name: item.name, 
        category: item.category, 
        quantity: item.quantity, 
        price: finalPrice, 
        market, 
        isPerishable: item.category === 'Perecíveis' || item.category === 'Frutas' 
      };
      const id = await db.items.add(newItem);
      itemsToAdd.push({ ...newItem, id });
    }

    setItems([...items, ...itemsToAdd]);
    setNewItems([{ name: '', category: '', quantity: 1, price: 0 }]);
    checkTotalAlert([...items, ...itemsToAdd]);
  };

  const checkTotalAlert = (currentItems: Item[]) => {
    const total = currentItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    if (total >= 50) {
      alert(`Atenção: O total da lista no ${market} atingiu ou ultrapassou €50 (Total: €${total.toFixed(2)}).`);
    }
  };

  const startEditing = (item: Item) => {
    setEditingItem({ ...item });
  };

  const saveEdit = async () => {
    if (editingItem && editingItem.id) {
      await db.items.update(editingItem.id, editingItem);
      setItems(items.map(item => (item.id === editingItem.id ? editingItem : item)));
      setEditingItem(null);
      checkTotalAlert(items.map(item => (item.id === editingItem.id ? editingItem : item)));
    }
  };

  const removeItem = async (id: number) => {
    await db.items.delete(id);
    setItems(items.filter(item => item.id !== id));
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);
  };

  const calculatePartialTotal = () => {
    return newItems.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);
  };

  interface PaymentSplit {
    market: string;
    message?: string;
    card1?: number;
    card2?: number;
  }

  const splitPayment = (): PaymentSplit[] => {
    const total = parseFloat(calculateTotal());
    const itemsByMarket = markets.map(m => ({
      market: m,
      items: items.filter(item => item.market === m),
      total: items.filter(item => item.market === m).reduce((sum, item) => sum + item.price * item.quantity, 0)
    }));

    return itemsByMarket.map(({ market, total }) => {
      if (total <= 50) return { market, message: `Adicione mais itens para atingir €50.` };
      if (total > 120) return { market, message: `Total excede €120.` };
      const card1 = Math.min(60, total / 2);
      const card2 = total - card1;
      if (card1 < 50 || card2 < 50) return { market, message: `Não é possível dividir entre €50 e €60.` };
      return { market, card1, card2 };
    });
  };

  const paymentInfo = splitPayment();

  const planPerishables = () => {
    const newPlannedItems: Item[] = [
      { name: 'Salada (Alface, Tomate, etc.)', category: 'Perecíveis', quantity: 1, price: 0, market: '', isPerishable: true, planned: true },
      { name: 'Pão (Forma ou Baguete)', category: 'Perecíveis', quantity: 2, price: 0, market: '', isPerishable: true, planned: true },
    ];

    selectedProteins.forEach(protein => {
      newPlannedItems.push({ name: protein, category: 'Proteínas', quantity: 0.5, price: 0, market: '', isPerishable: true, planned: true });
    });

    newPlannedItems.forEach(async item => {
      const id = await db.items.add(item);
      setPlannedItems(prev => [...prev, { ...item, id }]);
    });
  };

  const addPlannedToCart = async (plannedItem: Item) => {
    if (!market) {
      alert('Por favor, selecione um supermercado antes de adicionar itens.');
      return;
    }
    const updatedItem = { ...plannedItem, planned: false, market };
    await db.items.update(plannedItem.id!, updatedItem);
    setPlannedItems(plannedItems.filter(item => item.id !== plannedItem.id));
    setItems([...items, updatedItem]);
    checkTotalAlert([...items, updatedItem]);
  };

  const handleProteinChange = (protein: string) => {
    if (selectedProteins.includes(protein)) {
      setSelectedProteins(selectedProteins.filter(p => p !== protein));
    } else if (selectedProteins.length < 4) {
      setSelectedProteins([...selectedProteins, protein]);
    } else {
      alert('Você já selecionou 4 tipos de proteínas. Desmarque um para adicionar outro.');
    }
  };

  const isPromotionValid = (validUntil: string) => {
    const today = new Date();
    const validUntilDate = new Date(validUntil);
    return validUntilDate >= today;
  };

  const suggestSubstitutions = (item: Item) => {
    const substitutions: string[] = [];
    const similarPromotions = promotions.filter(promo => 
      promo.market === item.market && 
      isPromotionValid(promo.validUntil) && 
      promo.name.toLowerCase().includes(item.name.toLowerCase().split(' ')[0])
    );
    similarPromotions.forEach(promo => {
      substitutions.push(`Compre ${promo.name} em promoção por €${promo.price} no ${promo.market}`);
    });

    const similarStockItems = stockItems.filter(stock => 
      stock.name.toLowerCase().includes(item.name.toLowerCase().split(' ')[0]) && 
      stock.stock && stock.stock > 0
    );
    similarStockItems.forEach(stock => {
      substitutions.push(`Use ${stock.name} do estoque (${stock.stock} unidades)`);
    });

    const otherMarket = markets.find(m => m !== item.market);
    const otherMarketPromotions = promotions.filter(promo => 
      promo.market === otherMarket && 
      isPromotionValid(promo.validUntil) && 
      promo.name.toLowerCase().includes(item.name.toLowerCase().split(' ')[0])
    );
    otherMarketPromotions.forEach(promo => {
      substitutions.push(`Compre ${promo.name} por €${promo.price} no ${promo.market}`);
    });

    return substitutions.length > 0 ? substitutions : ['Nenhuma substituição disponível'];
  };

  const markAsOutOfStock = (item: Item) => {
    setShowSubstitutions(prev => ({ ...prev, [item.id!]: !prev[item.id!] }));
  };

  const saveCurrentList = () => {
    const listToSave = items.map(item => ({ ...item, id: undefined }));
    localStorage.setItem('savedShoppingList', JSON.stringify(listToSave));
    setSavedList(listToSave);
    alert('Lista salva com sucesso!');
  };

  const loadSavedList = () => {
    if (savedList.length > 0) {
      setItems(savedList.map(item => ({ ...item })));
      alert('Lista da semana anterior carregada. Edite os itens conforme necessário e adicione ao carrinho.');
    } else {
      alert('Nenhuma lista salva encontrada.');
    }
  };

  // Função para exportar a lista como PDF
  const exportListToPDF = () => {
    if (items.length === 0) {
      alert('A lista está vazia. Adicione itens antes de exportar.');
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Lista de Compras - ${market}`, 10, 10);
    doc.setFontSize(12);
    let y = 20;
    items.forEach((item, index) => {
      doc.text(`${index + 1}. ${item.name} (${item.category}) - ${item.quantity} x €${item.price} = €${(item.price * item.quantity).toFixed(2)}`, 10, y);
      y += 10;
    });
    doc.text(`Total Geral: €${calculateTotal()}`, 10, y + 10);
    doc.save(`lista_compras_${market}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Sugestões automáticas baseadas em compras anteriores
  const getPurchaseSuggestions = () => {
    const itemFrequency: { [key: string]: number } = {};
    items.forEach(item => {
      itemFrequency[item.name] = (itemFrequency[item.name] || 0) + item.quantity;
    });
    return Object.entries(itemFrequency)
      .filter(([_, count]) => count >= 3)
      .map(([name]) => name);
  };

  const suggestions = getPurchaseSuggestions();

  return (
    <Box sx={{ padding: '20px', backgroundColor: '#e3f2fd', borderRadius: '8px' }}>
      <Typography variant="h4" color="primary">Lista de Compras</Typography>

      <FormControl fullWidth style={{ marginTop: '20px' }}>
        <InputLabel>Supermercado</InputLabel>
        <Select 
          value={market} 
          onChange={(e) => {
            setMarket(e.target.value);
            localStorage.setItem('selectedMarket', e.target.value);
          }}
        >
          {markets.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
        </Select>
      </FormControl>

      <Divider style={{ margin: '20px 0' }} />
      <Typography variant="h6" color="textPrimary">Planejamento de Perecíveis</Typography>
      <Typography variant="body1">Selecione os itens perecíveis para a semana:</Typography>
      <Typography variant="body2">Itens padrão sugeridos: 1 pacote de salada, 2 pães, 500g de cada proteína</Typography>
      <Typography variant="subtitle1" style={{ marginTop: '10px' }}>Proteínas (selecione até 4):</Typography>
      {proteinTypes.map(protein => (
        <FormControlLabel
          key={protein}
          control={<Checkbox checked={selectedProteins.includes(protein)} onChange={() => handleProteinChange(protein)} />}
          label={protein}
        />
      ))}
      <Button variant="contained" color="secondary" onClick={planPerishables} startIcon={<AddShoppingCartIcon />} style={{ marginTop: '10px' }}>
        Planejar Itens Perecíveis
      </Button>

      {plannedItems.length > 0 && (
        <>
          <Typography variant="h6" color="textPrimary" style={{ marginTop: '20px' }}>Itens Planejados:</Typography>
          <List>
            {plannedItems.map(item => (
              <ListItem key={item.id} secondaryAction={
                <Button variant="outlined" color="primary" onClick={() => addPlannedToCart(item)} startIcon={<AddShoppingCartIcon />}>
                  Adicionar ao Carrinho
                </Button>
              }>
                <ListItemText
                  primary={`${item.name}`}
                  secondary={`Categoria: ${item.category} | Quantidade: ${item.quantity}`}
                />
              </ListItem>
            ))}
          </List>
        </>
      )}

      <Divider style={{ margin: '20px 0' }} />
      <Typography variant="h6" color="textPrimary">Adicionar Itens</Typography>
      {suggestions.length > 0 && (
        <Box sx={{ marginBottom: '20px' }}>
          <Typography variant="subtitle1">Sugestões baseadas em compras anteriores:</Typography>
          {suggestions.map(suggestion => (
            <Button
              key={suggestion}
              variant="outlined"
              size="small"
              onClick={() => setNewItems([...newItems, { name: suggestion, category: '', quantity: 1, price: 0 }])}
              style={{ marginRight: '10px', marginTop: '5px' }}
            >
              Adicionar {suggestion}
            </Button>
          ))}
        </Box>
      )}
      {newItems.map((newItem, index) => (
        <Box key={index} sx={{ display: 'flex', gap: '10px', marginTop: '20px', alignItems: 'center' }}>
          <FormControl sx={{ flex: 2 }}>
            <TextField
              label="Nome do Item"
              value={newItem.name}
              onChange={(e) => updateNewItem(index, 'name', e.target.value)}
            />
          </FormControl>
          <FormControl sx={{ flex: 1 }}>
            <InputLabel>Categoria</InputLabel>
            <Select
              value={newItem.category}
              onChange={(e) => updateNewItem(index, 'category', e.target.value)}
            >
              {categories.map(cat => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl sx={{ flex: 1 }}>
            <TextField
              label="Quantidade"
              type="number"
              value={newItem.quantity}
              onChange={(e) => updateNewItem(index, 'quantity', parseInt(e.target.value))}
            />
          </FormControl>
          <FormControl sx={{ flex: 1 }}>
            <TextField
              label="Preço (€)"
              type="number"
              value={newItem.price}
              onChange={(e) => updateNewItem(index, 'price', parseFloat(e.target.value))}
            />
          </FormControl>
        </Box>
      ))}
      <Typography variant="body1" style={{ marginTop: '10px' }}>
        Total Parcial: €{calculatePartialTotal()}
      </Typography>
      <Button variant="outlined" color="primary" onClick={addNewItemField} startIcon={<AddIcon />} style={{ marginTop: '10px' }}>
        Adicionar Novo Item
      </Button>
      <Button variant="contained" color="primary" onClick={addItemsToCart} startIcon={<AddShoppingCartIcon />} style={{ marginTop: '10px', marginLeft: '10px' }}>
        Adicionar ao Carrinho
      </Button>

      <Divider style={{ margin: '20px 0' }} />
      <Typography variant="h6" color="textPrimary">Gerenciar Lista Semanal</Typography>
      <Button variant="contained" color="secondary" onClick={saveCurrentList} startIcon={<SaveIcon />} style={{ marginRight: '10px', marginTop: '10px' }}>
        Salvar Lista Atual
      </Button>
      <Button variant="outlined" color="primary" onClick={loadSavedList} style={{ marginTop: '10px', marginRight: '10px' }}>
        Carregar Lista da Semana Anterior
      </Button>
      <Button variant="contained" color="primary" onClick={exportListToPDF} startIcon={<PictureAsPdfIcon />} style={{ marginTop: '10px' }}>
        Exportar Lista como PDF
      </Button>

      {editingItem && (
        <>
          <Divider style={{ margin: '20px 0' }} />
          <Typography variant="h6" color="textPrimary">Editar Item</Typography>
          <FormControl fullWidth style={{ marginTop: '20px' }}>
            <TextField label="Nome do Item" value={editingItem.name} onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })} />
          </FormControl>
          <FormControl fullWidth style={{ marginTop: '20px' }}>
            <InputLabel>Categoria</InputLabel>
            <Select value={editingItem.category} onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value as string })}>
              {categories.map(cat => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl fullWidth style={{ marginTop: '20px' }}>
            <TextField label="Quantidade" type="number" value={editingItem.quantity} onChange={(e) => setEditingItem({ ...editingItem, quantity: parseInt(e.target.value) })} />
          </FormControl>
          <FormControl fullWidth style={{ marginTop: '20px' }}>
            <TextField label="Preço (€)" type="number" value={editingItem.price} onChange={(e) => setEditingItem({ ...editingItem, price: parseFloat(e.target.value) })} />
          </FormControl>
          <Button variant="contained" color="primary" onClick={saveEdit} startIcon={<SaveIcon />} style={{ marginTop: '20px' }}>
            Salvar Alterações
          </Button>
          <Button variant="outlined" color="secondary" onClick={() => setEditingItem(null)} style={{ marginTop: '20px', marginLeft: '10px' }}>
            Cancelar
          </Button>
        </>
      )}

      <Divider style={{ margin: '20px 0' }} />
      <Typography variant="h6" color="textPrimary">Itens Adicionados:</Typography>
      <List>
        {items.map(item => (
          <ListItem key={item.id} secondaryAction={
            <>
              <IconButton edge="end" onClick={() => startEditing(item)} style={{ marginRight: '10px' }}>
                <EditIcon />
              </IconButton>
              <Button variant="outlined" color="warning" onClick={() => markAsOutOfStock(item)} startIcon={<WarningIcon />} style={{ marginRight: '10px' }}>
                Marcar como Esgotado
              </Button>
              <IconButton edge="end" onClick={() => removeItem(item.id!)}>
                <DeleteIcon />
              </IconButton>
            </>
          }>
            <ListItemText
              primary={`${item.name} (${item.market})`}
              secondary={
                <>
                  {`Categoria: ${item.category} | Quantidade: ${item.quantity} | Preço: €${item.price} | Total: €${(item.price * item.quantity).toFixed(2)}`}
                  {showSubstitutions[item.id!] && (
                    <div>
                      <Typography variant="body2" color="error">Item esgotado. Sugestões de substituição:</Typography>
                      {suggestSubstitutions(item).map((sub, index) => (
                        <Typography key={index} variant="body2" color="textSecondary">{`- ${sub}`}</Typography>
                      ))}
                    </div>
                  )}
                </>
              }
            />
          </ListItem>
        ))}
      </List>
      <Typography variant="h6" color="textPrimary">Total Geral: €{calculateTotal()}</Typography>
      
      <Divider style={{ margin: '20px 0' }} />
      <Typography variant="h6" color="textPrimary">Divisão de Pagamentos:</Typography>
      {paymentInfo.map(({ market, message, card1, card2 }) => (
        <div key={market}>
          <Typography variant="subtitle1" color="textPrimary">{market}:</Typography>
          {message ? <Typography color="warning.main">{message}</Typography> : (
            <Typography>Cartão 1: €{(card1 as number).toFixed(2)} | Cartão 2: €{(card2 as number).toFixed(2)}</Typography>
          )}
        </div>
      ))}
    </Box>
  );
};

export default ShoppingList;