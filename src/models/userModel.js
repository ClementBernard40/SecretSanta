const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let userSchema = new Schema ({
    email: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
    },
    password:  {
        type: String,
        required: true
    },
    tempPassword:  {
        type: String,
    },
    user_group:  [{ 
        type: mongoose.Types.ObjectId, 
        ref: 'Group' 
    }],
    created_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', userSchema);
