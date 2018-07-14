const mongoCollections = require("../config/mongoCollections");
const uuidv4 = require('uuid/v4');
const bcrypt = require("bcryptjs");

// double check: client-side: remind user for invalid input
// server-side: private function needs no check

// server-side private function
// return value: user object -- this is convenient to pick up related things
// no such username or wrong password return undefined
const getUserById = async function (id) {
    let users = await mongoCollections.users();
    return await users.findOne({ _id: id });
};

/*
    for better performance.
    previously, map: sessionId -> user(object)
    if has a critical bug: if the user changes his personal information, then the user obj is not up-to-date
    so change to sessionId -> userId
*/
const map = new Map();
const getUidBySessionId = async function (sid) {
    let uid = map.get(sid);
    if (uid) return uid;
    let users = await mongoCollections.users();
    user = await users.findOne({ sessionId: sid });
    if (!user) return undefined;
    map.set(sid, user._id);
    return user._id;
};

const updateUser = async function (id, fname, lname, password) {
    let users = await mongoCollections.users();
    await users.updateOne({ _id: id }, {
        $set: {
            "profile.firstName": fname,
            "profile.lastName": lname,
            hashedPassword: await bcrypt.hash(password, 9)
        }
    })
    return true;
};


// return value: user object or error message object;
const checkHashPass = async function (formUser, formPass) {
    let users = await mongoCollections.users();
    let user = await users.findOne({ username: formUser });
    if (!user) return { err: 'no user' };
    let pass = await bcrypt.compare(formPass, user.hashedPassword);
    if (!pass) return { err: 'wrong password' };
    // assign a new sessionid
    nsession = uuidv4();
    user.sessionId = nsession;
    users.updateOne({ _id: user._id }, { $set: { sessionId: nsession } })
    return user;
};

// return value: a user object or an error message object
// leave arguments check to router
const addUser = async function addUser(username, email, password, fname, lname) {
    let users = await mongoCollections.users();
    if (await users.findOne({ username: username })) return { err: 'user exist' };
    if (await users.findOne({ email: email })) return { err: 'email exist' };

    const saltRounds = 9;
    const userObj = {
        _id: uuidv4(),
        username,
        sessionId: uuidv4(),
        email,
        hashedPassword: await bcrypt.hash(password, saltRounds),
        profile: {
            firstName:fname,
            lastName:lname,
        },
        verified: true,
        blocked: false
    }
    const insertUser = await users.insertOne(userObj);
    if (insertUser.insertedCount === 0)
        throw `Could not add user`;

    return userObj;
};

module.exports = {
    getUserById,
    getUidBySessionId,
    updateUser,
    checkHashPass,
    addUser
};