const crypto = require('crypto');

const secret = 'c5f7f29333a762ec79304d83be04f71ac0e5cc8b7b33'; // tu WEBHOOK_SECRET real
const payload = {
  id: "test-id",
  type: "test",
  payload: { foo: "bar" },
  timestamp: 1766127983 // actualiza este valor según tu prueba
};

const body = JSON.stringify(payload);

const signature = crypto
  .createHmac('sha256', secret)
  .update(body)
  .digest('hex');

console.log('x-webhook-signature:', signature);
console.log('x-webhook-timestamp:', payload.timestamp);
