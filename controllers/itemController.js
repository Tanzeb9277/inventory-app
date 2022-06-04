var Item = require('../models/item');
var Category = require('../models/category');

var async = require('async');
const { body,validationResult } = require('express-validator');


exports.index = function(req, res) {

    async.parallel({
        item_count: function(callback) {
            Item.countDocuments({}, callback); // Pass an empty object as match condition to find all documents of this collection
        },
        category_count: function(callback) {
            Category.countDocuments({}, callback);
        },

    }, function(err, results) {
        res.render('index', { title: 'Inventory Home', error: err, data: results });
    });
};


// Display list of all items.
exports.item_list = function(req, res, next) {

    Item.find({}, 'name price')
      .sort({name : 1})
      .populate('price')
      .exec(function (err, list_items) {
        if (err) { return next(err); }
        //Successful, so render
        res.render('item_list', { title: 'Item List', item_list: list_items });
      });
  
  };

// Display detail page for a specific book.
exports.item_detail = function(req, res, next) {

    async.parallel({
        item: function(callback) {

            Item.findById(req.params.id)
              .populate('price')
              .populate('category')
              .populate('stock')
              .exec(callback);
        },

    }, function(err, results) {
        if (err) { return next(err); }
        if (results.item==null) { // No results.
            var err = new Error('Item not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render.
        res.render('item_detail', { name: results.item.name, item: results.item } );
    });

};


// Display item create form on GET.
exports.item_create_get = function(req, res, next) {

    // Get all authors and genres, which we can use for adding to our book.
    async.parallel({
        categories: function(callback) {
            Category.find(callback);
        },

    }, function(err, results) {
        if (err) { return next(err); }
        res.render('item_form', { title: 'Create Item', categories: results.categories });
    });

};


// Handle item create on POST.
exports.item_create_post = [
    // Convert the genre to an array.
    (req, res, next) => {
        if(!(req.body.category instanceof Array)){
            if(typeof req.body.category ==='undefined')
            req.body.category = [];
            else
            req.body.category = new Array(req.body.category);
        }
        next();
    },

    // Validate and sanitize fields.
    body('name', 'Name must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('description', 'Summary must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('stock', 'Stock must not be empty').isNumeric().escape(),
    body('price', 'Price must not be empty').isFloat().escape(),
    body('category.*').escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Book object with escaped and trimmed data.
        var item = new Item(
          { name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            stock: req.body.stock,
            category: req.body.category
           });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all authors and genres for form.
            async.parallel({
                categories: function(callback) {
                    Category.find(callback);
                },
            }, function(err, results) {
                if (err) { return next(err); }

                // Mark our selected genres as checked.
                for (let i = 0; i < results.categories.length; i++) {
                    if (item.category.indexOf(results.categories[i]._id) > -1) {
                        results.categories[i].checked='true';
                    }
                }
                res.render('item_form', { title: 'Create Item', categories:results.categories, item: item, errors: errors.array() });
            });
            return;
        }
        else {
            // Data from form is valid. Save book.
            item.save(function (err) {
                if (err) { return next(err); }
                   //successful - redirect to new book record.
                   res.redirect(item.url);
                });
        }
    }
];


// Display item delete form on GET.
exports.item_delete_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Book delete GET');
};

// Handle item delete on POST.
exports.item_delete_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Book delete POST');
};

// Display item update form on GET.
exports.item_update_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Book update GET');
};

// Handle item update on POST.
exports.item_update_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Book update POST');
};
