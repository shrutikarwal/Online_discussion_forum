const mongoose = require('mongoose');

const threadSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    tags: [{ type: String }],
    category: { type: String, required: true },
    
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    votes: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Thread', threadSchema);

//createby ka type objectId rakha kyunki ye user ka refrence hai(foreign key jaise)
// timpestamps:true se mongodb automatically careateAt & UpdateAt feild add kr sakhte ahai
// tags ko array rakha taaki ek thread me multiple tags ho sake.

