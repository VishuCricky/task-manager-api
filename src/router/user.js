const express = require("express");
const multer = require("multer");
const sharp = require("sharp");
const User = require("../models/user");
const authMiddleware = require("../middleware/auth");
const {sendWelcomeEmail, sendCancellationEmail} = require("../emails/account");
const router = new express.Router();

router.post("/users", async (incomingReq,outgoingResp) => {

  const user = new User(incomingReq.body);

  try {
    await user.save();
    sendWelcomeEmail(user.email, user.name);
    const token = await user.generateAuthToken();
    outgoingResp.status(201).send({user, token});
  } catch (err) {
    outgoingResp.status(400).send(err);
  }

  /* user.save().then(()=>{
    outgoingResp.status(201).send(user);
  }).catch((err) => {
    outgoingResp.status(400).send(err);
  }) */
});

router.post("/users/login", async (incomingReq,outgoingResp) => {
  try {
    const user = await User.findByCredentials(incomingReq.body.email, incomingReq.body.password);
    const token = await user.generateAuthToken();
    //outgoingResp.send({user : user.getPublicProfile(), token});
    outgoingResp.send({user, token});
  } catch (err) {
    outgoingResp.status(400).send(err);
  }
});

router.post("/users/logout", authMiddleware, async (incomingReq, outgoingResp) => {
  try {
    incomingReq.user.tokens = incomingReq.user.tokens.filter(token => token.token !== incomingReq.token);
    await incomingReq.user.save();
    outgoingResp.send();
  } catch (err) {
    outgoingResp.status(500).send();
  }
});

router.post("/users/logoutAll", authMiddleware, async (incomingReq, outgoingResp) => {
  try {
    incomingReq.user.tokens = [];
    await incomingReq.user.save();
    outgoingResp.send();
  } catch (err) {
    outgoingResp.status(500).send();
  }
});

router.get("/users/me", authMiddleware, async (incomingReq,outgoingResp) => {

  outgoingResp.send(incomingReq.user);
  
  /* try {
    const users = await User.find({});
    outgoingResp.send(users);
  } catch (err) {
    outgoingResp.status(500).send();
  } */

  /* User.find({}).then((users) => {
    outgoingResp.send(users);
  }).catch((err) => {
    outgoingResp.status(500).send();
  }); */
});

/* router.get("/users/:id", authMiddleware, async (incomingReq,outgoingResp) => {
  
  const _id = incomingReq.params.id;

  try {
    const user = await User.findById(_id);
    if(!user){
      return outgoingResp.status(404).send();
    }
    outgoingResp.send(user);
  } catch (err) {
    outgoingResp.status(500).send();
  }
  
}); */

router.patch("/users/me", authMiddleware, async (incomingReq,outgoingResp) => {

  const allowedUpdates = ["name", "email", "password", "age"];
  const updates = Object.keys(incomingReq.body);
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if(!isValidOperation){
    return outgoingResp.status(400).send({"error": "Invalid updates!"});
  }
  try {
    //const user = await User.findByIdAndUpdate(incomingReq.params.id, incomingReq.body, {new: true, runValidators: true});
    //const user = await User.findById(incomingReq.params.id);
    /* if(!user){
      return outgoingResp.status(404).send();
    } */
    updates.forEach(update => incomingReq.user[update] = incomingReq.body[update]);
    await incomingReq.user.save();
    outgoingResp.send(incomingReq.user);
  } catch (err) {
    outgoingResp.status(400).send(err);
  }
});

router.delete("/users/me", authMiddleware, async (incomingReq,outgoingResp) => {
  try {
    /* const user = await User.findByIdAndDelete(incomingReq.user._id);
    if(!user){
      return outgoingResp.status(404).send();
    } */
    await incomingReq.user.remove();
    sendCancellationEmail(incomingReq.user.email, incomingReq.user.name);
    outgoingResp.send(incomingReq.user);
  } catch (err) {
    outgoingResp.status(500).send();
  }
});

const upload = multer({
  //dest: "avatars",
  limits: {
    fileSize: 1000000
  },
  fileFilter(incomingReq, file, cb){
    
    if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
      return cb(new Error("Please upload an image"));
    }
    cb(undefined, true);

    /* cb(new Error("Please upload an image"));
    cb(undefined, true);
    cb(undefined, false); */
  } 
});

router.post("/users/me/avatar", authMiddleware, upload.single("avatar"), async (incomingReq,outgoingResp) => {

  // incomingReq.user.avatar = incomingReq.file.buffer; 
  const buffer = await sharp(incomingReq.file.buffer).resize({width: 250, height: 250}).png().toBuffer();
  incomingReq.user.avatar = buffer;
  await incomingReq.user.save();
  outgoingResp.send();
}, (error, incomingReq, outgoingResp, next) => {
  outgoingResp.status(400).send({error: error.message});
});

router.delete("/users/me/avatar", authMiddleware, async (incomingReq,outgoingResp) => {

  try {
    
    incomingReq.user.avatar = undefined;
    await incomingReq.user.save();
    outgoingResp.send();
  } catch (err) {
    outgoingResp.status(500).send();
  }
});

router.get("/users/:id/avatar", async (incomingReq, outgoingResp) => {
  try {
    const user = await User.findById(incomingReq.params.id);

    if(!user || !user.avatar){
      throw new Error();
    }

    outgoingResp.set("Content-Type", "image/png");
    outgoingResp.send(user.avatar);
  } catch (err) {
    outgoingResp.status(400).send();
  }
});

module.exports = router;