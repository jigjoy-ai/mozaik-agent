export class UuidGenerator {
	static create(): string {
		return crypto.randomUUID()
	}
}
