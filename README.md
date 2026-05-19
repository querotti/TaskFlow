# TaskFlow

TaskFlow e um projeto full stack iniciante para organizar tarefas, acompanhar progresso e registrar prioridades do dia. Ele foi criado para ser simples de rodar, facil de entender e bom para demonstrar fundamentos de frontend, backend e API REST em um portfolio.

Desenvolvido por [Murilo Querotti](https://github.com/querotti).

## Preview

- Dashboard com resumo de tarefas.
- Lista com filtros por status.
- Formulario para criar novas tarefas.
- Atualizacao de status e exclusao.
- Persistencia em arquivo JSON no backend.

## Tecnologias

- HTML5
- CSS3
- JavaScript
- Node.js
- API REST sem dependencias externas

## Como Rodar

1. Instale o Node.js 18 ou superior.
2. Clone o repositorio.
3. Na pasta do projeto, execute:

```bash
npm start
```

4. Acesse:

```text
http://localhost:3000
```

## Rotas Da API

| Metodo | Rota | Descricao |
| --- | --- | --- |
| GET | `/api/tasks` | Lista todas as tarefas |
| POST | `/api/tasks` | Cria uma nova tarefa |
| PATCH | `/api/tasks/:id` | Atualiza uma tarefa |
| DELETE | `/api/tasks/:id` | Remove uma tarefa |

## Estrutura

```text
taskflow-portfolio/
  data/
    tasks.json
  public/
    index.html
    styles.css
    app.js
  server.js
  package.json
  README.md
```

## Ideias Para Evoluir

- Login de usuarios.
- Banco de dados SQLite ou PostgreSQL.
- Deploy no Render, Railway ou Vercel com backend separado.
- Testes automatizados.
- Edicao completa das tarefas.

## Licenca

MIT

Todos os direitos reservados para Murilo Querotti.
