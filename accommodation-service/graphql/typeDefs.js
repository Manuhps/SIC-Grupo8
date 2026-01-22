const typeDefs = `#graphql
  # Tipo Alojamento
  type Alojamento {
    id: ID!
    nome: String!
    descricao: String!
    precoBase: Float!
    zona: String!
    tipo: String!
    imagem: String
    proprietario_id: Int!
    createdAt: String
    updatedAt: String
  }

  # Input para criar alojamento
  input CreateAlojamentoInput {
    nome: String!
    descricao: String!
    precoBase: Float!
    zona: String!
    tipo: String!
    imagem: String
  }

  # Input para atualizar alojamento
  input UpdateAlojamentoInput {
    nome: String
    descricao: String
    precoBase: Float
    zona: String
    tipo: String
    imagem: String
  }

  # Queries (leitura)
  type Query {
    # Buscar todos os alojamentos
    alojamentos: [Alojamento!]!
    
    # Buscar alojamento por ID
    alojamento(id: ID!): Alojamento
    
    # Buscar alojamentos por zona
    alojamentosPorZona(zona: String!): [Alojamento!]!
    
    # Buscar alojamentos por tipo
    alojamentosPorTipo(tipo: String!): [Alojamento!]!
    
    # Buscar alojamentos de um proprietário
    meusAlojamentos: [Alojamento!]!
  }

  # Mutations (escrita)
  type Mutation {
    # Criar novo alojamento (requer autenticação - proprietário)
    createAlojamento(input: CreateAlojamentoInput!): Alojamento!
    
    # Atualizar alojamento (requer autenticação - proprietário do alojamento)
    updateAlojamento(id: ID!, input: UpdateAlojamentoInput!): Alojamento!
    
    # Apagar alojamento (requer autenticação - proprietário ou admin)
    deleteAlojamento(id: ID!): Boolean!
  }
`;

module.exports = typeDefs;
