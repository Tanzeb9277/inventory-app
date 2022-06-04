#! /usr/bin/env node

console.log('This script populates some test books, authors, genres and bookinstances to your database. Specified database as argument - e.g.: populatedb mongodb+srv://cooluser:coolpassword@cluster0.a9azn.mongodb.net/local_library?retryWrites=true');

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
var async = require('async')
var Item = require('./models/item')

var Category = require('./models/category')


var mongoose = require('mongoose');
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var items = []
var categories = []


function categoryCreate(name, description, cb) {
    categorydetail = {
        name: name,
        description: description 
    }

  
  var category = new Category(categorydetail);
       
  category.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New Category: ' + category);
    categories.push(category)
    cb(null, category)
  }  );
}



function itemCreate(name, description, price, stock, category, cb) {
  itemdetail = { 
    name: name,
    description: description,
    price: price,
    stock: stock,
    category: category
  }
  if (category != false) itemdetail.category = category;
    
  var item = new Item(itemdetail);    
  item.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New Item: ' + item);
    items.push(item)
    cb(null, item)
  }  );
}





function createCategory(cb) {
    async.series([
        function(callback) {
          categoryCreate('Platformer', 'Platform games are characterized by levels consisting of uneven terrain and suspended platforms of varying height that require jumping and climbing to traverse.', callback);
        },
        function(callback) {
            categoryCreate('Role Playing Game', 'A role-playing game is a game in which players assume the roles of characters in a fictional setting.', callback);
        },
       
        ],
        // optional callback
        cb);
}


function createItems(cb) {
    async.parallel([
        function(callback) {
          itemCreate('Crash Twinsanity', "Crash Twinsanity is a 2004 platform video game developed by Traveller's Tales and published by Vivendi Universal Games", 59.99, 17, [categories[0]], callback);
        },
        function(callback) {
            itemCreate('The Witcher 3', "The Witcher 3 is a fantasy action role-playing game developed by CD Projekt Red and published by CD Projekt", 59.99, 2, [categories[1]], callback);
          },
        ],
        // optional callback
        cb);
}





async.series([
    createCategory,
    createItems
],
// Optional callback
function(err, results) {
    if (err) {
        console.log('FINAL ERR: '+err);
    }
    else {
        console.log('Catefories: ' + categories);
        
    }
    // All done, disconnect from database
    mongoose.connection.close();
});




