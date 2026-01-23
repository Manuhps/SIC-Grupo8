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

  # Queries (leitura de dados)
  type Query {
    # Obter todos os alojamentos (público)
    alojamentos: [Alojamento!]!
    
    # Obter um alojamento por ID (público)
    alojamento(id: ID!): Alojamento
    
    # Filtrar alojamentos por zona (público)
    alojamentosPorZona(zona: String!): [Alojamento!]!
    
    # Filtrar alojamentos por tipo (público)
    alojamentosPorTipo(tipo: String!): [Alojamento!]!
    
    # Obter meus alojamentos (requer autenticação)
    meusAlojamentos: [Alojamento!]!
  }

  # Mutations (escrita de dados)
  type Mutation {
    # Criar novo alojamento (requer autenticação de proprietário)
    createAlojamento(input: CreateAlojamentoInput!): Alojamento!
    
    # Atualizar alojamento (requer autenticação)
    updateAlojamento(id: ID!, input: UpdateAlojamentoInput!): Alojamento
    
    # Apagar alojamento (requer autenticação)
    deleteAlojamento(id: ID!): Boolean!
  }
`;

module.exports = typeDefs;
