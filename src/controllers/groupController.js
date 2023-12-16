require('dotenv').config;
const Group = require('../models/groupModel');
const User = require('../models/userModel');
const UserTemp = require('../models/userTempModel');

const generator = require('generate-password');

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
    let leader_id = payload.id

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
        if (!group) {
            res.status(404).send("Group not found");
        } else {
            const group = await Group.findById(groupId);
            return group;
        }
    } catch (error) {
        console.log(error);
        return null; // ou gérer l'erreur de manière appropriée
    }
}



exports.groupInfo = async (req, res) => {
    const token = req.headers['authorization'];

    let payload = jwtMiddleware.decode(token);
    let user_id = payload.id;

    try {
        const groupId = req.params.id_group;
        const group = await Group.findById(groupId);

        if (!group) {
            res.status(404).json({ message: "Group not found" });
            return;
        }

        const group_user = group.users_in_group;

        for (const userid of group_user) {
            if (user_id == userid) {
                res.status(200).json(group);
                return; // Ajoutez le return ici pour éviter de poursuivre la boucle inutilement
            }
        }

        // Si l'utilisateur n'est pas dans le groupe
        res.status(403).json({ message: "you are not in this group" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
};



exports.invite = async (req, res) => {
    const token = req.headers['authorization'];
    let payload = jwtMiddleware.decode(token);

    if (!payload) {
        res.status(403).json({ message: "Token invalide" });
        return;
    }

    let user_id = payload.id;
    let email = req.body.email;

    const invitData = {
        idGroup: req.params.id_group,
        email: email
    };

    try {
        const groupId = req.params.id_group;
        const group = await Group.findById(groupId);

        if (!group) {
            res.status(404).json({ message: "Groupe non trouvé" });
            return;
        }

        const group_user = group.users_in_group;
        const name_invited = req.body.name;

        for (const userid of group_user) {
            if (user_id == userid) {
                if (!name_invited) {
                    res.status(400).json({ message: "Nom introuvable" });
                    return;
                }

                var password = generator.generate({
                    length: 10,
                    numbers: true
                });

                try {
                    // Recherche de l'utilisateur dans la base de données
                    const testuser = await User.findOne({ email: email });
                    const testuserTemp = await UserTemp.findOne({ email: email });

                    // test si l'utilisateur existe déjà dans la base de données
                    if (testuser) {

                        const testuser_id = testuser._id;

                        // Vérification si l'utilisateur est déjà dans le groupe
                        if (group_user.includes(testuser_id)) {
                            res.status(200).json({ message: "L'utilisateur est déjà dans ce groupe" });
                            return;
                        }

                        // Création du token d'invitation
                        const groupData = {
                            user_invited: testuser._id
                        };
                        await Group.findByIdAndUpdate(
                            req.params.id_group,
                            { $set: groupData },
                            { new: true } // Retourne le document modifié
                        );
                        const tokenInvit = await jwt.sign(invitData, process.env.JWT_KEY, { expiresIn: '48h' });
                        res.status(200).json({ tokenInvit });
                    
                    //test si user deja invité
                    } else if (testuserTemp) {
                        res.status(403).json({ message: "L'utilisateur a deja été invité" });
                    }else {
                        // L'utilisateur n'existe pas, vous pouvez continuer avec la création d'un nouvel utilisateur temporaire
                        let newUser = new UserTemp({ email: email, name: name_invited, password: password });
                        const userTemp = await newUser.save();

                        const groupData = {
                            userTemp_invited: userTemp._id
                        };
                        await Group.findByIdAndUpdate(
                            req.params.id_group,
                            { $set: groupData },
                            { new: true } // Retourne le document modifié
                        );

                        const tokenInvit = await jwt.sign(invitData, process.env.JWT_KEY, { expiresIn: '48h' });
                        res.status(201).json({ message: "Utilisateur temporaire créé avec succès, voici son token d'invitation", tokenInvit });
                    }
                } catch (error) {
                    console.log(error);
                    res.status(500).json({ message: "Erreur serveur (db)" });
                }
                return; // Ajoutez le return ici pour éviter de poursuivre la boucle inutilement
            }
        }

        // Si l'utilisateur n'est pas dans le groupe
        res.status(403).json({ message: "Vous n'êtes pas dans ce groupe" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Erreur serveur interne" });
    }
};

exports.accept = async (req, res) => {
    const token = req.headers['invitation'];
    let payload = jwtMiddleware.decode(token);

    const group_id = payload.idGroup
    const emailUser = payload.email
    console.log(payload)
    console.log(group_id)
    console.log(emailUser)

    const group = await Group.findById(group_id);
    let is_temp = 2;
    const group_userTemp = group.userTemp_invited



    let usertemp = await UserTemp.findOne({ email: emailUser });

    if (!usertemp) {
        usertemp = await User.findOne({ email: emailUser });

    }
    let is_accepted = req.body.is_accepted

    console.log(usertemp)
        // si dans c'est un usertemp
        if (group_userTemp.includes(usertemp._id)) {
             is_temp = 1;
        } else {
             is_temp = 0
        }

    //si il a refusé :
    
    if (is_accepted == 0) {
        if (is_temp == 1) {
            await Group.updateOne(
                { _id: group_id },
                { $pull: { userTemp_invited: usertemp._id } })
                await UserTemp.deleteOne({ email: emailUser });
                res.status(200).json({ message: "invitation refusé" });

        } else {
            await Group.updateOne(
                { _id: group_id },
                { $pull: { user_invited: usertemp._id } })
                res.status(200).json({ message: "invitation refusé" });
        }
        
    } else if (is_accepted == 1) {     //si il a accepté : 
        if (is_temp == 1) {
            let newUser = new User({ email: usertemp.email, name: usertemp.name, password: usertemp.password });

            await Group.updateOne(
                { _id: group_id },
                { $pull: { userTemp_invited: usertemp._id } })
            await Group.updateOne(
                { _id: group_id },
                { $push: { users_in_group: newUser._id } })
            await UserTemp.deleteOne({ email: emailUser });
            res.status(200).json({ message: "invitation accepté" });

        } else {
            await Group.updateOne(
                { _id: group_id },
                { $pull: { user_invited: usertemp._id } })
                await Group.updateOne(
                    { _id: group_id },
                    { $push: { users_in_group: usertemp._id } })
                res.status(200).json({ message: "invitation accepté" });

        }


    } else {
        res.status(400).json({ message: "enter 0 for decline and 1 for accept" });

    }


}
