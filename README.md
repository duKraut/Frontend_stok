# stok — Frontend

> Interface web do sistema **Stok**, desenvolvida com Angular para gerenciamento de patrimônio, almoxarifado e fornecedores.

---

## Tecnologias

| Tecnologia | Versão |
|---|---|
| Angular | 21.1.0 |
| TypeScript | 5.9 |
| Node.js | 20+ |
| npm | 11.8.0 |
| pdfmake | 0.3.11 |
| RxJS | 7.8 |

---

## Pré-requisitos

- **Node.js 20+** — [Instalar](https://nodejs.org/)
- **npm 11+** — incluído com o Node.js
- **Angular CLI 21** — instalado automaticamente via `npx` ou globalmente:

```bash
npm install -g @angular/cli@21
```

- **Backend rodando** em `http://localhost:8080` — veja o README do repositório `stok-backend` [clicando aqui](https://github.com/duKraut/backend-stok)

---

## Instalação

```bash
# Clone o repositório
git clone https://github.com/duKraut/Frontend_stok.git
cd Frontend_stok

# Instale as dependências
npm install
```

---

## Como rodar

### Modo desenvolvimento

```bash
npm start
# ou
ng serve
```

A aplicação estará disponível em **`http://localhost:4200`**.

> A aplicação recarrega automaticamente ao salvar qualquer arquivo fonte.

### Build para produção

```bash
npm run build
```

Os arquivos compilados são gerados em `dist/`. Para servir em produção, use um servidor web como Nginx ou Apache apontando para essa pasta.

---

## Primeiro acesso

Com o backend rodando, acesse `http://localhost:4200` e faça login com as credenciais padrão:

| Campo | Valor |
|---|---|
| E-mail | `admin@stok.com` |
| Senha | `Admin@123` |

---

## Módulos e telas

| Rota | Módulo | Descrição | Acesso |
|---|---|---|---|
| `/login` | Login | Autenticação | Público |
| `/dashboard` | Dashboard | Gráficos de entradas/saídas e resumo de bens | Qualquer usuário |
| `/suppliers` | Fornecedores | Listagem, cadastro e edição de fornecedores | Módulo FORNECEDORES |
| `/assets` | Patrimônio | Listagem e cadastro de bens patrimoniais | Módulo PATRIMONIO |
| `/assets/movements` | Patrimônio | Transferências, manutenções e baixas de bens | Módulo PATRIMONIO |
| `/inventory` | Almoxarifado | Listagem e cadastro de itens de estoque | Módulo ALMOXARIFADO |
| `/inventory/movements` | Almoxarifado | Entradas e saídas de estoque | Módulo ALMOXARIFADO |
| `/reports` | Relatórios | Geração de relatórios em PDF | Módulo RELATORIOS |
| `/configs` | Configurações | Gerenciamento de usuários e permissões | Somente Administrador |
| `/profile` | Perfil | Alteração de e-mail e senha do usuário logado | Qualquer usuário |

---

## Perfis e permissões

| Perfil | Visualizar | Criar/Editar | Desativar | Gerenciar usuários |
|---|---|---|---|---|
| **Administrador** | ✅ | ✅ | ✅ | ✅ |
| **Gerente** | ✅ | ✅ | ✅ | ❌ |
| **Operador** | ✅ | ✅ | ❌ | ❌ |
| **Visualizador** | ✅ | ❌ | ❌ | ❌ |

> O acesso a cada módulo é controlado individualmente pelo Administrador na tela de Configurações.

---

## Estrutura do projeto

```
src/app/
├── core/
│   ├── components/        # Header e Sidebar (compartilhados)
│   ├── guards/            # AuthGuard (login) e ModuleGuard (permissão de módulo)
│   ├── interceptors/      # AuthInterceptor — injeta o JWT em todas as requisições
│   └── services/          # AuthService, HeaderService
├── features/
│   ├── login/             # Tela de login e recuperação de senha
│   ├── dashboard/         # Gráficos e resumo
│   ├── suppliers/         # Fornecedores
│   ├── assets/            # Patrimônio (bens e movimentações)
│   ├── inventory/         # Almoxarifado (itens e movimentações)
│   ├── reports/           # Relatórios PDF
│   ├── configs/           # Gerenciamento de usuários
│   └── profile/           # Perfil do usuário logado
├── layouts/
│   └── private-layout/    # Layout com sidebar e header (telas autenticadas)
└── shared/                # Componentes e pipes compartilhados
```

---

## Autenticação

- O token JWT é armazenado no `localStorage` após o login.
- O `AuthInterceptor` injeta o header `Authorization: Bearer <token>` em todas as requisições HTTP.
- O `AuthGuard` redireciona para `/login` caso o usuário não esteja autenticado.
- O `ModuleGuard` verifica se o usuário tem permissão para acessar o módulo da rota.

---

## Variável de ambiente (URL do backend)

A URL base da API está configurada no `AuthService` (`src/app/core/services/auth.service.ts`). Se o backend rodar em uma porta ou host diferente, altere a constante `API_URL` nesse arquivo.

```typescript
private readonly API_URL = 'http://localhost:8080';
```
