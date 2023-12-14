const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let groupSchema = new Schema ({
    name: {
        type: String,
        required: true,
    },
    id_leader: {
        type: String,
        required: true,
    },
    users_in_group:  [{ 
        type: mongoose.Types.ObjectId, 
        ref: 'User' 
    }],
    created_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Group', groupSchema);
