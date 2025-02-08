const mongoose = require('mongoose'),
    bcrypt = require('bcrypt'),
    Schema = mongoose.Schema;

const userSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    identification: { type: String},
    fullname: { type: String},
    email: { 
        type: String, 
        unique: true,
        lowercase: true,
        trim: true,
        required: true,
        match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
    },
    username: { type: String, required: true ,unique: true},
    hash_password: { type: String },
    birthday: { type: Date },
    reset_password_token: {
        type: String
    },
    reset_password_expires: {
        type: Date
    },
    alert: { type: Boolean, default: false},
    role: { type: String },
    display_role: { type: String },
    token: {
        type: String
    },
    active_start : { type: Date},
    active_end: { type : Date},
    active: {type: Boolean , default: true},
    avatar_path : {
        type: String
    },
    created: { type: Date },
    modified: { type: Date },
});
userSchema.methods.comparePassword = function(password) {
    return bcrypt.compareSync(password, this.hash_password);
  };

userSchema.statics.getUserById = function(id, callback) {
    User.findById(id, callback);
  };

userSchema.statics.getUserByUsername = function(username, callback) {
    let query = {username: username};
    User.findOne(query, callback);
}
userSchema.statics.getUsers = () => {
    return User.find({}, '-password');
}
  const User = mongoose.model('bww_users', userSchema);
  module.exports = User;