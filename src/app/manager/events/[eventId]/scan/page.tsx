'use client';

import { useEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function QRScannerPage() {
  const params = useParams();
  const eventId = params.eventId as string;
  const router = useRouter();
  
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'scanning' | 'processing' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    // Start scanner on mount
    setStatus('scanning');
    
    scannerRef.current = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
      /* verbose= */ false
    );
    
    scannerRef.current.render(onScanSuccess, onScanFailure);

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(error => console.error("Failed to clear html5QrcodeScanner. ", error));
      }
    };
  }, []);

  const onScanSuccess = async (decodedText: string) => {
    if (status === 'processing' || status === 'success') return; // Prevent double scans
    
    // The decodedText should be the applicationId
    setScanResult(decodedText);
    setStatus('processing');
    
    // Pause the scanner visually
    if (scannerRef.current) {
      scannerRef.current.pause(true);
    }

    try {
      const res = await fetch(`/api/manager/events/${eventId}/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId: decodedText })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setStatus('success');
        setMessage(`Successfully checked in ${data.workerName}!`);
        // Auto reset after 3 seconds
        setTimeout(() => {
          resetScanner();
        }, 3000);
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to check in worker.');
        setTimeout(() => resetScanner(), 3000);
      }
    } catch (err) {
      setStatus('error');
      setMessage('Network error occurred during scan.');
      setTimeout(() => resetScanner(), 3000);
    }
  };

  const onScanFailure = (error: any) => {
    // Ignore normal scan failures (happens every frame when no QR is found)
  };

  const resetScanner = () => {
    setStatus('scanning');
    setScanResult(null);
    setMessage('');
    if (scannerRef.current) {
      scannerRef.current.resume();
    }
  };

  return (
    <div className="min-h-screen bg-[#111111] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <button 
            onClick={() => router.push(`/manager/events/${eventId}`)}
            className="text-gray-400 hover:text-white flex items-center justify-center gap-2 mx-auto mb-4"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            Back to Event
          </button>
          <h1 className="text-3xl font-bold font-serif text-white tracking-tight">Access Scanner</h1>
          <p className="text-[#CD7F32] text-sm mt-1 uppercase tracking-widest font-bold">Scan Digital Event Pass</p>
        </div>

        <div className="bg-white rounded-3xl overflow-hidden shadow-2xl">
          <div className="p-2 bg-gray-50 border-b border-gray-100">
            {/* The html5-qrcode scanner injects into this div */}
            <div id="qr-reader" className="w-full border-none rounded-2xl overflow-hidden [&_video]:rounded-2xl"></div>
          </div>
          
          <div className="p-6 text-center h-40 flex flex-col justify-center items-center">
            {status === 'scanning' && (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" className="text-gray-400 mb-3 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/></svg>
                <p className="text-gray-500 font-medium">Point camera at worker's QR code</p>
              </>
            )}
            
            {status === 'processing' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center">
                <div className="w-8 h-8 border-4 border-[#CD7F32] border-t-transparent rounded-full animate-spin mb-3"></div>
                <p className="text-gray-800 font-bold">Verifying Pass...</p>
              </motion.div>
            )}
            
            {status === 'success' && (
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                </div>
                <p className="text-green-700 font-bold">{message}</p>
              </motion.div>
            )}

            {status === 'error' && (
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center">
                <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                </div>
                <p className="text-red-600 font-bold">{message}</p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
      
      {/* CSS overrides for the html5-qrcode UI to make it look premium */}
      <style dangerouslySetInnerHTML={{__html: `
        #qr-reader { border: none !important; }
        #qr-reader__dashboard_section_csr span { display: none !important; }
        #qr-reader__dashboard_section_swaplink { text-decoration: none !important; color: #CD7F32 !important; font-weight: bold; margin-top: 10px; display: inline-block; }
        #qr-reader__dashboard_section_csr button { background-color: #111111 !important; color: white !important; border: none !important; padding: 8px 16px !important; border-radius: 8px !important; font-weight: bold !important; cursor: pointer !important; }
      `}} />
    </div>
  );
}
