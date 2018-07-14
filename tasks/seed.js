const users_sample = [
    // add sample users
    // {
    //     "_id": "e8523b6f-e977-47fa-b4cc-b8a139feb47f",
    //     "username": "Mercury",
    //     "sessionId": "2e695386-792a-45ff-b658-f2a46b2cf231",
    //     "email": "mercury@gmail.com",
    //     "hashedPassword": "$2a$09$tPMtl54IJX9AUyPIkE9wGemUGss2yMFHfOrljgkbdwjFOEIBeksEW", // plain: mercurypasswd
    //     "profile": {
    //         "firstName": "Mike",
    //         "lastName": "Brown",
    //         "balance": 9195
    //     },
    //     "verified": true,
    //     "blocked": false
    // }
];

const colls = require("../config/mongoCollections");

module.exports = async function () {
    let users = await colls.users();
    for (let u of users_sample) {
        await users.insertOne(u);
    }
    console.log('database initialization done');
}
