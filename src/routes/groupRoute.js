const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const jwtMiddleware = require('../middlewares/jwtMiddleware');




    router
    .route('/create') //route to create a group
        .post(jwtMiddleware.verifyToken,groupController.createAgroup);

    router
      .route('/:id_group')
        .delete(jwtMiddleware.verifyToken,groupController.deleteAGroup) //route to delete a group (only leader of the group)
        .put(jwtMiddleware.verifyToken,groupController.updateAGroup);//route to update a group (only leader of the group)

    router
        .route('/getAllGroup') //route to get a list of all the groups
        .get(groupController.getAllGroup);

    router
      .route('/getUserGroup') //route to get a list of the user's groups
        .get(jwtMiddleware.verifyToken,groupController.getUserGroup);

        router
        .route('/:id_group/info') //route to get informations about a group (only leader of the group)
          .get(jwtMiddleware.verifyToken,groupController.groupInfo);
  
    router
        .route('/:id_group/invite')
        .post(jwtMiddleware.verifyToken,groupController.invite); //route to invite people in the group

        router
        .route('/accept')
        .post(jwtMiddleware.verifyTokenInvitation,groupController.accept); //route to accept of decline an invitation
    
  


module.exports = router;
