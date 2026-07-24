'use client';

import { useEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
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
      { 
        fps: 10, 
        qrbox: { width: 250, height: 250 }, 
        aspectRatio: 1.0,
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA]
      },
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
    <div className="fixed inset-0 bg-black overflow-hidden flex flex-col">
      {/* Camera Feed */}
      <div id="qr-reader" className="absolute inset-0 w-full h-full object-cover z-0"></div>

      {/* Overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col items-center py-12 px-6">
        
        {/* Header */}
        <div className="w-full flex items-center justify-between pointer-events-auto">
          <button 
            onClick={() => router.push(`/manager/events/${eventId}`)}
            className="w-12 h-12 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-colors hover:bg-black/60"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <div className="bg-black/40 backdrop-blur-md px-5 py-2.5 rounded-full text-white font-bold text-sm tracking-widest uppercase">
            Scanner
          </div>
          <div className="w-12"></div>
        </div>

        {/* Viewfinder */}
        <div className="relative w-64 h-64 mt-[15vh]">
           <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-[#CD7F32] rounded-tl-3xl"></div>
           <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-[#CD7F32] rounded-tr-3xl"></div>
           <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-[#CD7F32] rounded-bl-3xl"></div>
           <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-[#CD7F32] rounded-br-3xl"></div>
           
           {/* Scanning animation line */}
           {status === 'scanning' && (
             <motion.div 
               animate={{ top: ['0%', '100%', '0%'] }} 
               transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
               className="absolute left-0 w-full h-0.5 bg-[#CD7F32] shadow-[0_0_8px_2px_rgba(205,127,50,0.5)]"
             />
           )}
        </div>

        {/* Status Text Area */}
        <div className="bg-black/60 backdrop-blur-lg rounded-3xl p-6 w-full max-w-sm flex flex-col items-center justify-center min-h-[140px] pointer-events-auto border border-white/10 shadow-2xl mt-auto">
          {status === 'scanning' && (
            <p className="text-white/80 font-medium text-center">Center the QR code in the frame to scan automatically.</p>
          )}
          {status === 'processing' && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center">
                <div className="w-8 h-8 border-4 border-[#CD7F32] border-t-transparent rounded-full animate-spin mb-3"></div>
                <p className="text-white font-bold">Verifying Pass...</p>
             </motion.div>
          )}
          {status === 'success' && (
             <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center">
                <div className="w-12 h-12 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                </div>
                <p className="text-green-400 font-bold text-center">{message}</p>
             </motion.div>
          )}
          {status === 'error' && (
             <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center">
                <div className="w-12 h-12 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                </div>
                <p className="text-red-400 font-bold text-center">{message}</p>
             </motion.div>
          )}
        </div>
      </div>

      {/* CSS overrides for the html5-qrcode UI to make it look premium */}
      <style dangerouslySetInnerHTML={{__html: `
        #qr-reader { border: none !important; width: 100% !important; height: 100% !important; background: black; }
        #qr-reader__dashboard_section_csr span { display: none !important; }
        #qr-reader__dashboard_section_swaplink { display: none !important; }
        #qr-reader__dashboard_section_csr button { display: none !important; }
        #qr-reader video { object-fit: cover !important; width: 100% !important; height: 100% !important; }
      `}} />
    </div>
  );
}
