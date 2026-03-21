import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { Container, AppBar, Toolbar, Typography, Button, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import ShoppingList from './components/ShoppingList';
import Stock from './components/Stock';
import Promotions from './components/Promotions';
import Reports from './components/Reports';

// Tema personalizado para melhorar a interface
const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' }, // Azul para a barra de navegação
    secondary: { main: '#388e3c' }, // Verde para estoque e ações
    warning: { main: '#f57c00' }, // Laranja para alertas
    background: { default: '#fafafa' },
  },
  typography: {
    h4: { fontWeight: 600 },
    h6: { fontWeight: 500 },
  },
});

// Componente de placeholder para Home
const Home = () => <Typography variant="h4">Bem-vindo ao Gerenciador de Compras</Typography>;

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" style={{ flexGrow: 1 }}>
              Gerenciador de Compras
            </Typography>
            <Button color="inherit" component={Link} to="/">Home</Button>
            <Button color="inherit" component={Link} to="/lista">Lista</Button>
            <Button color="inherit" component={Link} to="/estoque">Estoque</Button>
            <Button color="inherit" component={Link} to="/promocoes">Promoções</Button>
            <Button color="inherit" component={Link} to="/relatorios">Relatórios</Button>
          </Toolbar>
        </AppBar>
        <Container style={{ marginTop: '20px' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/lista" element={<ShoppingList />} />
            <Route path="/estoque" element={<Stock />} />
            <Route path="/promocoes" element={<Promotions />} />
            <Route path="/relatorios" element={<Reports />} />
          </Routes>
        </Container>
      </Router>
    </ThemeProvider>
  );
}

export default App;