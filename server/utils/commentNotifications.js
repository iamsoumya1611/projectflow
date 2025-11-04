// Utility functions for comment notifications

const sendCommentNotification = (io, commentData, projectId = null, taskId = null) => {
  try {
    // Send notification to all users in the project/task room except the comment author
    if (projectId) {
      io.to(projectId).emit('newProjectCommentNotification', {
        ...commentData,
        projectId,
        type: 'project'
      });
    }
    
    if (taskId) {
      io.to(taskId).emit('newTaskCommentNotification', {
        ...commentData,
        taskId,
        type: 'task'
      });
    }
    
    console.log('Comment notification sent successfully');
  } catch (error) {
    console.error('Error sending comment notification:', error);
  }
};

const sendCommentDeletionNotification = (io, commentData, projectId = null, taskId = null) => {
  try {
    // Send notification for comment deletion
    if (projectId) {
      io.to(projectId).emit('deletedProjectCommentNotification', {
        ...commentData,
        projectId,
        type: 'project'
      });
    }
    
    if (taskId) {
      io.to(taskId).emit('deletedTaskCommentNotification', {
        ...commentData,
        taskId,
        type: 'task'
      });
    }
    
    console.log('Comment deletion notification sent successfully');
  } catch (error) {
    console.error('Error sending comment deletion notification:', error);
  }
};

module.exports = {
  sendCommentNotification,
  sendCommentDeletionNotification
};