const express = require('express');
const router = express.Router();
const santaController = require('../controllers/santaController');
const jwtMiddleware = require('../middlewares/jwtMiddleware');




    router
      .route('/santa/:id_group')
        .post(jwtMiddleware.verifyToken,santaController.startSanta); //route to launch the draw for secret santa members
  
    router
      .route('/santa/assignments/:id_group')
        .get(jwtMiddleware.verifyToken, santaController.getUserAssignment) //route to see who a user owes a gift to 

    router
      .route('/santa/allAssignments/:id_group')
        .get(jwtMiddleware.verifyToken, santaController.getAllAssignments); // route to get the list ao all the assignments (leader group only)




module.exports = router;
