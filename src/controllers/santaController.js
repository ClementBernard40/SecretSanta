const Santa = require('../models/santaModel');
const Group = require('../models/groupModel');
const User = require('../models/userModel');

const jwtMiddleware = require('../middlewares/jwtMiddleware');

// Controller function to initiate Secret Santa drawing for a group
exports.startSanta = async (req, res) => {
    try {
        // Extracting the JWT token from the request headers
        const token = req.headers['authorization'];

        // Decoding the JWT token to get user information
        let payload = jwtMiddleware.decode(token);
        let leader_id = payload.id;

        // Retrieving the group information using the provided group ID
        const group = await Group.findById(req.params.id_group);

        // Checking if the requester is the leader of the group
        if (leader_id == group.id_leader) {
            // Logging the group ID for debugging purposes
            console.log(req.params.id_group);

            // Extracting the list of members in the group
            const members = group.users_in_group;

            // Checking if Secret Santa drawing has already been done for the group
            const santaTest = await Santa.findOne({ group_id: group._id });
            console.log(santaTest);

            if (santaTest) {
                return res.status(400).json({ message: "Secret Santa drawing has already been done." });
            } else {
                // Checking if there are enough members for the Secret Santa drawing
                if (members.length < 2) {
                    return res.status(400).json({ message: "There must be at least two members for the Secret Santa drawing." });
                }

                // Using the Fisher-Yates algorithm to shuffle the members array
                for (let i = members.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [members[i], members[j]] = [members[j], members[i]];
                }

                // Creating pairs for Secret Santa drawing
                const pairs = [];
                for (let i = 0; i < members.length; i++) {
                    const sender = members[i];
                    const receiver = (i === members.length - 1) ? members[0] : members[i + 1];

                    // Checking that the sender and receiver are not the same person
                    if (sender === receiver) {
                        return res.status(500).json({ message: "Error during Secret Santa drawing: a member ended up as both sender and receiver." });
                    }

                    // Creating a new entry in the database for each pair
                    const newSanta = new Santa({
                        sender: sender,
                        receiver: receiver,
                        group_id: req.params.id_group,
                    });

                    pairs.push(newSanta);
                }

                // Saving all pairs to the database
                await Santa.insertMany(pairs);
            }
        }

        // Responding with success message if Secret Santa drawing is completed successfully
        res.status(200).json({ message: "Secret Santa drawing completed successfully." });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "An error occurred during processing." });
    }
};

// Controller function to get the assignment for a user in the Secret Santa drawing
exports.getUserAssignment = async (req, res) => {
    try {
        // Extracting the JWT token from the request headers
        const token = req.headers['authorization'];
        let payload = jwtMiddleware.decode(token);
        let user_id = payload.id;

        // Retrieving the Secret Santa assignment for the user
        const assignment = await Santa.findOne({
            group_id: req.params.id_group,
            sender: user_id
        });

        // Checking if the user has been assigned to someone
        if (!assignment) {
            return res.status(404).json({ message: "You have not been assigned to anyone yet." });
        }

        // Retrieving the receiver's information from the User model
        const receiver_id = assignment.receiver;
        console.log(receiver_id);

        const receiver = await User.findById(receiver_id);
        if (!receiver) {
            return res.status(500).json({ message: "Error retrieving the recipient user." });
        }
        console.log(receiver);

        // Responding with the receiver's name
        const receiver_name = receiver.name;
        res.status(200).json({ receiver_name });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "An error occurred during processing." });
    }
};

// Controller function to get all Secret Santa assignments for a group
exports.getAllAssignments = async (req, res) => {
    try {
        // Extracting the JWT token from the request headers
        const token = req.headers['authorization'];
        let payload = jwtMiddleware.decode(token);
        let admin_id = payload.id;

        // Retrieving the group information using the provided group ID
        const group = await Group.findById(req.params.id_group);

        // Checking if the requester is an administrator (leader) of the group
        if (admin_id !== group.id_leader) {
            return res.status(403).json({ message: "You do not have the necessary permissions to perform this action." });
        }

        // Retrieving all Secret Santa assignments for the specified group
        const assignments = await Santa.find({ group_id: req.params.id_group })
            .populate('sender', 'name')
            .populate('receiver', 'name');

        // Mapping the assignments to sender and receiver names
        const assignmentList = assignments.map(assignment => ({
            sender: assignment.sender.name,
            receiver: assignment.receiver.name
        }));

        // Responding with the list of assignments
        res.status(200).json({ assignments: assignmentList });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "An error occurred during processing." });
    }
};
