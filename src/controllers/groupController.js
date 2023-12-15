require('dotenv').config;
const Group = require('../models/groupModel');
const User = require('../models/userModel');

const jwt = require('jsonwebtoken');
const jwtMiddleware = require('../middlewares/jwtMiddleware');


exports.createAgroup = async (req, res) => {

    const token = req.headers['authorization'];

    let payload = jwtMiddleware.decode(token)
    user_id = payload.id
    const newGroup = new Group({...req.body, id_leader: user_id, users_in_group: user_id});
    try {

        let group = await newGroup.save();  
        await User.updateMany({ '_id': newGroup.users_in_group }, { $push: { user_group: newGroup._id } });
        res.status(201).json({ message: `group has been created: ${group.name}` });
    } catch (error) {
        console.error(error);
        res.status(401).json({ message: 'Requête invalide' });
    }

};


exports.deleteAGroup = async (req,res) => {

    const token = req.headers['authorization'];

    let payload = jwtMiddleware.decode(token)
    leader_id = payload.id
    console.log(payload)
    console.log(leader_id)

    try {
        const group =  await Group.findById(req.params.id_group);
    
console.log(group)
        if (!group) {
            res.status(404).send("Group not found");
        } else {
            if (leader_id == group.id_leader) {
                await Group.findByIdAndDelete(req.params.id_group);
                res.status(201).json({ message: `group has been deleted` });
                // ca s'affiche pas jsp pq
            } else {
                res.status(403).send("You are not the leader");
            }
        }
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
}



exports.updateAGroup = async (req, res) => {
    try {
        const groupUpdate = req.body;

        const group = await Group.findByIdAndUpdate(
            req.params.id_group,
            { $set: groupUpdate },
            { new: true } // Retourne le document modifié
        );

        if (!group) {
            res.status(404).json({ message: 'Group not find' });
            return;
        }

        res.status(203).json(group);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};


exports.getAllGroup = async (req,res) => {

    try {
        const groups = await Group.find();
        res.status(200);
        res.json(groups);
    } catch (error) {
        res.status(500);
        console.log(error);
        res.json({message: "Erreur serveur."});
    }
}


exports.getUserGroup = async (req, res) => {
    const token = req.headers['authorization'];
    let payload = jwtMiddleware.decode(token);
    const userid = payload.id;

    try {
        const user = await User.findById(userid);
        console.log(user);

        const userGroup = user.user_group;
        console.log(userGroup);

        // Utiliser Promise.all pour effectuer les requêtes de manière asynchrone
        const groupPromises = userGroup.map(groupId => getAGroupById(groupId));

        // Attendre que toutes les requêtes soient terminées
        const groups = await Promise.all(groupPromises);

        res.status(200).json(groups);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur." });
    }
};

// Fonction pour obtenir un groupe par ID
async function getAGroupById(groupId) {
    try {
        const group = await Group.findById(groupId);
        return group;
    } catch (error) {
        console.log(error);
        return null; // ou gérer l'erreur de manière appropriée
    }
}
