process.env.NODE_ENV = "test";

require("dotenv").config();

const request = require("supertest");
    // simulate http requests
const chai = require("chai");
const mongoose = require("mongoose");

const app = require("../app");
const User = require("../models/User");
const Dog = require("../models/Dog");

require("../db");

const expect = chai.expect;


beforeEach(async () => {
    await User.deleteMany({});
    await Dog.deleteMany({});
});

after(async () => {
    await mongoose.connection.close();
});


describe("Dog Routes", () => {

    let token;

    beforeEach(async () => {
        const res = await request(app)
                            .post("/auth/register")
                            .send({
                                username: "dogowner",
                                password: "password123"
                            });
        token = res.body.token;
    });

    describe("POST /dogs", () => {
        it("Should create a dog for an authenticated user", async () => {
            const res = await request(app)
                                .post("/dogs")
                                .set("Authorization", `Bearer ${token}`)
                                .send({
                                    name: "Roxy",
                                    breed: "Land Seal",
                                    description: "Squishy"
                                });
            expect(res.status).to.equal(201);
            expect(res.body.message).to.equal("Dog registered successfully");
            expect(res.body.dog).to.have.property("_id");
            expect(res.body.dog.name).to.equal("Roxy");
            expect(res.body.dog.isAdopted).to.equal(false);
        });
    });

    describe("GET /dogs", () => {
        it("Should return all dogs", async () => {
            await request(app)
                    .post("/dogs")
                    .set("Authorization", `Bearer ${token}`)
                    .send({
                        name: "Roxy",
                        breed: "Land Seal",
                        description: "Squishy"
                    });
            const res = await request(app)
                                .get("/dogs")
                                .set("Authorization", `Bearer ${token}`);
            expect(res.status).to.equal(200);
            expect(res.body).to.have.property("dogs");
            expect(res.body.dogs).to.be.an("array");
            expect(res.body.dogs.length).to.equal(1);
            expect(res.body.dogs[0].name).to.equal("Roxy");
        });
    });

    describe("PATCH /dogs/:id/adopt", () => {
        it("Should allow another user to adopt a dog", async () => {
            const dogRes = await request(app)
                                .post("/dogs")
                                .set("Authorization", `Bearer ${token}`)
                                .send({
                                    name: "Roxy",
                                    breed: "Land Seal",
                                    description: "Squishy"
                                });
            const dogId = dogRes.body.dog._id;
            const secondUser = await request(app)
                                        .post("/auth/register")
                                        .send({
                                            username: "adopter",
                                            password: "password123"
                                        });
            const secondToken = secondUser.body.token;
            const res = await request(app)
                                .patch(`/dogs/${dogId}/adopt`)
                                .set("Authorization", `Bearer ${secondToken}`)
                                .send({
                                    thankYouMessage: "I will take great care of Roxy!"
                                });

            expect(res.status).to.equal(200);
            expect(res.body.message).to.equal("Dog adopted successfully");
            expect(res.body.dog.isAdopted).to.equal(true);
            expect(res.body.dog.thankYouMessage).to.equal("I will take great care of Roxy!");
        });
    });

    describe("PATCH /dogs/:id/adopt", () => {
        it("Should not allow user to adopt own dog", async () => {
            const dogRes = await request(app)
                                .post("/dogs")
                                .set("Authorization", `Bearer ${token}`)
                                .send({
                                    name: "Roxy",
                                    breed: "Land Seal",
                                    description: "Squishy"
                                });
            const dogId = dogRes.body.dog._id;
            
            const res = await request(app)
                                .patch(`/dogs/${dogId}/adopt`)
                                .set("Authorization", `Bearer ${token}`)
                                .send({
                                    thankYouMessage: "I will take great care of Roxy!"
                                });

            expect(res.status).to.equal(400);
            expect(res.body.error).to.equal("You cannot adopt your own dog.");
        });
    });

    describe("Delete /dogs/:id", () => {
        it("Should allow owner to delete non-adopted dog", async () => {
            const dogRes = await request(app)
                                .post("/dogs")
                                .set("Authorization", `Bearer ${token}`)
                                .send({
                                    name: "Roxy",
                                    breed: "Land Seal",
                                    description: "Squishy"
                                });
            const dogId = dogRes.body.dog._id;
            
            const res = await request(app)
                                .delete(`/dogs/${dogId}`)
                                .set("Authorization", `Bearer ${token}`);

            expect(res.status).to.equal(200);
            expect(res.body.message).to.equal("Dog deleted successfully");
        });
    });

    describe("Delete /dogs/:id", () => {
        it("Should prevent deleting another's dog", async () => {
            const dogRes = await request(app)
                                .post("/dogs")
                                .set("Authorization", `Bearer ${token}`)
                                .send({
                                    name: "Roxy",
                                    breed: "Land Seal",
                                    description: "Squishy"
                                });
            const dogId = dogRes.body.dog._id;

            const secondUser = await request(app)
                                        .post("/auth/register")
                                        .send({
                                            username: "secondUser",
                                            password: "password123"
                                        });
            const secondToken = secondUser.body.token;
            
            const res = await request(app)
                                .delete(`/dogs/${dogId}`)
                                .set("Authorization", `Bearer ${secondToken}`);

            expect(res.status).to.equal(403);
            expect(res.body.error).to.equal("You can only delete your own dogs");
        });
    });

    describe("Delete /dogs/:id", () => {
        it("Should prevent deleting adopted dog", async () => {
            const dogRes = await request(app)
                                .post("/dogs")
                                .set("Authorization", `Bearer ${token}`)
                                .send({
                                    name: "Roxy",
                                    breed: "Land Seal",
                                    description: "Squishy"
                                });
            const dogId = dogRes.body.dog._id;

            const secondUser = await request(app)
                                        .post("/auth/register")
                                        .send({
                                            username: "adopter",
                                            password: "password123"
                                        });
            const secondToken = secondUser.body.token;

            await request(app)
                    .patch(`/dogs/${dogId}/adopt`)
                    .set("Authorization", `Bearer ${secondToken}`)
                    .send({
                        thankYouMessage: "I love this dog"
                    });
            
            const res = await request(app)
                                .delete(`/dogs/${dogId}`)
                                .set("Authorization", `Bearer ${token}`);

            expect(res.status).to.equal(400);
            expect(res.body.error).to.equal("Adopted dogs cannot be deleted");
        });
    });
});