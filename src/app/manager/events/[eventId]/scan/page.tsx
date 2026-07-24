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
  const [checkoutData, setCheckoutData] = useState<{ workerName: string, roleName: string, totalHours: string, totalAmount: string, applicationId: string } | null>(null);
  const [paying, setPaying] = useState(false);
  
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    // Start scanner on mount
    setStatus('scanning');
    
    // Use Html5Qrcode directly to bypass injected UI and auto-start the camera
    import('html5-qrcode').then(({ Html5Qrcode }) => {
      const html5QrCode = new Html5Qrcode("qr-reader");
      scannerRef.current = html5QrCode as any; // Store reference to pause/resume/clear later

      html5QrCode.start(
        { facingMode: "environment" },
        { 
          fps: 10, 
          qrbox: { width: 250, height: 250 }, 
          aspectRatio: 1.0
        },
        onScanSuccess,
        onScanFailure
      ).catch(err => {
        console.error("Error starting camera: ", err);
        setStatus('error');
        setMessage('Camera access denied or unavailable.');
      });
    });

    return () => {
      if (scannerRef.current) {
        (scannerRef.current as any).stop().then(() => {
          (scannerRef.current as any).clear();
        }).catch((err: any) => console.error("Failed to clear html5Qrcode. ", err));
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
        if (data.action === 'CHECK_OUT') {
          setStatus('success');
          setMessage(`${data.workerName} clocked out!`);
          setCheckoutData(data);
          // Do not auto-reset, wait for manager to pay
        } else {
          setStatus('success');
          setMessage(`Successfully checked in ${data.workerName}!`);
          // Auto reset after 3 seconds
          setTimeout(() => {
            resetScanner();
          }, 3000);
        }
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
    setCheckoutData(null);
    if (scannerRef.current) {
      scannerRef.current.resume();
    }
  };

  const markAsPaid = async () => {
    if (!checkoutData) return;
    setPaying(true);
    try {
      const res = await fetch(`/api/manager/applications/${checkoutData.applicationId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'PAID' })
      });
      if (res.ok) {
        setCheckoutData(null);
        setStatus('success');
        setMessage('Payment successful! Worker has been paid.');
        setTimeout(() => resetScanner(), 3000);
      } else {
        alert('Failed to mark as paid.');
      }
    } catch(err) {
      alert('Error connecting to server.');
    } finally {
      setPaying(false);
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

        {/* Checkout Payment Popup Overlay */}
        {checkoutData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm pointer-events-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="bg-[#CD7F32] p-6 text-center">
                <h3 className="text-2xl font-serif font-bold text-white mb-1">Clock Out</h3>
                <p className="text-white/80 font-medium">{checkoutData.workerName}</p>
              </div>
              <div className="p-6 flex flex-col gap-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-500 font-semibold">Role</span>
                  <span className="font-bold text-gray-900">{checkoutData.roleName}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-500 font-semibold">Time Worked</span>
                  <span className="font-bold text-[#CD7F32] text-xl">{checkoutData.totalHours} hrs</span>
                </div>
                <div className="flex justify-between items-center py-3 bg-gray-50 rounded-xl px-4 mt-2">
                  <span className="text-gray-600 font-bold">Total Due</span>
                  <span className="font-bold text-2xl text-green-600">₹{checkoutData.totalAmount}</span>
                </div>
                
                <button 
                  onClick={markAsPaid}
                  disabled={paying}
                  className="mt-4 w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-xl shadow-lg transition-transform active:scale-95 disabled:opacity-50"
                >
                  {paying ? 'Processing...' : 'Mark as Paid'}
                </button>
                <button 
                  onClick={resetScanner}
                  disabled={paying}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
                >
                  Dismiss (Pay Later)
                </button>
              </div>
            </motion.div>
          </div>
        )}
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
