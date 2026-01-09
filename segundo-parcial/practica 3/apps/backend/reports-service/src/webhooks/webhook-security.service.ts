import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class WebhookSecurityService {
	generateTimestamp(): string {
		return Math.floor(Date.now() / 1000).toString();
	}

	generateSignature(payload: unknown, secret: string, timestamp: string): string {
		const payloadString = JSON.stringify(payload);
		const message = `${timestamp}.${payloadString}`;
		const hmac = crypto.createHmac('sha256', secret).update(message).digest('hex');
		return `sha256=${hmac}`;
	}

	isTimestampValid(timestamp: string, maxAgeMinutes = 5): boolean {
		const now = Math.floor(Date.now() / 1000);
		const ts = parseInt(timestamp, 10);
		if (Number.isNaN(ts)) return false;
		const delta = Math.abs(now - ts);
		return delta <= maxAgeMinutes * 60;
	}
}