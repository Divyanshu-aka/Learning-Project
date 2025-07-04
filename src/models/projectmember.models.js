import mongoose, { Schema } from "mongoose";
import { AvailableUserRoles, UserRolesEnum } from "../utils/constants";

const projectmemberSchema = new Schema(
	{
		user: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		project: {
			type: Schema.Types.ObjectId,
			ref: "Project",
			required: true,
		},
		role: {
			type: String,
			enum: Object.values(AvailableUserRoles),
			default: UserRolesEnum.MEMBER,
		},
	},
	{ timestamps: true },
);

export const ProjectMember = new mongoose.model(
	"ProjectMemebr",
	projectmemberSchema,
);
