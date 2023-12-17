const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const jwtMiddleware = require('../middlewares/jwtMiddleware');


/**
 * @openapi
 *  components:
 *    schemas:
 *      User:
 *        type: object
 *        properties:
 *          email:
 *            type: string
 *            description: The email address of the user.
 *          name:
 *            type: string
 *            description: The name of the user.
 *          password:
 *            type: string
 *            description: The password for the user.
 *          created_at:
 *            type: date
 *            description: The date when the user was created.
 */

/**
 * @openapi
 * /users/register:
 *   post:
 *     summary: Register a new user
 *     description: Endpoint to register a new user.
 *     requestBody:
 *       description: User registration details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       '201':
 *         description: User successfully registered
 *       '401':
 *         description: Invalid request
 */


router
    .route('/register') //route to create a user
        .post(userController.userRegister)

router 
    .route("/login") //route to log a user and get his token
        .post(userController.userLogin)

    
    router 
    .route("/allUsers") //route to get the list of all users in the database
        .get(userController.listAllUsers)




router 
    .route("/:id_users")
        .delete(jwtMiddleware.verifyToken,userController.deleteAUser)//route to delete a user
        .put(jwtMiddleware.verifyToken,userController.updateAUser)//route to update a user




module.exports = router;
