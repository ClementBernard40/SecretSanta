const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const jwtMiddleware = require('../middlewares/jwtMiddleware');




    router
    .route('/create')
        .post(jwtMiddleware.verifyToken,groupController.createAgroup);

    router
      .route('/:id_group')
        .delete(jwtMiddleware.verifyToken,groupController.deleteAGroup)
        .put(jwtMiddleware.verifyToken,groupController.updateAGroup);

    router
        .route('/getAllGroup')
        .get(groupController.getAllGroup);

    router
      .route('/getUserGroup')
        .get(jwtMiddleware.verifyToken,groupController.getUserGroup);

        router
        .route('/:id_group/info')
          .get(jwtMiddleware.verifyToken,groupController.groupInfo);
  
    router
        .route('/:id_group/invite')
        .post(groupController.invite);

        router
        .route('/:id_group/invite/accept')
        .post(groupController.invite);
    
  


module.exports = router;
