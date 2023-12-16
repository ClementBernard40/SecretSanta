const express = require('express');
const router = express.Router();
const santaController = require('../controllers/santaController');
const jwtMiddleware = require('../middlewares/jwtMiddleware');




    router
      .route('/santa/:id_group')
        .post(jwtMiddleware.verifyToken,santaController.startSanta);
  
    router
      .route('/santa/assignments/:id_group')
        .get(jwtMiddleware.verifyToken, santaController.getUserAssignment)

    router
      .route('/santa/allAssignments/:id_group')
        .get(jwtMiddleware.verifyToken, santaController.getAllAssignments);




module.exports = router;
