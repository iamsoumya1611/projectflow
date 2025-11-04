const taskController = require('./controllers/taskController');

console.log('Task Controller Functions:');
console.log('getTasks:', typeof taskController.getTasks);
console.log('getTaskById:', typeof taskController.getTaskById);
console.log('getTasksByProject:', typeof taskController.getTasksByProject);
console.log('createTask:', typeof taskController.createTask);
console.log('updateTask:', typeof taskController.updateTask);
console.log('deleteTask:', typeof taskController.deleteTask);
console.log('addComment:', typeof taskController.addComment);
console.log('deleteComment:', typeof taskController.deleteComment);