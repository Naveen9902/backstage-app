const fs = require('fs');
let content = fs.readFileSync('src/app/worker/profile/page.tsx', 'utf8');

// 1. Remove the top Save Profile button
// It's located after: </div>\n              </div>\n              <button
const topButtonRegex = /<button[\s\S]*?onClick=\{handleSubmit\}[\s\S]*?<\/button>\s*<\/div>/;
content = content.replace(topButtonRegex, '</div>');

// 2. Remove the existing "Apply for Verification" buttons from the middle of the form
// The div containing verification statuses in the form:
// <div className="flex flex-wrap gap-4"> ... </div>
const oldVerifRegex = /<div className="flex flex-wrap gap-4">[\s\S]*?<\/div>\s*<div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">/;
content = content.replace(oldVerifRegex, '<div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">');

// 3. Remove the "Role Applied For" section
const roleRegex = /<div className="md:col-span-2">\s*<label className="text-sm font-bold text-gray-700 mb-2 block">Role Applied For<\/label>[\s\S]*?Confirm \{formData\.tier\} Update Request\s*<\/button>\s*\)}.*?<\/div>/;
content = content.replace(roleRegex, '');

// 4. Remove the TIER 1 VERIFICATION block completely from the form
const tier1Regex = /\{\/\* TIER 1 VERIFICATION \*\/\}\s*\{requiresTier1 && \([\s\S]*?\}\s*<\/div>\s*\)\}/;
content = content.replace(tier1Regex, '');

// 5. Add the "Save Profile" button at the bottom of the profile form
const oldBottomSaveRegex = /<div className="pt-8 border-t border-gray-100 flex justify-end">[\s\S]*?<\/form>\s*<\/div>\s*<\/div>/;
content = content.replace(oldBottomSaveRegex, `
            <div className="pt-8 border-t border-gray-100 flex justify-end">
              <button type="submit" disabled={saving || loading || isUnderage} className="bg-gradient-to-r from-[#242424] to-[#1a1a1a] hover:from-[#CD7F32] hover:to-[#a86524] text-white px-8 py-3 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:transform-none flex items-center gap-2">
                {saving ? (
                  <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Saving...</>
                ) : isUnderage ? 'Cannot Save (Under 18)' : 'Save Profile'}
              </button>
            </div>
              </form>
            </div>
          </div>

          {/* NEW TIER & VERIFICATION BOX */}
          <div className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#EAE6DF] mt-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-gray-900 mb-2">Tier & Verification</h2>
                <p className="text-gray-500 font-medium">Verify your identity and unlock higher tiers to access better paying roles.</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                {formData.isVerified ? (
                  <div className="flex flex-col items-end gap-1">
                    <span className="px-4 py-2 rounded-xl text-sm font-black uppercase tracking-widest bg-green-100 text-green-700 flex items-center gap-1.5 border border-green-200">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      {formData.tier} Verified
                    </span>
                    {formData.verificationStatus === 'PENDING' && formData.requestedTier && formData.requestedTier !== formData.tier && (
                      <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded">Upgrade to {formData.requestedTier} Pending</span>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-end gap-1">
                    <span className="px-4 py-2 rounded-xl text-sm font-black uppercase tracking-widest bg-gray-100 text-gray-600 flex items-center gap-1.5 border border-gray-200">
                      Not Verified
                    </span>
                    {formData.verificationStatus === 'PENDING' && (
                      <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded">Verification Pending</span>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-8 border-t border-gray-100 pt-8 flex justify-end">
              <button 
                type="button"
                onClick={() => setShowUpgradeModal(true)}
                className="bg-[#CD7F32] hover:bg-[#a86524] text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-md hover:shadow-lg flex items-center gap-2"
              >
                {!formData.isVerified ? 'Apply for Verification' : 'Upgrade Tier'}
              </button>
            </div>
          </div>
`);

