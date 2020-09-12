const express = require("express");
require("./db/mongoose");
const userRouter = require("./router/user");
const taskRouter = require("./router/task");


const app = express();
//const port = process.env.PORT;

/* app.use((incomingReq, outgoingRes, next) => {

  //console.log(incomingReq.method, incomingReq.path);
  if(incomingReq.method === "GET"){
    outgoingRes.send("GET requests are disabled!");
  }else{
    next();
  }
  
}); */

/* app.use((incomingReq, outgoingRes, next) => {
  outgoingRes.status(503).send("Site is currently down. Check back soon!");
}); */

/* const multer = require("multer");
const upload = multer({
  dest: "images"
})

app.post("/upload", upload.single("upload"), (incomingReq,outgoingResp) => {

  outgoingResp.send();
}); */

app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

module.exports = app;
/* 
Without middleware: new request -> run router handler

With middleware: new request -> do something -> run route handler
*/

/* app.listen(port, ()=>{
  console.log(`Server is up on port ${port}`);
}); */

/* const jwt = require("jsonwebtoken");

const myFunction = async () => {
  const token = jwt.sign({ _id:"abc123" },"thisisasecret", {expiresIn: "7 days"});
  console.log(token);

  const data = jwt.verify(token,"thisisasecret");
  console.log(data);
}

myFunction(); */

/* const pet = {
  name: "Bugsy"
}

pet.toJSON = function(){
  return {};
}

console.log(JSON.stringify(pet)); */

/* const Task = require("./models/task");
const User = require("./models/user");

const main = async () => {
  const task = await Task.findById("5f5770467335f60ea4ddef5b");
  await task.populate("owner").execPopulate();
  console.log(task.owner);

  const user = await User.findById("5f576f8bb68e9e42ac7e7a2e");
  await user.populate("tasks").execPopulate();
  console.log(user.tasks);
  
}

main(); */

