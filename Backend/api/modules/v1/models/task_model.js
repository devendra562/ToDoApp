const common = require("../../../config/common");
const lang = require("../../../config/language");
const Codes = require("../../../config/status_codes");
const taskSchema = require("../../schema/task_schema");
const notificationSchema = require("../../schema/notification_schema");
const socketIO = require("../../../utils/soket");

const task_model = {
    //////////////////////////////////////////////////////////////////////////////////////////
    /////                                  Add Task                                      /////
    //////////////////////////////////////////////////////////////////////////////////////////
    async createTask(req, res) {
        try {
            const { title, description, dueDate, assignee, priority } = req;

            // Create new task object
            const newTask = new taskSchema({
                title,
                description,
                dueDate,
                assignee,
                priority,
                createdBy: req.user_id
            });

            await newTask.validate();
            const savedTask = await newTask.save();

            //Save notification in DB
            console.log("Saving notification for task creation", req);
            const notification = new notificationSchema({
                type: 'task_created',
                user_id: assignee,
                message: `You have been assigned a new task: ${title}`,
                title: `Task Assigned: ${title}`
            });

            await notification.save();

            // Convert to plain object if needed
            const taskObj = savedTask.toObject ? savedTask.toObject() : savedTask;

            const io = socketIO.getIO();
            // Send notification to assignee
            io.to(`user_${assignee}`).emit('taskAssigned', {
                task: taskObj,
                notification: {
                    type: 'task_assigned',
                    message: `You have been assigned a new task: ${title}`,
                    taskId: taskObj._id,
                    from: req.user_id
                }
            });
            io.emit('taskCreated', { task: taskObj });

            return await common.sendResponse(res, Codes.SUCCESS, lang[req.language]['rest_keywords_task_created_success'], taskObj);
        } catch (error) {
            console.log("Error in createTask:", error);
            
            return await common.sendResponse(res, Codes.INTERNAL_ERROR, lang[req.language]['rest_keyword_something_went_wrong'], null);
        }
    },

    //////////////////////////////////////////////////////////////////////////////////////////
    /////                                    Get Task                                    /////
    //////////////////////////////////////////////////////////////////////////////////////////    
    async getTasks(req, res) {
        try {
            const search = req.search?.trim() || null;
            const matchStage = {};

            if (req.status) matchStage.status = req.status;
            if (req.priority) matchStage.priority = req.priority;
            if (req.assignee) matchStage.assignee = req.assignee;

            const pipeline = [
                {
                    $lookup: {
                        from: 'users',
                        localField: 'assignee',
                        foreignField: '_id',
                        as: 'assignee'
                    }
                },
                {
                    $unwind: {
                        path: '$assignee',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'createdBy',
                        foreignField: '_id',
                        as: 'createdBy'
                    }
                },
                {
                    $unwind: {
                        path: '$createdBy',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $match: matchStage
                }
            ];

            // Add search filters
            if (search) {
                const searchRegex = new RegExp(search, 'i');
                pipeline.push({
                    $match: {
                        $or: [
                            { title: searchRegex },
                            { description: searchRegex },
                            { priority: searchRegex },
                            { status: searchRegex },
                            { 'assignee.name': searchRegex },
                            { 'assignee.email': searchRegex }
                        ]
                    }
                });
            }

            pipeline.push({ $sort: { createdAt: -1 } });

            const tasks = await taskSchema.aggregate(pipeline);

            return await common.sendResponse(
                res,
                Codes.SUCCESS,
                lang[req.language]['rest_keywords_task_list_success'],
                tasks
            );

        } catch (error) {
            console.error('Error in getTasks:', error);
            return await common.sendResponse(
                res,
                Codes.INTERNAL_ERROR,
                lang[req.language]['rest_keyword_something_went_wrong'],
                null
            );
        }
    },

    //////////////////////////////////////////////////////////////////////////////////////////
    /////                               Get Task Details                                 /////
    //////////////////////////////////////////////////////////////////////////////////////////    
    async getTaskById(req, res) {
        try {
            const task = await taskSchema.findById(req.task_id)
                .populate("assignee", "name email")
                .populate("createdBy", "name email");

            if (!task) {
                return await common.sendResponse(res, Codes.NOT_FOUND, lang[req.language]['rest_keywords_task_not_found'], null);
            }

            return await common.sendResponse(res, Codes.SUCCESS, lang[req.language]['rest_keywords_task_details_success'], task);
        } catch (error) {
            return await common.sendResponse(res, Codes.INTERNAL_ERROR, lang[req.language]['rest_keyword_something_went_wrong'], null);
        }
    },

    //////////////////////////////////////////////////////////////////////////////////////////
    /////                               Update Task Details                              ///// 
    //////////////////////////////////////////////////////////////////////////////////////////
    async updateTask(req, res) {
        try {
            const { title, description, dueDate, status, priority, assignee } = req;

            const originalTask = await taskSchema.findById(req.task_id).populate('assignee', 'name email');

            if (!originalTask) {
                return await common.sendResponse(res, Codes.NOT_FOUND, lang[req.language]['rest_keywords_task_not_found'], null);
            }

            const updatedTask = await taskSchema.findByIdAndUpdate(
                req.task_id,
                { title, description, dueDate, status, priority, assignee },
                { new: true }
            );

            await updatedTask.populate('assignee', 'name email');
            await updatedTask.populate('createdBy', 'name email');

            const taskObj = updatedTask.toObject ? updatedTask.toObject() : updatedTask;
            const io = socketIO.getIO();

            const originalAssigneeId = originalTask.assignee ? originalTask.assignee._id.toString() : null;
            const newAssigneeId = assignee ? assignee.toString() : null;

            // Assignee changed
            if (originalAssigneeId !== newAssigneeId) {
                if (newAssigneeId) {
                    const assignMsg = `You have been assigned to task: ${title}`;

                    // Emit socket
                    io.to(`user_${newAssigneeId}`).emit('taskAssigned', {
                        task: taskObj,
                        notification: {
                            type: 'task_assigned',
                            message: assignMsg,
                            taskId: taskObj._id,
                            from: req.user_id
                        }
                    });

                    // Save notification in DB
                    await notificationSchema.create({
                        user_id: newAssigneeId,
                        type: 'task_assigned',
                        message: assignMsg
                    });
                }

                if (originalAssigneeId) {
                    const unassignMsg = `You have been unassigned from task: ${title}`;

                    // Emit socket
                    io.to(`user_${originalAssigneeId}`).emit('taskUnassigned', {
                        task: taskObj,
                        notification: {
                            type: 'task_unassigned',
                            message: unassignMsg,
                            taskId: taskObj._id,
                            from: req.user_id
                        }
                    });

                    // Save notification in DB
                    await notificationSchema.create({
                        user_id: originalAssigneeId,
                        type: 'task_unassigned',
                        message: unassignMsg,
                    });
                }
            } else if (newAssigneeId) {
                const updateMsg = `Your assigned task has been updated: ${title}`;

                // Emit socket
                io.to(`user_${newAssigneeId}`).emit('taskUpdated', {
                    task: taskObj,
                    notification: {
                        type: 'task_updated',
                        message: updateMsg,
                        taskId: taskObj._id,
                        from: req.user_id
                    }
                });

                // Save notification in DB
                await notificationSchema.create({
                    user_id: newAssigneeId,
                    type: 'task_updated',
                    message: updateMsg
                });
            }

            // Broadcast update to all clients
            io.emit('taskDetailsUpdated', { task: taskObj });

            return await common.sendResponse(res, Codes.SUCCESS, lang[req.language]['rest_keywords_task_updated_success'], taskObj);

        } catch (error) {
            console.log("Error in updateTask:", error);
            return await common.sendResponse(res, Codes.INTERNAL_ERROR, lang[req.language]['rest_keyword_something_went_wrong'], null);
        }
    },


    //////////////////////////////////////////////////////////////////////////////////////////
    /////                               Mark Task as Completed                            /////
    //////////////////////////////////////////////////////////////////////////////////////////
    async markAsCompleted(req, res) {
        try {
            const task = await taskSchema.findByIdAndUpdate(req.task_id, { status: "completed" }, { new: true });

            if (!task) {
                return await common.sendResponse(res, Codes.NOT_FOUND, lang[req.language]['rest_keywords_task_not_found'], null);
            }

            return await common.sendResponse(res, Codes.SUCCESS, lang[req.language]['rest_keywords_task_completed_success'], task);
        } catch (error) {
            console.log("Error in markAsCompleted:", error);
            return await common.sendResponse(res, Codes.INTERNAL_ERROR, lang[req.language]['rest_keyword_something_went_wrong'], null);
        }
    },

    //////////////////////////////////////////////////////////////////////////////////////////
    /////                               Delete Task                                      /////
    //////////////////////////////////////////////////////////////////////////////////////////
    async deleteTask(req, res) {
        try {
            const task = await taskSchema.findByIdAndDelete(req.task_id);

            if (!task) {
                return await common.sendResponse(res, Codes.NOT_FOUND, lang[req.language]['rest_keywords_task_not_found'], null);
            }

            return await common.sendResponse(res, Codes.SUCCESS, lang[req.language]['rest_keywords_task_deleted_success'], null);
        } catch (error) {
            return await common.sendResponse(res, Codes.INTERNAL_ERROR, lang[req.language]['rest_keyword_something_went_wrong'], null);
        }
    }
}

module.exports = task_model;