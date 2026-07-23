'use client'

import { useState, useEffect } from 'react'

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export default function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState(false)
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true)
      registerServiceWorker()
    }
  }, [])

  async function registerServiceWorker() {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
      updateViaCache: 'none',
    })
    const sub = await registration.pushManager.getSubscription()
    setSubscription(sub)
  }

  async function subscribeToPush() {
    try {
      const registration = await navigator.serviceWorker.ready
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!vapidKey) {
        setMessage('VAPID key not configured.')
        return
      }
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      })
      setSubscription(sub)
      await fetch('/api/push/subscribe', {
        method: 'POST',
        body: JSON.stringify(sub)
      })
    } catch (err) {
      console.error(err)
      setMessage('Subscription failed. Did you grant permissions?')
    }
  }

  async function unsubscribeFromPush() {
    await subscription?.unsubscribe()
    setSubscription(null)
  }

  async function sendTestNotification() {
    setMessage('Sending test notification...')
    const res = await fetch('/api/push/test', { method: 'POST' })
    if (res.ok) setMessage('Test notification sent!')
    else setMessage('Failed to send notification')
  }

  if (!isSupported) {
    return (
      <div className="p-4 border rounded-xl bg-gray-50 text-sm">
        Push notifications are not supported in this browser.
      </div>
    )
  }

  return (
    <div className="p-4 border border-[#bae6fd] bg-[#f0f9ff] rounded-xl flex flex-col items-start gap-4 shadow-sm w-full">
      <h3 className="font-bold text-blue-900">Push Notifications</h3>
      {subscription ? (
        <>
          <p className="text-sm text-blue-800">You are currently subscribed to receive notifications.</p>
          <div className="flex gap-2">
            <button
              onClick={unsubscribeFromPush}
              className="px-4 py-2 bg-white text-blue-900 font-bold border border-blue-200 rounded-lg hover:bg-gray-50"
            >
              Unsubscribe
            </button>
            <button
              onClick={sendTestNotification}
              className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700"
            >
              Send Test
            </button>
          </div>
          {message && <p className="text-xs text-blue-800 mt-2">{message}</p>}
        </>
      ) : (
        <>
          <p className="text-sm text-blue-800">Enable push notifications to stay updated instantly.</p>
          <button
            onClick={subscribeToPush}
            className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700"
          >
            Enable Notifications
          </button>
          {message && <p className="text-xs text-red-600 mt-2">{message}</p>}
        </>
      )}
    </div>
  )
}
