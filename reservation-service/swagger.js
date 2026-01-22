const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: "Reservation Service API",
    description: "Gestão de Reservas de Alojamentos - Grupo 8",
    version: "1.0.0"
  },
  host: "localhost:3004",
  basePath: "/",
  schemes: ["http"],
  securityDefinitions: {
    bearerAuth: {
      type: 'apiKey',
      name: 'Authorization',
      scheme: 'bearer',
      in: 'header',
      description: "Insira o token JWT no formato: Bearer <seu_token>"
    }
  },
  definitions: {
    ReservaRequest: {
      alojamento_id: 1,
      data_inicio: "2026-06-01",
      data_fim: "2026-06-15",
      observacoes: "Pedido de quarto em andar alto, se possível."
    },

    UpdateStatusRequest: {
      status: "confirmado"
    },

    UpdatePagamentoRequest: {
      pagamento_status: "pago" 
    }
  }
};

const outputFile = './swagger-output.json';
const endpointsFiles = ['./index.js']; 

swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
    console.log("Ficheiro swagger-output.json gerado com sucesso!");
});