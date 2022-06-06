var Category = require('../models/category');
var async = require('async');
var Item = require('../models/item');
const { body,validationResult } = require("express-validator");



// Display list of all categories.
exports.category_list = function(req, res, next) {

    Category.find()
      .sort([['name', 'ascending']])
      .exec(function (err, list_categories) {
        if (err) { return next(err); }
        //Successful, so render
        res.render('category_list', { title: 'Category List', category_list: list_categories });
      });
  
  };
  

// Display detail page for a specific category.
exports.category_detail = function(req, res, next) {

    async.parallel({
        category: function(callback) {
            Category.findById(req.params.id)
              .exec(callback);
        },

        category_items: function(callback) {
            Item.find({ 'category': req.params.id })
              .exec(callback);
        },

    }, function(err, results) {
        if (err) { return next(err); }
        if (results.category==null) { // No results.
            var err = new Error('Category not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render
        res.render('category_detail', { title: 'Category Detail', category: results.category, category_items: results.category_items } );
    });

};

// Display Genre create form on GET.
exports.category_create_get = function(req, res, next) {
    res.render('category_form', { title: 'Create Category' });
  };
  


// Handle category create on POST.
exports.category_create_post =  [

    // Validate and sanitize the name field.
    body('name', 'Category name required').trim().isLength({ min: 1 }).escape(),
    body('description', 'Description must not be empty.').trim().isLength({ min: 1 }).escape(),
  
    // Process request after validation and sanitization.
    (req, res, next) => {
  
      // Extract the validation errors from a request.
      const errors = validationResult(req);
  
      // Create a category object with escaped and trimmed data.
      var category = new Category(
        { name: req.body.name,
          description: req.body.description
        }
      );
  
      if (!errors.isEmpty()) {
        // There are errors. Render the form again with sanitized values/error messages.
        res.render('category_form', { title: 'Create Category', category: category, errors: errors.array()});
        return;
      }
      else {
        // Data from form is valid.
        // Check if category with same name already exists.
        Category.findOne({ 'name': req.body.name })
          .exec( function(err, found_category) {
             if (err) { return next(err); }
  
             if (found_category) {
               // category exists, redirect to its detail page.
               res.redirect(found_category.url);
             }
             else {
  
                category.save(function (err) {
                 if (err) { return next(err); }
                 // category saved. Redirect to category detail page.
                 res.redirect(category.url);
               });
  
             }
  
           });
      }
    }
  ];
  



// Display Author delete form on GET.
exports.category_delete_get = function(req, res, next) {

    async.parallel({
        category: function(callback) {
            Category.findById(req.params.id).exec(callback)
        },
        categories_items: function(callback) {
            Item.find({ 'category': req.params.id }).exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.category==null) { // No results.
            res.redirect('/catalog/categories');
        }
        // Successful, so render.
        res.render('category_delete', { title: 'Delete Category', category: results.category, category_items: results.categories_items } );
    });

};


// Handle Author delete on POST.
exports.category_delete_post = function(req, res, next) {

    async.parallel({
        category: function(callback) {
          Category.findById(req.body.categoryid).exec(callback)
        },
        categories_items: function(callback) {
          Item.find({ 'category': req.body.categoryid }).exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        // Success
        if (results.categories_items.length > 0) {
            // Author has books. Render in same way as for GET route.
            res.render('category_delete', { title: 'Delete category', category: results.category, category_items: results.categories_items  } );
            return;
        }
        else {
            // Author has no books. Delete object and redirect to the list of authors.
            Category.findByIdAndRemove(req.body.categoryid, function deleteCategory(err) {
                if (err) { return next(err); }
                // Success - go to author list
                res.redirect('/catalog/categories')
            })
        }
    });
};


