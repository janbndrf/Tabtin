// Connection pool for LLM API requests with rate limiting

interface PooledRequest<T> {
	fn: () => Promise<T>;
	resolve: (value: T) => void;
	reject: (error: any) => void;
	timestamp: number;
}

export class ConnectionPool {
	private queue: PooledRequest<any>[] = [];
	private activeRequests = 0;
	private requestTimestamps: number[] = [];
	private processing = false;

	constructor(
		private maxConcurrency: number,
		private requestsPerMinute: number
	) {}

	async execute<T>(fn: () => Promise<T>): Promise<T> {
		return new Promise<T>((resolve, reject) => {
			this.queue.push({
				fn,
				resolve,
				reject,
				timestamp: Date.now()
			});

			this.processQueue();
		});
	}

	private async processQueue(): Promise<void> {
		if (this.processing) return;
		this.processing = true;

		while (this.queue.length > 0 && this.activeRequests < this.maxConcurrency) {
			// Check rate limit
			if (!this.canMakeRequest()) {
				await this.waitForRateLimit();
				continue;
			}

			const request = this.queue.shift();
			if (!request) break;

			this.activeRequests++;
			this.recordRequest();

			// Execute request
			request
				.fn()
				.then(request.resolve)
				.catch(request.reject)
				.finally(() => {
					this.activeRequests--;
					this.processQueue();
				});
		}

		this.processing = false;
	}

	private canMakeRequest(): boolean {
		this.cleanOldTimestamps();
		return this.requestTimestamps.length < this.requestsPerMinute;
	}

	private cleanOldTimestamps(): void {
		const now = Date.now();
		const oneMinuteAgo = now - 60000;
		this.requestTimestamps = this.requestTimestamps.filter((ts) => ts > oneMinuteAgo);
	}

	private recordRequest(): void {
		this.requestTimestamps.push(Date.now());
	}

	private async waitForRateLimit(): Promise<void> {
		this.cleanOldTimestamps();

		if (this.requestTimestamps.length < this.requestsPerMinute) {
			return;
		}

		const oldestRequest = this.requestTimestamps[0];
		const waitTime = 60000 - (Date.now() - oldestRequest);

		if (waitTime > 0) {
			await new Promise((resolve) => setTimeout(resolve, waitTime));
		}
	}

	getStats() {
		this.cleanOldTimestamps();
		return {
			activeRequests: this.activeRequests,
			queuedRequests: this.queue.length,
			requestsInLastMinute: this.requestTimestamps.length,
			maxConcurrency: this.maxConcurrency,
			requestsPerMinute: this.requestsPerMinute
		};
	}

	updateConfig(maxConcurrency: number, requestsPerMinute: number): void {
		this.maxConcurrency = maxConcurrency;
		this.requestsPerMinute = requestsPerMinute;
	}
}
