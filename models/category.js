var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var CategorySchema = new Schema(
  {
    name: {type: String, required: true,minlength: 3, maxLength: 100, },
    description: {type: String, required: true},
  }
);

// Virtual for book's URL
CategorySchema
.virtual('url')
.get(function () {
  return '/catalog/category/' + this._id;
});

//Export model
module.exports = mongoose.model('Category', CategorySchema);