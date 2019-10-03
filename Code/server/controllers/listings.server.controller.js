
/* Dependencies */
var mongoose = require('mongoose'), 
    Listing = require('../models/listings.server.model.js'),
    coordinates = require('./coordinates.server.controller.js');
    
/*
  In this file, you should use Mongoose queries in order to retrieve/add/remove/update listings.
  On an error you should send a 404 status code, as well as the error message. 
  On success (aka no error), you should send the listing(s) as JSON in the response.

  HINT: if you are struggling with implementing these functions refer back to this tutorial 
  https://www.callicoder.com/node-js-express-mongodb-restful-crud-api-tutorial/
  or
  https://medium.com/@dinyangetoh/how-to-build-simple-restful-api-with-nodejs-expressjs-and-mongodb-99348012925d
  

  If you are looking for more understanding of exports and export modules - 
  https://www.sitepoint.com/understanding-module-exports-exports-node-js/
  or
  https://adrianmejia.com/getting-started-with-node-js-modules-require-exports-imports-npm-and-beyond/
 */

/* Create a listing */
exports.create = function(req, res) {

  /* Instantiate a Listing */
  var listing = new Listing(req.body);

  /* save the coordinates (located in req.results if there is an address property) */
  if(req.results) {
    listing.coordinates = {
      latitude: req.results.lat, 
      longitude: req.results.lng
    };
  }
  listing.code = req.body.code;
  listing.name = req.body.name;
  listing.address = req.body.address;
 
  /* Then save the listing */
  listing.save(function(err) {
    if(err) {
      console.log(err);
      res.status(400).send(err);
    } else {
      res.json(listing);
    }
  });
};

exports.read = function (req, res) {
    var listing = req.listing;
    if (listing == null) { return res.status(400).send();}
        Listing.findById(listing._id, (err, location) => {
            if (err) { res.send(err); }
            res.json(location);
        });
};

/* Update a listing - note the order in which this function is called by the router*/
exports.update = function(req, res) {
  var listing = req.listing;
  
  Listing.findById(listing._id, (err, list) => {
      if (err) res.send(err);

      list.code = req.body.code;
      list.name = req.body.name;
      if (req.results) {
          listing.coordinates = {
              latitude: req.results.lat,
              longitude: req.results.lng
          };
      }
      list.address = req.body.address;

      list.save((err) => {
          if (err) { res.status(400).send(err); };
          res.json(list);
      });
  })
};

exports.delete = (req, res) => {
  var listing = req.listing;
  Listing.findByIdAndRemove(listing._id, (err, listing) => {
      if (err) throw err
      res.json(listing);
  });
};

exports.list = function(req, res) {
    Listing.find({}, function (err, location) {
        if (err) throw err;
        res.send(location);
    });
};

/* 
  Middleware: find a listing by its ID, then pass it to the next request handler. 

  HINT: Find the listing using a mongoose query, 
        bind it to the request object as the property 'listing', 
        then finally call next
 */
exports.listingByID = function(req, res, next, id) {
  Listing.findById(id).exec(function(err, listing) {
    if(err) {
      res.status(400).send(err);
    } else {
      req.listing = listing;
      next();
    }
  });
};