# Secret Santa API

This is a REST API application made with Express that facilitates Secret Santa between friends.


## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/votre-utilisateur/votre-projet.git
   cd votre-projet```

2. Install dependencies:

    ```bash
    npm install
    ```


## Configuration

1. Create a .env file in the root directory and add the following:

    JWT_KEY='PutAnything'

2. conenct your database in the app.js

    mongoose.connect("mongodb://127.0.0.1:27017/SecretSanta");
    Adjust the MongoDB URI as needed.


## Usage

    Start the server : 

    ```bash
    npm start
    ```

    The server will run at http://localhost:3000.


## Documentation

You can access it at import in postman "Secret Santa.postman_collection.json" in the "doc" folder.


## Routes

* **/group**: Group-related routes
* **/users**: User-related routes
* **/**: Secret Santa-related routes


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
