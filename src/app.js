const express = require('express');
const app = express();
const port = 3000;
const host = '0.0.0.0';

const mongoose = require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/SecretSanta");

app.use(express.urlencoded());
app.use(express.json());

// const swaggerUi = require('swagger-ui-express');
// const swaggerDocument = require('./swagger.json');

// router.use('/api-docs', swaggerUi.serve);
// router.get('/api-docs', swaggerUi.setup(swaggerDocument));





// const postRoute = require('./routes/postRoute');
//const timerRoute = require('./routes/timerRoute');
const userRoute = require('./routes/userRoute');

// app.use('/posts', postRoute);
app.use('/', timerRoute);
app.use('/users', userRoute);


app.listen(port, host);