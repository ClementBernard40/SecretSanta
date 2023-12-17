# Secret Santa API

This is a REST API application made with Express that facilitates Secret Santa between friends.


## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/ClementBernard40/SecretSanta.git
   cd SecretSanta```

2. Install dependencies:

    ```bash
    npm install
    ```


## Configuration

1. Create a .env file in the root directory and add the following:

    ```bash
    JWT_KEY='PutAnything'
    ```


2. conenct your database in the app.js

    ```bash
    mongoose.connect("mongodb://127.0.0.1:27017/SecretSanta");
    ```
    
    Adjust the MongoDB URI as needed.


## Usage
    Start the server : 

    npm start


    The server will run at http://localhost:3000.


## Documentation

You can access it at import in postman "Secret Santa.postman_collection.json" in the "doc" folder.

I tried to do it with swagger but not being successful I exported the Postman collection to you

## Routes

* **/group**: Group-related routes
    * **/group/create** 
       * *POST* : Create a group (name)
    * **/group/:id_group**
       * *DELETE* : Delete a group (only leader of the group)(have to be logged)
       * *PUT* : Update a group (only leader of the group)(have to be logged)
    * **/group/getAllGroup** 
       * *GET* : Get a list of all the groups
    * **/group/getUserGroup** 
       * *GET* : Get a list of the user\'s groups (have to be logged)
    * **/group/:id_group/info** 
       * *GET* : Get informations about a group (only leader of the group)(have to be logged)
    * **/group/:id_group/invite** 
        * *POST* : Invite people in the group (email,name)(have to be logged)
    * **/group/accept** 
        * *POST* : Accept of decline an invitation (0 to decline, 1 to accept)(need invitation)
* **/users**: User-related routes
    * **/user/register**
        * *POST* : Create a user (email, name, password)
    * **/user/login**
        * *POST* : Log a user (email, password)
    * **/user/allUsers**
        * *GET* : Get the list of all users in the database
    * **/user/:id_users**
        * *DELETE* : Delete a user (have to be logged)
        * *UPDATE* : Update a user (have to be logged)
* **/**: Secret Santa-related routes
    * **/santa/:id_group**
        * *POST* : launch the draw for secret santa members (only leader of the group)(have to be logged)
    * **/santa/assignments/:id_group**
        * *GET* : see who a user owes a gift to (have to be logged)
    * **/santa/allAssignments/:id_group**
        * *GET* : get the list ao all the assignments (leader group only)(have to be logged)



## Dependencies

* **bcrypt**: ^5.1.1
* **dotenv**: ^16.3.1
* **express**: ^4.18.2
* **generate-password**: ^1.7.1
* **jsonwebtoken**: ^9.0.2
* **mongoose**: ^8.0.3
* **nodemon**: ^3.0.2
* **swagger-jsdoc**: ^6.2.8
* **swagger-ui-express**: ^5.0.0
