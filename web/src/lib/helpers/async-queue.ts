export class AsyncQueue {
	private running: number = 0;
	private queue: (() => Promise<void>)[] = [];

	constructor(private concurrency: number = 4) {}

	public async enqueue(asyncFunction: () => Promise<void>) {
		return new Promise<void>((resolve, reject) => {
			const task = async () => {
				try {
					await asyncFunction();
					resolve();
				} catch (e) {
					reject(e);
				} finally {
					this.running--;
					this.processQueue();
				}
			};
			this.queue.push(task);
			this.processQueue();
		});
	}

	public async awaitAll() {
		return new Promise<void>((resolve) => {
			const checkCompletion = () => {
				if (this.running === 0 && this.queue.length === 0) {
					resolve();
				}
			};
			// Check completion immediately in case there are no tasks
			checkCompletion();
			// Schedule a check whenever a task completes
			const originalProcessQueue = this.processQueue.bind(this);
			this.processQueue = () => {
				originalProcessQueue();
				checkCompletion();
			};
		});
	}

	private processQueue() {
		while (this.running < this.concurrency && this.queue.length > 0) {
			const task = this.queue.shift();
			if (task) {
				this.running++;
				task();
			}
		}
	}
}
