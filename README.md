# Shopping Manager

Sistema web SPA (Single Page Application) moderno de gerenciamento focado em controle organizado de compras. Desenhado para maximizar a interface do usuário com a riqueza visual de componentes e com operações de alta velocidade por armazenamento em cache do browser sem requerer online persistente em banco em nuvem de imediato.

## 🚀 Estrutura e Ferramentas Modernas

- **Material UI (MUI v6) & Emotion JS:** Biblioteca robusta usada para dar vida a inputs e painéis interativos padronizados e elegantes sem sacrificar acessibilidade. 
- **React 19 & React Router 7:** Versões novíssimas dos utilitários de construção de interfaces orientadas por rotas virtuais.
- **Dexie.js API:** Facilita grandemente a interação do código assíncrono perante o IndexedDB para banco persistido sem atritos ou perdas locais de sessão em requisições offline complexas.
- **jsPDF:** Uma camada instalada especificamente para conversões rápidas de tabelas de gerenciantes ou nota física visual diretamente da tabela de estado ativa.

## 📦 Como Desenvolver/Modificar

Este projeto foi reconfigurado com React-Scripts base e é bastante flexível nativamente.

1. Na raiz do projeto instale os pacotes e recursos:
   ```bash
   npm install
   ```
2. Inicialize o servidor HMR (Hot Module Replacement) nativo local de testes (`http://localhost:3000`):
   ```bash
   npm start
   ```
3. Qualquer modificação refletirá rapidamente na tela sem reload. A integração com Typescript `@types` também funciona nos fundos apontando detecção antecipada (estática) para IDEs (apesar do código primário aceito ser Javascript em muitos pontos).

Para gerar versões imutáveis para hosting (ex: S3, Firebase, Vercel ou Netlify):
```bash
npm run build
```
O framework minificará, eliminará arquivos e logs mortos colocando todos compactados em `build/`.
