const mongoose = require("mongoose"),
  Schema = mongoose.Schema;

const modelSchema = new Schema({
  _id: mongoose.Schema.Types.ObjectId,
  quotation_id: mongoose.Schema.Types.ObjectId,
  quotation_stock_id: mongoose.Schema.Types.ObjectId,
  stock_code: { type: String },
  sequence: { type: Number },
  // รหัสสั่งผลิต
  product_code: { type: String },
  product_unit: { type: String },
  product_weight: { type: Number },
  // กว้าง
  width: { type: Number },
  // ยาว
  height: { type: Number },
  width_m: { type: Number },
  // ยาว
  height_m: { type: Number },
  quantity: { type: Number },
  unit: { type: String },
  price: { type: Number },
  created: { type: Date },
  modified: { type: Date },
  createdby: { type: String },
  modifiedby: { type: String },
});
module.exports = mongoose.model("bww_quotation_products", modelSchema);
