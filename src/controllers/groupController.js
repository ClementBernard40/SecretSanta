require('dotenv').config;
const Group = require('../models/groupModel');
const jwt = require('jsonwebtoken');
const jwtMiddleware = require('../middlewares/jwtMiddleware');


exports.createAgroup = async (req, res) => {

    const token = req.headers['authorization'];

    let payload = jwtMiddleware.decode(token)
    user_id = payload.id
    console.log(payload)
    console.log(user_id)
    const newGroup = new Group({...req.body, id_leader: user_id});
    console.log(req.body)

    try {

        let group = await newGroup.save();
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
                res.status(204).json({ message: "Group deleted" });
            } else {
                res.status(403).send("You are not the leader");
            }
        }
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
}