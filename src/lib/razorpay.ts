import Razorpay from 'razorpay';

const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_test_mock_fallback_key';
const key_secret = process.env.RAZORPAY_KEY_SECRET || 'mock_fallback_secret';

export const razorpay = new Razorpay({
  key_id,
  key_secret,
});
