const mongoose = require("mongoose"),
  Schema = mongoose.Schema;

const modelSchema = new Schema({
  _id: mongoose.Schema.Types.ObjectId,
  seller_name: { type: String },
  dealer: { type: String },
  phone: { type: String },
  email: { type: String },
  line: { type: String },
  seller_type: { type: String },
  payment_type: { type: String },
  payment_remark: { type: String },
  // tax_address: { type: String },
  // tax_id: { type: String },
  // note: { type: String },
  // remark: { type: String },
  sequence: { type: Number },
  created: { type: Date },
  modified: { type: Date },
  createdby: { type: String },
  modifiedby: { type: String },
});
module.exports = mongoose.model("bww_sellers", modelSchema);
