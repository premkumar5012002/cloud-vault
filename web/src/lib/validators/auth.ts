import { z } from "zod";

export const SignInSchema = z.object({
	email: z.string().email("Please provide a valid email address"),
	password: z
		.string()
		.min(8, { message: "Password must be mininum 8 characters" })
		.max(256, { message: "Password should not exceed 256 characters" }),
});

export const SignUpSchema = z.object({
	firstName: z.string().min(1, "First name can't be empty"),
	lastName: z.string().min(1, "Last name can't be empty"),
	email: z.string().email("Please provide a valid email address"),
	password: z
		.string()
		.min(8, { message: "Password must be mininum 8 characters" })
		.max(256, { message: "Password should not exceed 256 characters" }),
});

export const ForgetPasswordSchema = z.object({
	email: z.string().email("Please provide a valid email address"),
});

export const ResetPasswordSchema = z
	.object({
		password: z
			.string()
			.min(8, { message: "Password must be mininum 8 characters" })
			.max(256, { message: "Password should not exceed 256 characters" }),
		confirmPassword: z.string(),
	})
	.refine(
		(values) => {
			return values.password === values.confirmPassword;
		},
		{
			message: "Passwords must match!",
			path: ["confirmPassword"],
		}
	);

export type SignIn = z.infer<typeof SignInSchema>;
export type SignUp = z.infer<typeof SignUpSchema>;
export type ResetPassword = z.infer<typeof ResetPasswordSchema>;
export type ForgetPassword = z.infer<typeof ForgetPasswordSchema>;
