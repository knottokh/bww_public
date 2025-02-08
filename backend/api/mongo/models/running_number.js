const mongoose = require("mongoose"),
  Schema = mongoose.Schema;

const modelSchema = new Schema({
  _id: mongoose.Schema.Types.ObjectId,
  running_type: { type: String }, //q = quotation, j = product
  running_year: { type: Number },
  running_month: { type: Number },
  running_no: { type: Number },

  created: { type: Date },
  modified: { type: Date },
  createdby: { type: String },
  modifiedby: { type: String },
});
module.exports = mongoose.model("bww_running_numbers", modelSchema);
