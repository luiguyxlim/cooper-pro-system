# Cooper Pro System

Sistema de gestão de avaliandos e testes de performance física baseado no Teste de Cooper.

## Funcionalidades

- Cadastro e gerenciamento de avaliandos
- Registro de testes de performance (Cooper, VO2 Max, Flexibilidade, Força)
- Avaliações de desempenho com cálculos automáticos
- Interface responsiva e moderna
- PWA (Progressive Web App)

## Tecnologias

- Next.js 14
- TypeScript
- Tailwind CSS
- Supabase
- Shadcn/ui

## Estrutura do Projeto

```
src/
├── app/                 # Páginas da aplicação
├── components/          # Componentes reutilizáveis
├── lib/                 # Utilitários e configurações
│   ├── actions/         # Server actions
│   ├── utils/           # Funções utilitárias
│   ├── supabase.ts      # Cliente Supabase
│   └── types.ts         # Tipos TypeScript
public/                  # Arquivos estáticos
supabase/               # Migrações do banco
```

## Como executar

1. Clone o repositório
2. Instale as dependências: `npm install`
3. Configure as variáveis de ambiente
4. Execute o projeto: `npm run dev`

## Licença

MIT