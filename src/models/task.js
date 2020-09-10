const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
    trim: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User"
  }

}, {
  timestamps: true
});

const Task = mongoose.model("Task",taskSchema);

/* const task = new Task({
  description: "  learn mongoose course  "
});

task.save().then(() => {
  console.log("New task saved,",task);
}).catch((err) => {
  console.log(err);
}); */

module.exports = Task;