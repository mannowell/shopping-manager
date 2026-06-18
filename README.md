# 🛒 Shopping Manager

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-0.1.0-green.svg)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-4.9-3178C6?logo=typescript)
![MUI](https://img.shields.io/badge/MUI%20v6-007FFF?logo=mui)
![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?logo=pwa)
![Dexie.js](https://img.shields.io/badge/Dexie.js-4.0-FF6F00)

Sistema web SPA (Single Page Application) moderno de gerenciamento focado em controle organizado de compras. Desenhado para maximizar a interface do usuário com a riqueza visual de componentes e com operações de alta velocidade por armazenamento em cache do browser sem requerer online persistente em banco em nuvem de imediato.

---

## 🚀 Estrutura e Ferramentas Modernas

- **Material UI (MUI v6) & Emotion JS:** Biblioteca robusta usada para dar vida a inputs e painéis interativos padronizados e elegantes sem sacrificar acessibilidade.
- **React 19 & React Router 7:** Versões novíssimas dos utilitários de construção de interfaces orientadas por rotas virtuais.
- **Dexie.js API:** Facilita grandemente a interação do código assíncrono perante o IndexedDB para banco persistido sem atritos ou perdas locais de sessão em requisições offline complexas.
- **jsPDF:** Uma camada instalada especificamente para conversões rápidas de tabelas de gerenciantes ou nota física visual diretamente da tabela de estado ativa.
- **TypeScript:** Tipagem estática para maior segurança e produtividade no desenvolvimento.
- **PWA Ready:** Progressive Web App com suporte a funcionamento offline.

## 🛠️ Tecnologias Utilizadas

| Componente | Tecnologia |
|-----------|-----------|
| **Framework** | React 19 |
| **Linguagem** | TypeScript 4.9 |
| **UI Library** | Material UI v6 |
| **Roteamento** | React Router DOM 7 |
| **Banco Local** | Dexie.js (IndexedDB) |
| **PDF** | jsPDF |
| **Build Tool** | Create React App 5 |

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
3. Qualquer modificação refletirá rapidamente na tela sem reload. A integração com Typescript `@types` também funciona nos fundos apontando detecção antecipada (estática) para IDEs.

Para gerar versões imutáveis para hosting (ex: S3, Firebase, Vercel ou Netlify):
```bash
npm run build
```
O framework minificará, eliminará arquivos e logs mortos colocando todos compactados em `build/`.

## 📜 Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `npm start` | Inicia o servidor de desenvolvimento |
| `npm run build` | Gera build de produção otimizado |
| `npm test` | Executa os testes |
| `npm run eject` | Ejeta do CRA (operação irreversível) |

---

## 👨‍💻 Autor

**Wellison Oliveira (mannowell)**

[![GitHub](https://img.shields.io/badge/GitHub-mannowell-181717?logo=github)](https://github.com/manowell)
[![Upwork](https://img.shields.io/badge/Upwork-Wellison%20Oliveira-6FDA44?logo=upwork)](https://www.upwork.com/freelancers/~01a3c7e5e6e0e0e0)
[![Portfolio](https://img.shields.io/badge/Portfolio-Visit-000000?logo=vercel)](https://mannowell.dev)

---

## 📄 Licença

Este projeto está sob a licença [MIT](./LICENSE).

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Siga os passos abaixo:

1. Faça um **fork** do projeto.
2. Crie uma **branch** para sua feature (`git checkout -b feature/minha-feature`).
3. Faça **commit** das suas alterações (`git commit -m 'Adiciona nova feature'`).
4. Faça **push** para a branch (`git push origin feature/minha-feature`).
5. Abra um **Pull Request**.

Por favor, siga as boas práticas de código e mantenha a consistência com o estilo existente.
