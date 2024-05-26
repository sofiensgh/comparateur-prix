const ElectroTounesData = require("../models/ElectroTounesModel");
const MyTekData = require("../models/MyTekTtnModel");
const SpaceNetData = require("../models/SpaceNetModel");
const TunisiaNetData = require("../models/TunisiaNetModel");

async function findSimilarProductsByReference(reference, currentModel) {
  let results = [];
  
  // Define an array of models to search
  const modelsToSearch = [
    MyTekData,
    TunisiaNetData,
    SpaceNetData,
    ElectroTounesData,
  ];

  // Iterate through the models and search for similar products
  for (const Model of modelsToSearch) {
    if (Model.modelName !== currentModel.modelName) { // Exclude the current model
      const similarProducts = await Model.find({ reference }).exec();
      results.push(...similarProducts);
    }
  }

  // Repeat the product if it exists in the current model
  if (currentModel) {
    const currentProduct = await currentModel.findOne({ reference }).exec();
    if (currentProduct) {
      results.push(currentProduct);
    }
  }

  return results;
}

module.exports = {
  findSimilarProductsByReference,
};
