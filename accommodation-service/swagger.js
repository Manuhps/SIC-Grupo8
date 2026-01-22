const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: "Accommodation Service API",
    description: "Gestão de Alojamentos - Grupo 8",
  },
  host: "localhost:3002",
  schemes: ["http"],
  securityDefinitions: {
    bearerAuth: {
      type: 'apiKey',
      name: 'Authorization',
      scheme: 'bearer',
      in: 'header'
    }
  },
  definitions: {
    AlojamentoRequest: {
      nome: "Apartamento T1 Centro Maia",  // Antes era 'titulo'
      descricao: "Perto do metro e serviços",
      precoBase: 450,                      // Antes era 'preco'
      zona: "Maia",                        // Antes era 'localizacao'
      tipo: "Apartamento"
    }
  }
};

const outputFile = './swagger-output.json';
const endpointsFiles = ['./index.js']; 

swaggerAutogen(outputFile, endpointsFiles, doc);