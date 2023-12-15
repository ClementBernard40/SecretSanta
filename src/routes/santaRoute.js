const express = require('express');
const router = express.Router();
const santaController = require('../controllers/groupController');
const jwtMiddleware = require('../middlewares/jwtMiddleware');




    router
    .route('/santa/:id_group')
        .post(jwtMiddleware.verifyToken,santaController.startSanta);
  


module.exports = router;
