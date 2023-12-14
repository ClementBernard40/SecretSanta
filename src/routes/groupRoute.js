const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const jwtMiddleware = require('../middlewares/jwtMiddleware');




router
    .route('/create')
        .post(jwtMiddleware.verifyToken,groupController.createAgroup);






module.exports = router;
