const Santa = require('../models/santaModel');




exports.startSanta = async (req, res) => {
    try {
        const token = req.headers['authorization'];

        let payload = jwtMiddleware.decode(token)
        let leader_id = payload.id
        
        if (leader_id == group.id_leader) {

            const group = await Group.findById(req.params.group_id);
            console.log(req.params.group_id);
            console.log(group);

            const members = group.members;

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
                const newSanta = new Group({
                    sender: sender,
                    receiver: receiver,
                    group_id: req.params.group_id,
                });

                pairs.push(newSanta);
            }

            // Sauvegardez toutes les paires dans la base de données
            await Group.insertMany(pairs);
        }

        res.status(200).json({ message: "Tirage au sort Secret Santa terminé avec succès." });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Une erreur s'est produite lors du traitement" });
    }
};
