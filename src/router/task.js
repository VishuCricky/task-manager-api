const express = require("express");
const Task = require("../models/task");
const authMiddleware = require("../middleware/auth");
const router = new express.Router();

router.post("/tasks", authMiddleware, async (incomingReq,outgoingResp) => {

  //const task = new Task(incomingReq.body);
  const task = new Task({
    ...incomingReq.body,
    owner: incomingReq.user._id
  });
  try {
    await task.save();
    outgoingResp.status(201).send(task);
  } catch (err) {
    outgoingResp.status(400).send(err);
  }

  /* task.save().then(() => {
    outgoingResp.status(201).send(task);
  }).catch((err) => {
    outgoingResp.status(400).send(err);
  }); */
});

// GET /tasks?completed=false or /tasks?completed=true
// GET /tasks?limit=10&skip=20
// GET /tasks?sortBy=createdAt:asc
router.get("/tasks", authMiddleware, async (incomingReq,outgoingResp) => {

  const match = {};
  const sort = {};

  if(incomingReq.query.completed){
    match.completed = incomingReq.query.completed === "true";
  }

  if(incomingReq.query.sortBy){
    const parts = incomingReq.query.sortBy.split(":");
    sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
  }

  try {
    // const tasks = await Task.find({owner: incomingReq.user._id});
    // await incomingReq.user.populate("tasks").execPopulate();
    await incomingReq.user.populate({
      path: "tasks",
      match,
      options: {
        limit: parseInt(incomingReq.query.limit),
        skip: parseInt(incomingReq.query.skip),
        sort
      }
    }).execPopulate();
    outgoingResp.send(incomingReq.user.tasks);
  } catch (err) {
    outgoingResp.status(500).send();
  }

  /* Task.find({}).then((tasks) => {
    outgoingResp.send(tasks);
  }).catch((err) => {
    outgoingResp.status(500).send();
  }); */
});

router.get("/tasks/:id", authMiddleware, async (incomingReq,outgoingResp) => {
  const _id = incomingReq.params.id;

  try {
    // const task = await Task.findById(_id);
    const task = await Task.findOne({_id, owner: incomingReq.user._id});
    if(!task){
      return outgoingResp.status(404).send();
    }
    outgoingResp.send(task);
  } catch (err) {
    outgoingResp.status(500).send();
  }

  /* Task.findById(_id).then((task) => {
    if(!task){
      return outgoingResp.status(404).send();
    }
    outgoingResp.send(task);
  }).catch((err) => {
    outgoingResp.status(500).send();
  }); */
});

router.patch("/tasks/:id",  authMiddleware, async (incomingReq,outgoingResp) => {

  const allowedUpdates = ["description","completed"];
  const updates = Object.keys(incomingReq.body);
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if(!isValidOperation){
    return outgoingResp.status(400).send({"error": "Invalid updates!"});
  }
  try {
    //const task = await Task.findByIdAndUpdate(incomingReq.params.id, incomingReq.body, {new: true, runValidators: true});
    //const task = await Task.findById(incomingReq.params.id);
    const task = await Task.findOne({_id: incomingReq.params.id, owner: incomingReq.user._id});
    if(!task){
      return outgoingResp.status(404).send();
    }
    updates.forEach(update => task[update] = incomingReq.body[update]);
    await task.save();
    outgoingResp.send(task);
  } catch (err) {
    outgoingResp.status(400).send();
  }
});

router.delete("/tasks/:id", authMiddleware, async (incomingReq,outgoingResp) => {
  try {
    //const task = await Task.findByIdAndDelete(incomingReq.params.id);
    const task = await Task.findOneAndDelete({_id: incomingReq.params.id, owner: incomingReq.user._id});
    if(!task){
      return outgoingResp.status(404).send();
    }
    outgoingResp.send(task);
  } catch (err) {
    outgoingResp.status(500).send();
  }
});

module.exports = router;