/// <reference types="lucia" />
declare namespace Lucia {
	type Auth = import("@/lib/auth/lucia").Auth;

	type DatabaseUserAttributes = {
		email: string;
		last_name: string;
		first_name: string;
		is_verified: boolean;
	};

	type DatabaseSessionAttributes = {};
}
