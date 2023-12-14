const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const jwtMiddleware = require('../middlewares/jwtMiddleware');




router
    .route('/create')
        .post(jwtMiddleware.verifyToken,groupController.createAgroup);

    router
      .route('/:id_group')
        .delete(jwtMiddleware.verifyToken,groupController.deleteAGroup);




module.exports = router;
