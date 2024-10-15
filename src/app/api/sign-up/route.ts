import dbConnect from "@/lib/dbConnect"

import bcrypt from "bcryptjs"

import { sendVerificationEmail } from "@/helpers/sendVerificationEmails"
import { messageSchema } from "@/schemas/messageSchema";

export async function POST(request: Request) {
    await dbConnect()

    try {
        const {username, email, password} = await request.json()
    } catch (error) {
        console.error("Error Resgistering User", error);
        return Response.json(
            {
                success: false,
                message: "Error in Registering User"
            },
            {
                status: 500,
            }
        )
    }
}
