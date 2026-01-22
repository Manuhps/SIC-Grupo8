const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: "Review Service API",
    description: "Sistema de Avaliações (Alojamentos e Eventos) - Grupo 8",
    version: "1.0.0"
  },
  host: "localhost:3005",
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
    ReviewAlojamento: {
      alojamento_id: 1,
      pontuacao: 5,
      comentario: "Estadia fantástica, muito limpo!"
    },
    ReviewEvento: {
      evento_id: 1,
      pontuacao: 4,
      comentario: "Evento muito bem organizado."
    }
  }
};

const outputFile = './swagger-output.json';
const endpointsFiles = ['./index.js']; 

swaggerAutogen(outputFile, endpointsFiles, doc);