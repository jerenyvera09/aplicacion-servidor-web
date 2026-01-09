const crypto = require('crypto');

const secret = 'c5f7f29333a762ec79304d83be04f71ac0e5cc8b7b33'; // tu WEBHOOK_SECRET real
const timestamp = '1766125309'; // timestamp actual proporcionado
const body = '{"id":"test-id","type":"test","payload":{"foo":"bar"}}'; // tu body exacto

const mensaje = `${timestamp}.${body}`;
const signature = crypto
  .createHmac('sha256', secret)
  .update(mensaje)
  .digest('hex');

console.log('x-webhook-signature:', signature);