// 6. Append the Modal logic before the final closing </div>
const modalContent = `
      {/* UPGRADE TIER MODAL */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto border border-gray-100">
            <button 
              onClick={() => setShowUpgradeModal(false)}
              className="absolute top-6 right-6 p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
            
            <h2 className="text-2xl font-black font-serif text-[#CD7F32] mb-6">Tier Verification Request</h2>
            
            <div className="space-y-6">
              {/* Role Selection */}
              <div>
                <label className="text-sm font-bold text-gray-700 mb-2 block">Select Target Tier</label>
                <select 
                  value={formData.tier} 
                  onChange={e => setFormData({...formData, tier: e.target.value, categories: []})} 
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:border-[#CD7F32] outline-none font-medium"
                >
                  <option value="">-- Choose Tier --</option>
                  {Object.keys(TIER_CATEGORIES).map(tier => (
                    <option key={tier} value={tier}>{tier}</option>
                  ))}
                </select>
              </div>

              {formData.tier && (
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-2 block">Specific Role(s)</label>
                  {formData.tier === 'Tier 1' ? (
                    <div className="flex flex-col gap-2 max-h-40 overflow-y-auto bg-gray-50 border border-gray-200 rounded-lg p-3">
                      {TIER_CATEGORIES['Tier 1'].map((cat) => (
                        <label key={cat} className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={formData.categories.includes(cat)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({...formData, categories: [...formData.categories, cat]});
                              } else {
                                setFormData({...formData, categories: formData.categories.filter(c => c !== cat)});
                              }
                            }}
                            className="text-[#CD7F32] focus:ring-[#CD7F32]"
                          />
                          <span className="text-sm text-gray-700 font-medium">{cat}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <select 
                      value={formData.categories[0] || ''} 
                      onChange={handleRoleChange}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:border-[#CD7F32] outline-none font-medium"
                    >
                      <option value="">-- Choose Role --</option>
                      {TIER_CATEGORIES[formData.tier].map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              {/* Requirements Box */}
              {formData.tier === 'Tier 1' && (
                <div className="bg-[#fdfbf7] p-6 rounded-xl border border-[#e6decb] space-y-4">
                  <h3 className="font-bold text-lg border-b border-[#e6decb] pb-2 text-[#8b6125]">Tier 1 Requirements</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-bold text-gray-700">Date of Birth</label>
                      <input type="date" value={formData.dateOfBirth} onChange={e=>setFormData({...formData, dateOfBirth: e.target.value})} className={\`w-full bg-white border \${isUnderage ? 'border-red-500' : 'border-gray-200'} rounded-lg px-4 py-2 mt-1 focus:border-[#CD7F32] outline-none\`} />
                      {isUnderage && <p className="text-red-500 text-xs mt-1 font-bold">You must be 18+ to work on Back Stage.</p>}
                    </div>
                    <div>
                      <label className="text-sm font-bold text-gray-700">Emergency Contact</label>
                      <input type="text" placeholder="Name & Phone" value={formData.emergencyContact} onChange={e=>setFormData({...formData, emergencyContact: e.target.value})} className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 mt-1 focus:border-[#CD7F32] outline-none" />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="text-sm font-bold text-gray-700">Phone Verification (Required)</label>
                      <div className="flex flex-col sm:flex-row gap-2 mt-1">
                        <input type="text" disabled value={formData.mobile} placeholder="Enter your mobile number above first" className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 outline-none text-gray-500" />
                        {formData.isPhoneVerified ? (
                          <span className="px-6 py-2 rounded-lg font-bold text-sm bg-green-100 text-green-700 border border-green-200 flex items-center justify-center">Verified ✓</span>
                        ) : (
                          <button type="button" disabled={verifyingOtp || otpSent} onClick={handleSendOtp} className="px-6 py-2 rounded-lg font-bold text-sm whitespace-nowrap bg-[#242424] text-white hover:bg-black transition-colors disabled:opacity-50">
                            {verifyingOtp ? 'Sending...' : (otpSent ? 'OTP Sent' : 'Send OTP')}
                          </button>
                        )}
                      </div>
                      
                      {otpSent && !formData.isPhoneVerified && (
                        <div className="flex flex-col sm:flex-row gap-2 mt-2 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                          <input type="text" value={otpCode} onChange={(e) => setOtpCode(e.target.value)} placeholder="Enter 6-digit OTP" className="flex-1 bg-white border border-gray-200 rounded-lg px-4 py-2 outline-none focus:border-[#CD7F32]" />
                          <button type="button" disabled={verifyingOtp} onClick={handleVerifyOtp} className="px-6 py-2 rounded-lg font-bold text-sm whitespace-nowrap bg-[#CD7F32] text-white hover:bg-[#a86524] transition-colors disabled:opacity-50">
                            {verifyingOtp ? 'Verifying...' : 'Verify Code'}
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <label className="text-sm font-bold text-gray-700 block mb-1">Government ID (Any)</label>
                      <div className={\`relative border-2 border-dashed border-gray-300 rounded-lg p-4 text-center bg-white hover:bg-gray-50 transition-colors \${uploading['govtIdUrl'] ? 'opacity-50' : 'cursor-pointer'}\`}>
                        {uploading['govtIdUrl'] ? <span className="text-blue-500 font-bold text-sm">Uploading...</span> : (formData.govtIdUrl ? <span className="text-green-600 font-bold text-sm">ID Uploaded ✓</span> : <span className="text-gray-500 text-sm">Click to upload ID</span>)}
                        <input type="file" disabled={uploading['govtIdUrl']} onChange={(e) => handleFileUpload(e, 'govtIdUrl')} className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed" accept="image/*,.pdf" />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-bold text-gray-700 block mb-1">Live Selfie (Cam)</label>
                      <div className={\`relative border-2 border-dashed border-gray-300 rounded-lg p-4 text-center bg-white hover:bg-gray-50 transition-colors \${uploading['liveSelfieUrl'] ? 'opacity-50' : 'cursor-pointer'}\`}>
                        {uploading['liveSelfieUrl'] ? <span className="text-blue-500 font-bold text-sm">Uploading...</span> : (formData.liveSelfieUrl ? <span className="text-green-600 font-bold text-sm">Selfie Captured ✓</span> : <span className="text-gray-500 text-sm">Click to take selfie</span>)}
                        <input type="file" capture="user" disabled={uploading['liveSelfieUrl']} onChange={(e) => handleFileUpload(e, 'liveSelfieUrl')} className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed" accept="image/*" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="md:col-span-2 mt-4 space-y-3 bg-white p-4 rounded-lg border border-gray-200">
                    <h4 className="font-bold text-sm text-gray-800 mb-2">Required Agreements</h4>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input type="checkbox" checked={agreements.infoAccurate} onChange={e=>setAgreements({...agreements, infoAccurate: e.target.checked})} className="mt-1 w-4 h-4 text-[#CD7F32] focus:ring-[#CD7F32]" />
                      <span className="text-sm text-gray-700">I confirm that all information provided is accurate and true.</span>
                    </label>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input type="checkbox" checked={agreements.guidelines} onChange={e=>setAgreements({...agreements, guidelines: e.target.checked})} className="mt-1 w-4 h-4 text-[#CD7F32] focus:ring-[#CD7F32]" />
                      <span className="text-sm text-gray-700">I have read and agree to the Back Stage Worker Guidelines.</span>
                    </label>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input type="checkbox" checked={agreements.bgCheck} onChange={e=>setAgreements({...agreements, bgCheck: e.target.checked})} className="mt-1 w-4 h-4 text-[#CD7F32] focus:ring-[#CD7F32]" />
                      <span className="text-sm text-gray-700">I consent to a basic background check for identity verification.</span>
                    </label>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-4 border-t border-gray-100">
                <button 
                  onClick={handleApplyForVerification}
                  disabled={verifyingTier || isUnderage || (formData.tier === 'Tier 1' && !isTier1Complete) || formData.categories.length === 0}
                  className="bg-[#CD7F32] hover:bg-[#a86524] text-white px-8 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center gap-2"
                >
                  {verifyingTier ? 'Submitting...' : 'Submit for Verification'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
`;

content = content.replace(/(?=<div className="lg:col-span-3 mt-8 mb-12)/, modalContent);

fs.writeFileSync('src/app/worker/profile/page.tsx', content);
