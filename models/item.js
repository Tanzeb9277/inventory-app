var mongoose = require('mongoose');
require('mongoose-type-url');
var Schema = mongoose.Schema;

var ItemSchema = new Schema(
  {
    name: {type: String, required: true},
    description: {type: String, required: true},
    price: {type: Number, required: true},
    stock: {type: Number, required: true},
    imgUrl: {type: String, required: true},
    category: [{type: Schema.Types.ObjectId, ref: 'Category'}]
  }
);

// Virtual for items's URL
ItemSchema
.virtual('url')
.get(function () {
  return '/catalog/item/' + this._id;
});

ItemSchema
  .virtual('img')
  .get(function(){
    let url = this.imgUrl;
    let newUrl = url.replace(/&#x2F;/g, "/")
    return newUrl;
  })

//Export model
module.exports = mongoose.model('Item', ItemSchema);