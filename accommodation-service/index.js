const express = require('express');
const cors = require('cors');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const jwt = require('jsonwebtoken');

const db = require('./config/db');
const alojamentoRoutes = require('./routes/alojamentoRoutes');
const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers');

const JWT_SECRET = process.env.JWT_SECRET || 'segredo_super_secreto';

const app = express();
app.use(express.json());
app.use(cors());

// Rotas REST existentes
app.use('/accommodations', alojamentoRoutes);

// Função para extrair user do token
const getUser = (token) => {
    if (!token) return null;
    try {
        // Remove "Bearer " se existir
        const cleanToken = token.replace('Bearer ', '');
        return jwt.verify(cleanToken, JWT_SECRET);
    } catch (err) {
        return null;
    }
};

// Função para tentar conectar à BD com retry
async function connectDB() {
    let retries = 10;
    while (retries > 0) {
        try {
            await db.authenticate();
            console.log("Base de dados conectada!");
            await db.sync({ alter: true });
            console.log("Base de dados sincronizada!");
            
            // Configurar Apollo Server (GraphQL)
            const apolloServer = new ApolloServer({
                typeDefs,
                resolvers,
            });
            
            await apolloServer.start();
            console.log("GraphQL Server iniciado!");
            
            // Middleware GraphQL com contexto de autenticação
            app.use('/graphql', expressMiddleware(apolloServer, {
                context: async ({ req }) => {
                    const token = req.headers.authorization || '';
                    const user = getUser(token);
                    return { user };
                }
            }));
            
            app.listen(3002, () => {
                console.log("A correr na porta 3002");
                console.log("REST API: http://localhost:3002/accommodations");
                console.log("GraphQL:  http://localhost:3002/graphql");
            });
            return;
        } catch (err) {
            retries--;
                console.error(`Aguardando a base de dados... (tentativas restantes: ${retries}) ${err}`);
            await new Promise(resolve => setTimeout(resolve, 3000)); // Aguarda 3 segundos
        }
    }
    console.error("Erro ao conectar à base de dados após 10 tentativas");
    process.exit(1);
}
connectDB();
