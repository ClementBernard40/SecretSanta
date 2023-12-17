// Importing required modules and models
require('dotenv').config;
const Group = require('../models/groupModel');
const User = require('../models/userModel');
const UserTemp = require('../models/userTempModel');
const Santa = require('../models/santaModel');
const bcrypt = require('bcrypt');
const generator = require('generate-password');
const jwt = require('jsonwebtoken');
const jwtMiddleware = require('../middlewares/jwtMiddleware');
const saltRounds = 10;

// Controller function to create a new group
exports.createAgroup = async (req, res) => {
    // Extracting the JWT token from the request headers
    const token = req.headers['authorization'];
    let payload = jwtMiddleware.decode(token)
    user_id = payload.id
    // Creating a new group with the leader ID and users in the group
    const newGroup = new Group({...req.body, id_leader: user_id, users_in_group: user_id});
    try {
        // Saving the new group and updating user_group field in User model
        let group = await newGroup.save();  
        await User.updateMany({ '_id': newGroup.users_in_group }, { $push: { user_group: newGroup._id } });
        res.status(201).json({ message: `group has been created: ${group.name}` });
    } catch (error) {
        console.error(error);
        res.status(401).json({ message: 'Invalid request' });
    }
};

// Controller function to delete a group
exports.deleteAGroup = async (req,res) => {
    // Extracting the JWT token from the request headers
    const token = req.headers['authorization'];
    let payload = jwtMiddleware.decode(token)
    let leader_id = payload.id

    try {
        // Finding the group by ID
        const group =  await Group.findById(req.params.id_group);

        console.log(group)
        if (!group) {
            res.status(404).send("Group not found");
        } else {
            // Checking if the requester is the leader of the group
            if (leader_id == group.id_leader) {
                await Group.findByIdAndDelete(req.params.id_group);
                res.status(201).json({ message: `group has been deleted` });
                // it doesn't display I don't know why
            } else {
                res.status(403).send("You are not the leader");
            }
        }
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
}

// Controller function to update a group
exports.updateAGroup = async (req, res) => {
    try {
        // Extracting the updated group data from the request
        const groupUpdate = req.body;

        // Finding the group by ID and updating its data
        const group = await Group.findByIdAndUpdate(
            req.params.id_group,
            { $set: groupUpdate },
            { new: true } // Returns the modified document
        );

        if (!group) {
            res.status(404).json({ message: 'Group not found' });
            return;
        }

        res.status(203).json(group);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error.' });
    }
};

// Controller function to get all groups
exports.getAllGroup = async (req,res) => {
    try {
        // Finding all groups in the database
        const groups = await Group.find();
        res.status(200);
        res.json(groups);
    } catch (error) {
        res.status(500);
        console.log(error);
        res.json({message: "Server error."});
    }
}

// Controller function to get groups of a user
exports.getUserGroup = async (req, res) => {
    const token = req.headers['authorization'];
    let payload = jwtMiddleware.decode(token);
    const userid = payload.id;

    try {
        // Finding the user by ID
        const user = await User.findById(userid);
        console.log(user);

        const userGroup = user.user_group;
        console.log(userGroup);

        // Using Promise.all to perform asynchronous queries
        const groupPromises = userGroup.map(groupId => getAGroupById(groupId));

        // Waiting for all queries to finish
        const groups = await Promise.all(groupPromises);

        res.status(200).json(groups);
    } catch (error) {
        res.status(500).json({ message: "Server error." });
    }
};

// Function to get a group by ID
async function getAGroupById(groupId) {
    try {
        // Checking if the group exists
            const group = await Group.findById(groupId);
            return group;

    } catch (error) {
        console.log(error);
        return null; // or handle the error appropriately
    }
}

// Controller function to get information about a group
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
                return; // Add the return here to avoid continuing the loop unnecessarily
            }
        }

        // If the user is not in the group
        res.status(403).json({ message: "You are not in this group" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Controller function to invite a user to a group
exports.invite = async (req, res) => {
    // Extracting the JWT token from the request headers
    const token = req.headers['authorization'];
    let payload = jwtMiddleware.decode(token);

    // Checking if the JWT token is valid
    if (!payload) {
        res.status(403).json({ message: "Invalid token" });
        return;
    }

    // Extracting user ID and email from the request
    let user_id = payload.id;
    let email = req.body.email;

    // Creating invitation data with group ID and email
    const invitData = {
        idGroup: req.params.id_group,
        email: email
    };

    try {
        // Retrieving the group using the provided group ID
        const groupId = req.params.id_group;
        const group = await Group.findById(groupId);
        // Checking if the group exists
        if (!group) {
            res.status(404).json({ message: "Group not found" });
            return;
        }

        // Checking if the drawing has already been done for the group
        const santaTest = await Santa.findOne({ group_id: groupId });
        console.log(santaTest)

        if (santaTest) {
            if (santaTest.group_id == groupId) {
                res.status(403).json({ message: "Drawing has already been done, cannot add a new person to the group" });
            }
        }
        
        // Extracting users in the group and the name of the invited person
        const group_user = group.users_in_group;
        const name_invited = req.body.name;

        for (const userid of group_user) {
            if (user_id == userid) {
                if (!name_invited) {
                    res.status(400).json({ message: "Name not found" });
                    return;
                }

                var password = generator.generate({
                    length: 10,
                    numbers: true
                });

                try {
                    // Searching for the user in the database
                    const testuser = await User.findOne({ email: email });
                    const testuserTemp = await UserTemp.findOne({ email: email });

                    // Checking if the user already exists in the database
                    if (testuser) {
                        const testuser_id = testuser._id;

                        // Checking if the user is already in the group
                        if (group_user.includes(testuser_id)) {
                            res.status(200).json({ message: "The user is already in this group" });
                            return;
                        }

                        // Creating the invitation token
                        const groupData = {
                            user_invited: testuser._id
                        };
                        await Group.findByIdAndUpdate(
                            req.params.id_group,
                            { $set: groupData },
                            { new: true } // Returns the modified document
                        );
                        const tokenInvit = await jwt.sign(invitData, process.env.JWT_KEY, { expiresIn: '48h' });
                        res.status(200).json({ tokenInvit });
                    
                    // Checking if the user is already invited
                    } else if (testuserTemp) {
                        res.status(403).json({ message: "The user has already been invited" });
                    } else {
                        // The user does not exist, continue with the creation of a new temporary user
                        let newUser = new UserTemp({ email: email, name: name_invited, password: password });
                        const userTemp = await newUser.save();

                        const groupData = {
                            userTemp_invited: userTemp._id
                        };
                        await Group.findByIdAndUpdate(
                            req.params.id_group,
                            { $set: groupData },
                            { new: true } // Returns the modified document
                        );

                        const tokenInvit = await jwt.sign(invitData, process.env.JWT_KEY, { expiresIn: '48h' });
                        res.status(201).json({ message: "Temporary user created successfully, here is the invitation token", tokenInvit });
                    }
                } catch (error) {
                    console.log(error);
                    res.status(500).json({ message: "Server error (db)" });
                }
                return; // Add the return here to avoid continuing the loop unnecessarily
            }
        }

        // If the user is not in the group
        res.status(403).json({ message: "You are not in this group" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Controller function to accept or decline an invitation
exports.accept = async (req, res) => {
    try {
        const token = req.headers['invitation'];
        const payload = jwtMiddleware.decode(token);
        const group_id = payload.idGroup;
        const emailUser = payload.email;

        const group = await Group.findById(group_id);
        let is_temp = 2;
        const group_userTemp = group.userTemp_invited;

        let usertemp = await UserTemp.findOne({ email: emailUser });

        if (!usertemp) {
            usertemp = await User.findOne({ email: emailUser });
        }

        let is_accepted = req.body.is_accepted;

        // Checking if it's a user temp
        if (group_userTemp.includes(usertemp._id)) {
            is_temp = 1;
        } else {
            is_temp = 0;
        }

        // If the invitation is declined
        if (is_accepted == 0) {
            // If usertemp
            if (is_temp == 1) {
                await Group.updateOne(
                    { _id: group_id },
                    { $pull: { userTemp_invited: usertemp._id } }
                );
                await UserTemp.deleteOne({ email: emailUser });
                res.status(200).json({ message: "Invitation declined" });
            } else {
                // If user
                await Group.updateOne(
                    { _id: group_id },
                    { $pull: { user_invited: usertemp._id } }
                );
                res.status(200).json({ message: "Invitation declined" });
            }
        } else if (is_accepted == 1) { // If the invitation is accepted
            // If usertemp
            if (is_temp == 1) {
                // Generating a new password for the permanent user
                let passwordToHash = usertemp.password
                let salt = await bcrypt.genSalt(saltRounds);
                let hash = await bcrypt.hash(passwordToHash, salt);

                let newUser = new User({ email: usertemp.email, name: usertemp.name, password: usertemp.password });

                newUser.tempPassword = usertemp.password;
                newUser.password = hash;

                await Group.updateOne(
                    { _id: group_id },
                    { $pull: { userTemp_invited: usertemp._id } }
                );
                await Group.updateOne(
                    { _id: group_id },
                    { $push: { users_in_group: newUser._id } }
                );
                await UserTemp.deleteOne({ email: emailUser });
                await newUser.save();
                res.status(200).json({ message: "Invitation accepted" });
            } else {
                // If user
                await Group.updateOne(
                    { _id: group_id },
                    { $pull: { user_invited: usertemp._id } }
                );
                await Group.updateOne(
                    { _id: group_id },
                    { $push: { users_in_group: usertemp._id } }
                );
                res.status(200).json({ message: "Invitation accepted" });
            }
        } else {
            res.status(400).json({ message: "Enter 0 to decline and 1 to accept" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};
