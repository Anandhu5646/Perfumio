const mongoose = require('mongoose');

// Declare the Schema of the Mongo model
var categorySchema = new mongoose.Schema({
    category: {
        type: String,
        required: true

    },
    block: {
        type: Boolean,
        required: true
    }
});



const categoryModel = mongoose.model('categories', categorySchema);

module.exports = categoryModel; 