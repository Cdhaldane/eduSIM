const supertest = require("supertest");
const express = require('express');
const gameinstances = require("../models/GameInstances");

const app = express();

let server = supertest.agent("http://localhost:5050");

//==================== user API test ====================

/**
 * Testing get all user endpoint
 */
describe('GET /getAdminSimulations', () => {
    it('respond with json containing a list of all game instances created by an admin', (done) => {
        const adminid = "7835228b-fb40-41f7-80cc-ce3ecfb5b3e7";
        server
            .get('/gameinstances/' + adminid)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200, done);
    });
});

describe('GET /getGameSimulationById', () => {
    it('respond with json containing a specific game instance', (done) => {
        const adminid = "7835228b-fb40-41f7-80cc-ce3ecfb5b3e7";
        const gameid = "c8a39fd1-a5de-42c8-8558-20687813ea62";
        server
            .get('/gameinstances/getGameInstance/' + adminid + '/' + gameid)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200, done);
    });
});

describe('POST /NewGameSimulation', () => {
    it('respond with newly created game instance', (done) => {
        server
            .post('/gameinstances/createGameInstance')
            .send({
                gameinstance_name: "Chess",
                gameinstance_photo_path: "/chess",
                game_parameters: { "key": "value" },
                createdby_adminid: "d07f452e-d05b-11eb-b8bc-0242ac130003",
                invite_url: "def.com"
            })
            .set('X-API-Key', 'foobar')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .then(res => {
                console.log('Game Instance created successfully: ' + JSON.stringify(res.body));
                done();
            }).catch(done);
    });
});

describe('PUT /UpdateGameSimulation', () => {
    it('respond with updated game instance', (done) => {
        const id = "c8a39fd1-a5de-42c8-8558-20687813ea62";
        server
            .put('/gameinstances/update/' + id)
            .send({ gameinstance_photo_path: "/chessgame" })
            .set('X-API-Key', 'foobar')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .then(res => {
                console.log('Game Instance updated successfully: ' + JSON.stringify(res.body));
                done();
            }).catch(done);
    });
});

describe('DELETE /DeleteGameSimulation', () => {
    it('respond with success message', (done) => {
        const id = "cc717876-3e8b-4292-970a-82007136b11b";
        server
            .delete('/gameinstances/delete/' + id)
            .set('X-API-Key', 'foobar')
            .set('Accept', 'application/json')
            .expect(200)
            .then(res => {
                console.log('Game Instance deleted successfully');
                done();
            }).catch(done);
    });
});
