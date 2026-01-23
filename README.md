# SIC Projeto Grupo 8 - Microserviços

## Descrição
Projeto de microserviços para gestão de alojamentos, eventos, reservas, avaliações e autenticação, usando Node.js, Python (FastAPI), MySQL, Docker Compose e Docker Swarm.

---

## Estrutura dos Serviços
- **auth-service**: Autenticação e gestão de utilizadores (Node.js)
- **accommodation-service**: Gestão de alojamentos (Node.js)
- **events-service**: Gestão de eventos e inscrições (Python/FastAPI)
- **reservation-service**: Gestão de reservas (Node.js)
- **review-service**: Gestão de avaliações (Node.js)
- **api-gateway**: Ponto único de entrada para todos os serviços (Node.js)

---

## Como correr o projeto

### 1. Pré-requisitos
- Docker Desktop instalado e a correr
- (Opcional) Node.js e Python 3.10+ para desenvolvimento local

### 2. Clonar o repositório
```sh
git clone <url-do-repo>
cd sic-projeto-grupo8
```

### 3. Construir as imagens dos serviços
Para cada serviço Node.js e Python:
```sh
cd <nome-do-serviço>
docker build -t sic-projeto-grupo8_<nome-do-serviço>:latest .
cd ..
```
Exemplo:
```sh
cd auth-service
...build...
cd ..
```

### 4. Subir todos os serviços com Docker Swarm
```sh
docker stack deploy -c docker-stack.yml grupo8
```

### 5. Verificar serviços
```sh
docker service ls
```

### 6. Testar escalabilidade (opcional)
```sh
docker service scale grupo8_accommodation-service=3
```

### 7. Remover todos os serviços
```sh
docker stack rm grupo8
```

---

## API Gateway
- Disponível em: `http://localhost:3000`
- Todas as rotas dos microserviços passam pelo gateway

---
