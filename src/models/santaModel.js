const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let santaSchema = new Schema (
    {
        sender: [{ 
            type: Schema.Types.ObjectId,
            ref: 'User' 
        }],
        receiver: [{ 
            type: Schema.Types.ObjectId,
            ref: 'User' 
        }],
        group_id: {
            type: String,
            required: true
        }
    },
    { timestamps: true }
);


module.exports = mongoose.model('Santa', santaSchema);