const mongoose = require("mongoose");

const TunisiaNetDataSchema  = new mongoose.Schema({
  title: {
    type: String,
    default: "", // Empty string as default value if not defined or scraped
  },
  price: {
    type: Number,
    default: 0, // Default value of 0 for price if not defined or scraped
  },
  reference: {
    type: String,
    default: "", // Empty string as default value if not defined or scraped
  },
  description: {
    type: String,
    default: "", // Empty string as default value if not defined or scraped
  },
  availability: {
    type: String,
    default: "", // Empty string as default value if not defined or scraped
  },
  img: {
    type: String,
    default: "", // Empty string as default value if not defined or scraped
  },
  productUrl: {
    type: String,
    default: "",
  },
  categorie: {
    type: String,
    default: "",
  },
  fournisseur: {
    type: String,
  },
});

// Pre-save hook to set the constant value for fournisseur
TunisiaNetDataSchema.pre('save', function(next) {
  this.fournisseur = "Tunisia Net";
  this.reference = this.reference.replace(/[^a-zA-Z0-9]/g, ''); // Remove all non-alphanumeric characters

  next();
});

const TunisiaNetData = mongoose.model("TunisiaNetData", TunisiaNetDataSchema );

module.exports = TunisiaNetData;
