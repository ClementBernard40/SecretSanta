const express = require('express');
const app = express();
const port = 3000;
const host = '0.0.0.0';

const mongoose = require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/SecretSanta");

app.use(express.urlencoded());
app.use(express.json());


const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger');
const swaggerJSDoc = require('swagger-jsdoc');


const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
      title: 'Secret Santa API',
      version: '1.0.0',
      description:
        'This is a REST API application made with Express. It retrieves data from a Secret Santa between friends.',
      license: {
        name: 'Licensed Under MIT',
        url: 'https://spdx.org/licenses/MIT.html',
      },
      contact: {
        name: 'JSONPlaceholder',
        url: 'https://jsonplaceholder.typicode.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
  };

const options = {
  swaggerDefinition,
  // Paths to files containing OpenAPI definitions
  apis: ['./routes/*.js'],
};

app
const swaggerSpec = swaggerJSDoc(options);
app.use('/api-docs', swaggerUi.serve);
app.get('/api-docs', swaggerUi.setup(swaggerSpec));



const groupRoute = require('./routes/groupRoute');
const userRoute = require('./routes/userRoute');
const santaRoute = require('./routes/santaRoute');


app.use('/group', groupRoute);
app.use('/users', userRoute);
app.use('/', santaRoute);



app.listen(port, host);