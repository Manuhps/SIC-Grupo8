const swaggerAutogen = require("swagger-autogen")();

const doc = {
  info: {
    title: "Auth Service API",
    description: "Serviço de Autenticação e Gestão de Utilizadores",
  },
  host: "localhost:3001",
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
    LoginRequest: {
      email: "tiago@mail.com",
      password: "123"
    },
    RegisterRequest: {
      username: "Tiago",
      email: "tiago@mail.com",
      password: "123",
      tipo: "estudante" 
    },
    UpdateMeRequest: {
      username: "Novo Nome",
      email: "novo@mail.com"
    },
    BanRequest: {
      isBanned: true
    }
  }
};

const outputFile = "./swagger-output.json";
const endpointsFiles = ["./index.js"]; 

swaggerAutogen(outputFile, endpointsFiles, doc);