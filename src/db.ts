import Dexie, { Table } from 'dexie';

// Interface que define a estrutura de um item no banco de dados
export interface Item {
  id?: number;
  name: string;
  category: string;
  quantity: number;
  price: number;
  market: string;
  isPerishable: boolean;
  stock?: number;
  dateAdded?: string;
  validity?: string;
  planned?: boolean; // Novo campo para marcar itens planejados
}

// Interface que define a estrutura de uma promoção (para uso futuro)
export interface Promotion {
  id?: number;
  name: string;
  price: number;
  market: string;
  validUntil: string;
}

// Interface que define a estrutura das configurações (para uso futuro)
export interface Setting {
  key: string;
  value: string;
}

// Classe que define o banco de dados com tipos
class ShoppingManagerDB extends Dexie {
  items!: Table<Item>;
  promotions!: Table<Promotion>;
  settings!: Table<Setting>;

  constructor() {
    super('ShoppingManagerDB');
    this.version(1).stores({
      items: '++id, name, category, quantity, price, market, isPerishable, stock, dateAdded, validity, planned',
      promotions: '++id, name, price, market, validUntil',
      settings: 'key, value',
    });
  }
}

const db = new ShoppingManagerDB();
export default db;