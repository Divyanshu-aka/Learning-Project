import mongoose, { Schema } from "mongoose";
import { AvailableTaskStatuses, TaskStatusEnum } from "../utils/constants";

const taskSchema = new Schema(
	{
		title: {
			type: String,
			required: true,
			trim: true,
		},
		description: {
			type: String,
		},
		project: {
			type: Schema.Types.ObjectId,
			ref: "Project",
			required: true, //[true, "Project ref is required"],
		},
		assignedTo: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		assignedBy: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		status: {
			type: String,
			enum: AvailableTaskStatuses,
			default: TaskStatusEnum.TODO,
		},
		attachements: {
			type: [
				{
					url: String,
					mimetype: String, // MIME type of the file
					size: Number,
				},
			],
			default: [],
		},
	},
	{ timestamps: true },
);

export const Task = new mongoose.model("Task", taskSchema);
