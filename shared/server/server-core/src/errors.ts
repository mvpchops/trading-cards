export class BackendApplicationError extends Error {
	constructor(message = "A backend application error occurred", cause?: Error) {
		super(message);
		this.name = this.constructor.name;
		this.cause = cause;
	}
}
