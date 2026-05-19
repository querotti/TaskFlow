# TaskFlow

TaskFlow e um projeto full stack para organizar tarefas, acompanhar progresso e registrar prioridades do dia. Ele foi criado para ser simples de rodar, facil de entender e bom para demonstrar fundamentos de frontend, backend e API REST.

Desenvolvido por [Murilo Querotti](https://github.com/querotti).

## Preview

- Dashboard com resumo de tarefas.
- Lista com filtros por status.
- Formulario para criar novas tarefas.
- Atualizacao de status e exclusao.
- Persistencia em arquivo JSON no backend.

## Stacks

- HTML5
- CSS3
- JavaScript
- Node.js
- API REST sem dependencias externas

## Rotas Da API

| Metodo | Rota | Descricao |
| --- | --- | --- |
| GET | `/api/tasks` | Lista todas as tarefas |
| POST | `/api/tasks` | Cria uma nova tarefa |
| PATCH | `/api/tasks/:id` | Atualiza uma tarefa |
| DELETE | `/api/tasks/:id` | Remove uma tarefa |

## Licenca

MIT

Todos os direitos reservados para Murilo Querotti.
