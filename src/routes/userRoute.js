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
    .route('/register')
        .post(userController.userRegister)

router 
    .route("/login")
        .post(userController.userLogin)



router 
    .route("/:id_users")
        .delete(jwtMiddleware.verifyToken,userController.deleteAUser)
        .put(jwtMiddleware.verifyToken,userController.updateAUser)




module.exports = router;
