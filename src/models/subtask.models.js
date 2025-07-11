import mongoose, { Schema } from "mongoose";

const subtaskSchema = new Schema(
	{
		title: {
			type: String,
			required: true,
			trim: true,
		},
		task: {
			type: Schema.Types.ObjectId,
			ref: "Task",
			required: true,
		},
		isCompleted: {
			type: Boolean,
			default: false,
		},
		createdBy: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
	},
	{ timestamps },
);

export const SubTask = new mongoose.model("SubTask", subtaskSchema);
