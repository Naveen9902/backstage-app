import webpush from 'web-push';

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || '';

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(
    'mailto:support@backstage.com',
    vapidPublicKey,
    vapidPrivateKey
  );
}

export async function sendPushNotification(subscriptionJson: string, payload: { title: string; body: string; url?: string }) {
  if (!vapidPublicKey || !vapidPrivateKey) {
    console.warn("VAPID keys not set. Skipping push notification.");
    return false;
  }
  try {
    const subscription = JSON.parse(subscriptionJson);
    await webpush.sendNotification(subscription, JSON.stringify(payload));
    return true;
  } catch (error) {
    console.error("Error sending push notification:", error);
    return false;
  }
}
