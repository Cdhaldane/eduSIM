var supertest = require("supertest");
var should = require("should");

// This agent refers to PORT where program is runninng.

var server = supertest.agent("http://localhost:5000");

// UNIT test begin

describe("SAMPLE unit test",function(){

  // #1 should return home page

  it("should return admin page",function(done){

    // calling home page api
    server
    .get("/apis/games/getGames")
    .expect("Content-type",/json/)
    .expect(200) // THis is HTTP response
    .end(function(err,res){
      // HTTP status should be 200
      res.status.should.equal(200);
      // Error key should be false.
      res.body.error.should.equal(false);
      done();
    });
  });

});


// const request = require('supertest');
// const express = require('express');

// const app = express();

// app.get('/api/games/getGames', function(req, res) {
//   res.status(200).json({ name: 'john' });
// });

// request(app)
//   .get('/api/games/getGames')
//   .expect('Content-Type', /json/)
//   .expect('Content-Length', '15')
//   .expect(200)
//   .end(function(err, res) {
//     if (err) throw err;
//   });