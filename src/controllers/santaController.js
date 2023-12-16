const Santa = require('../models/santaModel');
const Group = require('../models/groupModel');
const User = require('../models/userModel');


const jwtMiddleware = require('../middlewares/jwtMiddleware');




exports.startSanta = async (req, res) => {
    try {
        const token = req.headers['authorization'];

        let payload = jwtMiddleware.decode(token)
        let leader_id = payload.id
        console.log(req.params.id_group)
        const group = await Group.findById(req.params.id_group);


        if (leader_id == group.id_leader) {

            console.log(req.params.id_group);

            const members = group.users_in_group;
            const santaTest = await Santa.findOne({ group_id: group._id });
            console.log(santaTest)
            if (santaTest) {

                return res.status(400).json({ message: "le tirage a deja été effectué" });

            }else {
                // Vérifiez s'il y a suffisamment de membres pour le tirage au sort
                if (members.length < 2) {
                    return res.status(400).json({ message: "Il doit y avoir au moins deux membres pour le tirage au sort Secret Santa." });
                }

                // Utilisez l'algorithme Fisher-Yates pour mélanger le tableau
                for (let i = members.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [members[i], members[j]] = [members[j], members[i]];
                }

                // Créez des paires de tirage au sort
                const pairs = [];
                for (let i = 0; i < members.length; i++) {
                    const sender = members[i];
                    const receiver = (i === members.length - 1) ? members[0] : members[i + 1];

                    // Vérifiez que le sender et le receiver ne sont pas la même personne
                    if (sender === receiver) {
                        return res.status(500).json({ message: "Erreur lors du tirage au sort : un membre s'est retrouvé comme expéditeur et destinataire." });
                    }

                    // Créez une nouvelle entrée dans la base de données pour chaque paire
                    const newSanta = new Santa({
                        sender: sender,
                        receiver: receiver,
                        group_id: req.params.id_group,
                    });

                    pairs.push(newSanta);
                }

                // Sauvegardez toutes les paires dans la base de données
                await Santa.insertMany(pairs);
            }

                }

        res.status(200).json({ message: "Tirage au sort du Secret Santa terminé avec succès." });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Une erreur s'est produite lors du traitement" });
    }
};

exports.getUserAssignment = async (req, res) => {
    try {
        const token = req.headers['authorization'];
        let payload = jwtMiddleware.decode(token);
        let user_id = payload.id;

        const assignment = await Santa.findOne({
            group_id: req.params.id_group,
            sender: user_id
        });

        if (!assignment) {
            return res.status(404).json({ message: "Vous n'avez pas encore été assigné à quelqu'un." });
        }

        const receiver_id = assignment.receiver;
        console.log(receiver_id)


        const receiver = await User.findById(receiver_id);
        if (!receiver) {
            return res.status(500).json({ message: "Erreur lors de la récupération de l'utilisateur destinataire." });
        }
        console.log(receiver)

        const receiver_name = receiver.name
        res.status(200).json({ receiver_name });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Une erreur s'est produite lors du traitement" });
    }
};

exports.getAllAssignments = async (req, res) => {
    try {
        const token = req.headers['authorization'];
        let payload = jwtMiddleware.decode(token);
        let admin_id = payload.id;

        const group = await Group.findById(req.params.id_group);

        // Vérifier si l'utilisateur est un administrateur (leader)
        if (admin_id !== group.id_leader) {
            return res.status(403).json({ message: "Vous n'avez pas les autorisations nécessaires pour effectuer cette action." });
        }

        // Récupérer tous les tirages au sort pour le groupe spécifié
        const assignments = await Santa.find({ group_id: req.params.id_group })
            .populate('sender', 'name')
            .populate('receiver', 'name');

        const assignmentList = assignments.map(assignment => ({
            sender: assignment.sender.name,
            receiver: assignment.receiver.name
        }));

        res.status(200).json({ assignments: assignmentList });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Une erreur s'est produite lors du traitement" });
    }
};
