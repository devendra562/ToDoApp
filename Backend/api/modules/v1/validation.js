const { editProfile, changePassword } = require("./models/user_model");

const checkValidationsRules = {

    registerValidation: {
        name: 'required',
        email: 'required|email',
        password: 'required'
    },
    loginValidation: {
        email: 'required|email',
        password: 'required'
    },
    getUserDetailsValidation: {

    },
    createTaskValidation: {
        title: 'required',
        description: 'required',
        dueDate: 'required|date',
        assignee: 'required'
    },
    getTasksValidation: {

    },
    getTaskByIdValidation: {

    },
    updateTaskValidation: {
        title: 'required',
        description: 'required',
        dueDate: 'required|date',
        assignee: 'required'
    },
    markAsCompletedValidation: {

    },
    deleteTaskValidation: {

    },
    addCommentValidation: {
        comment: 'required',
    },
    getCommentsByTaskValidation: {
        // task_id: 'required'
    },
    getNotificationsByUserValidation: {

    },
    markAsReadValidation: {

    },
    deleteNotificationValidation: {

    }
}

module.exports = checkValidationsRules;