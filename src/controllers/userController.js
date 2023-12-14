require('dotenv').config;
// console.log(process.env.JWT_KEY);
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const saltRounds = 10;

exports.userRegister = async (req, res) => {
    try {
        let newUser = new User(req.body);
        let userPwd = newUser.password;

        let salt = await bcrypt.genSalt(saltRounds);

        let hash = await bcrypt.hash(userPwd, salt);

        newUser.password = hash;

        let user = await newUser.save();
        res.status(201).json({ message: `User créé: ${user.email}` });
    } catch (error) {
        console.error(error);
        res.status(401).json({ message: 'Requête invalide' });
    }
};


exports.userLogin = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            res.status(500).json({ message: 'Utilisateur non trouvé' });
            return;
        }

        const passwordMatch = await bcrypt.compare(req.body.password, user.password);

        if (passwordMatch) {
            const userData = {
                id: user._id,
                email: user.email,
                role: 'admin'
            };
            
            console.log(process.env.JWT_KEY)

            const token = await jwt.sign(userData, process.env.JWT_KEY, { expiresIn: '10h' });
            res.status(200).json({ token });
        } else {
            res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Une erreur s\'est produite lors du traitement.' });
    }
};



exports.deleteAUser = async (req,res) => {
    try {
        await User.findByIdAndDelete(req.params.id_users);
        res.status(202);
        res.json({message: "user supprimé"});
    } catch (error) {
        res.status(500);
        console.log(error);
        res.json({message: "Erreur serveur."});
    }

}



exports.updateAUser = async (req, res) => {
    try {
        const userUpdate = req.body;

        // Si le mot de passe est présent dans la mise à jour go le hasher
        if (userUpdate.password) {
            const salt = await bcrypt.genSalt(10);
            userUpdate.password = await bcrypt.hash(userUpdate.password, salt);
        }

        const user = await User.findByIdAndUpdate(
            req.params.id_users,
            { $set: userUpdate },
            { new: true } // Retourne le document modifié
        );

        if (!user) {
            res.status(404).json({ message: 'Utilisateur non trouvé' });
            return;
        }

        res.status(203).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};
