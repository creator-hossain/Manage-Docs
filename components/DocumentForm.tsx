import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, X, Car, CreditCard, User, Upload, Type, MoveHorizontal, Maximize2, Landmark, FileText, Truck, Receipt, FileCheck, Layers, Gauge, Image as ImageIcon, Database, Edit3, Calendar, AlignLeft, AlignCenter, AlignRight, AlignJustify } from 'lucide-react';
import { BusinessDocument, DocumentType, PaymentEntry, Asset, AssetType } from '../types';
import { DOC_TYPES_CONFIG } from '../constants';
import AssetLibrary from './AssetLibrary';
import { getTypePreferences, saveTypePreferences } from '../utils/storage';

interface DocumentFormProps {
  initialData: Partial<BusinessDocument>;
  onSave: (doc: BusinessDocument) => void;
  onCancel: () => void;
  onChange?: (doc: Partial<BusinessDocument>) => void;
}

const DocumentForm: React.FC<DocumentFormProps> = ({ initialData, onSave, onCancel, onChange }) => {
  const [showAssetPicker, setShowAssetPicker] = useState<{ open: boolean; target: 'logoUrl' | 'productImageUrl'; type: AssetType } | null>(null);
  const [formData, setFormData] = useState<Partial<BusinessDocument>>(() => {
    const type = initialData.type || DocumentType.INVOICE;
    const typePrefs = getTypePreferences(type);
    
    return {
      id: Math.random().toString(36).substr(2, 9),
      type: type,
      docNumber: initialData.docNumber || `${DOC_TYPES_CONFIG[type].prefix}-${Date.now().toString().slice(-6)}`,
      date: initialData.date || new Date().toISOString().split('T')[0],
      clientName: '',
      clientAddress: '',
      clientPhone: '',
      vehicleTitle: '',
      vehicleTitleSize: type === DocumentType.BILL ? 20 : 18,
      vehicleTitleAlign: 'left',
      logoUrl: typePrefs?.logoUrl || '',
      logoSize: typePrefs?.logoSize || 220,
      logoPosition: typePrefs?.logoPosition || 0,
      brand: '',
      model: '',
      yearModel: '',
      color: '',
      chassisNumber: '',
      engineNumber: '',
      auctionPoint: '',
      cc: '',
      fuel: '',
      transmission: '',
      vehiclePrice: 0,
      priceInWords: '',
      payments: [],
      quantity: 1,
      advancedPaidAmount: 0,
      bankPaymentAmount: 0,
      bankName: '',
      createdAt: Date.now(),
      hiddenFields: [],
      ...initialData
    };
  });

  useEffect(() => {
    if (onChange) {
      onChange(formData);
    }
  }, [formData, onChange]);

  const toggleField = (field: string) => {
    const hidden = formData.hiddenFields || [];
    if (hidden.includes(field)) {
      setFormData({ ...formData, hiddenFields: hidden.filter(f => f !== field) });
    } else {
      setFormData({ ...formData, hiddenFields: [...hidden, field] });
    }
  };

  const isFieldVisible = (field: string) => !(formData.hiddenFields || []).includes(field);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, logoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAssetSelect = (asset: Asset) => {
    if (showAssetPicker) {
      setFormData({ ...formData, [showAssetPicker.target]: asset.dataUrl });
      setShowAssetPicker(null);
    }
  };

  const addPayment = () => {
    const newPayment: PaymentEntry = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString().split('T')[0],
      amount: 0,
      note: 'CASH'
    };
    setFormData({ ...formData, payments: [...(formData.payments || []), newPayment] });
  };

  const removePayment = (id: string) => {
    setFormData({ ...formData, payments: (formData.payments || []).filter(p => p.id !== id) });
  };

  const updatePayment = (id: string, field: keyof PaymentEntry, value: any) => {
    const newPayments = (formData.payments || []).map(p => 
      p.id === id ? { ...p, [field]: value } : p
    );
    setFormData({ ...formData, payments: newPayments });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientName && formData.type !== DocumentType.BILL && formData.type !== DocumentType.QUOTATION) {
      alert("Please enter the buyer's name.");
      return;
    }
    
    if (formData.type) {
      saveTypePreferences(formData.type, {
        logoUrl: formData.logoUrl,
        logoSize: formData.logoSize,
        logoPosition: formData.logoPosition
      });
    }

    onSave(formData as BusinessDocument);
  };

  const inputClass = "w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm font-medium outline-none focus:border-red-700/50 focus:bg-white/[0.08] text-white placeholder:text-white/20 transition-all focus:ring-4 focus:ring-red-700/10";
  const labelClass = "block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2 ml-1";

  const ToggleSwitch = ({ checked, onChange }: { checked: boolean, onChange: () => void }) => (
    <div 
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${checked ? 'bg-red-700 shadow-[0_0_15px_rgba(185,28,28,0.3)]' : 'bg-white/10'}`}
    >
      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xl transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </div>
  );

  const SectionHeader = ({ icon: Icon, title, subtitle }: { icon: any, title: string, subtitle?: string }) => (
    <div className="flex items-center gap-4 mb-8">
      <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-red-700 shadow-inner group-hover:scale-110 transition-transform">
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <h3 className="text-sm font-black text-white uppercase tracking-widest">{title}</h3>
        {subtitle && <p className="text-[10px] font-bold text-gray-600 uppercase tracking-tighter mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );

  const LogoSection = () => (
    <div className="bg-white/[0.03] p-8 rounded-[2.5rem] border border-white/5 backdrop-blur-3xl space-y-6 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-red-700/5 rounded-full blur-3xl group-hover:bg-red-700/10 transition-all"></div>
      <SectionHeader icon={Layers} title="Brand Customization" subtitle="Visual Identity Assets" />
      
      <div className="flex items-center gap-8 p-6 bg-black/40 rounded-3xl border border-white/5">
        <div className="w-24 h-24 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center overflow-hidden shrink-0 shadow-2xl">
           {formData.logoUrl ? (
             <img src={formData.logoUrl} alt="Preview" className="w-full h-full object-contain p-2" />
           ) : (
             <ImageIcon className="w-8 h-8 text-white/10" />
           )}
        </div>
        <div className="space-y-3 flex flex-col gap-3">
          <label className="bg-red-700 text-white px-6 py-3 rounded-xl cursor-pointer hover:bg-red-800 transition-all inline-block text-[11px] font-black uppercase tracking-widest active:scale-95 shadow-xl shadow-red-700/20 border border-red-600/50 text-center">
            Upload Brand Logo
            <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
          </label>
          <button 
            type="button" 
            onClick={() => setShowAssetPicker({ open: true, target: 'logoUrl', type: AssetType.LOGO })}
            className="flex items-center justify-center gap-3 px-6 py-3 bg-white/5 border border-white/10 text-gray-400 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all active:scale-95"
          >
            <Database className="w-4 h-4" /> Choose from Library
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
        <div className="space-y-4 bg-black/20 p-5 rounded-2xl border border-white/5">
          <div className="flex justify-between items-center">
            <span className={labelClass}>Scale Magnitude</span>
            <span className="text-[10px] font-black text-red-700 bg-red-700/10 px-2 py-0.5 rounded-md">{formData.logoSize}px</span>
          </div>
          <div className="flex items-center gap-4">
            <Maximize2 className="w-4 h-4 text-gray-600" />
            <input type="range" min="50" max="500" value={formData.logoSize} onChange={(e) => setFormData({...formData, logoSize: parseInt(e.target.value)})} className="flex-1 accent-red-700 h-1.5 bg-white/5 rounded-lg cursor-pointer appearance-none" style={{ background: `linear-gradient(to right, #b91c1c ${(formData.logoSize!-50)/450 * 100}%, #1f2937 0%)` }} />
          </div>
        </div>
        <div className="space-y-4 bg-black/20 p-5 rounded-2xl border border-white/5">
          <div className="flex justify-between items-center">
            <span className={labelClass}>Horizontal Offset</span>
            <span className="text-[10px] font-black text-red-700 bg-red-700/10 px-2 py-0.5 rounded-md">{formData.logoPosition}px</span>
          </div>
          <div className="flex items-center gap-4">
            <MoveHorizontal className="w-4 h-4 text-gray-600" />
            <input type="range" min="0" max="500" value={formData.logoPosition} onChange={(e) => setFormData({...formData, logoPosition: parseInt(e.target.value)})} className="flex-1 accent-red-700 h-1.5 bg-white/5 rounded-lg cursor-pointer appearance-none" style={{ background: `linear-gradient(to right, #b91c1c ${(formData.logoPosition!)/500 * 100}%, #1f2937 0%)` }} />
          </div>
        </div>
      </div>
    </div>
  );

  const currentTypeConfig = DOC_TYPES_CONFIG[formData.type || DocumentType.INVOICE];

  return (
    <div className="bg-[#0a0a0b] h-full flex flex-col overflow-hidden font-sans border-r border-white/5">
      {showAssetPicker && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-20 animate-in zoom-in duration-300">
          <div className="w-full max-w-6xl h-full shadow-2xl relative">
            <AssetLibrary 
              selectionMode 
              onSelect={handleAssetSelect} 
              onClose={() => setShowAssetPicker(null)} 
              filterType={showAssetPicker.type}
            />
          </div>
        </div>
      )}

      <div className="bg-gradient-to-r from-red-950/20 to-black px-10 py-8 flex justify-between items-center text-white shrink-0 border-b border-white/5">
        <div className="flex items-center gap-6">
          <div className="w-14 h-14 bg-red-700 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(185,28,28,0.4)] ring-4 ring-red-700/10 transition-all group-hover:rotate-12">
            {currentTypeConfig.icon}
          </div>
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tighter leading-none mb-1.5">
              {initialData.id ? 'Modify' : 'Drafting'} <span className="text-red-700">{currentTypeConfig.label}</span>
            </h2>
            <div className="flex items-center gap-3">
              <span className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em]">Session ID: {formData.id?.slice(0,8)}</span>
              <div className="w-1 i-1 rounded-full bg-red-700 animate-pulse"></div>
              <span className="text-[9px] font-black text-red-700 uppercase tracking-[0.3em]">Live Cloud Buffer</span>
            </div>
          </div>
        </div>
        <button onClick={onCancel} className="w-12 h-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center hover:bg-red-700 hover:text-white hover:border-transparent transition-all active:scale-90 group">
          <X className="w-6 h-6 text-gray-400 group-hover:text-white" />
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="p-10 space-y-10 overflow-y-auto flex-1 scrollbar-hide bg-[radial-gradient(circle_at_top_left,rgba(185,28,28,0.03),transparent_40%)]">
        {LogoSection()}

        {/* Dynamic Form Sections Based on Type */}
        {formData.type === DocumentType.CHALLAN && (
          <>
            <div className="bg-white/[0.03] p-8 rounded-[2.5rem] border border-white/5 backdrop-blur-xl">
              <SectionHeader icon={User} title="Recipient Logistics" subtitle="Delivery Destination Details" />
              <div className="space-y-6">
                <div>
                  <label className={labelClass}>Recipient Full Name</label>
                  <input type="text" placeholder="Authorized Recipient" value={formData.clientName} onChange={(e) => setFormData({...formData, clientName: e.target.value})} className={inputClass} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}>Contact Mobile</label>
                    <input type="text" placeholder="+880..." value={formData.clientPhone} onChange={(e) => setFormData({...formData, clientPhone: e.target.value})} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Dispatch Date</label>
                    <input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className={inputClass} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Drop-off Location</label>
                  <textarea placeholder="Physical Address" rows={2} value={formData.clientAddress} onChange={(e) => setFormData({...formData, clientAddress: e.target.value})} className={inputClass} />
                </div>
              </div>
            </div>

            <div className="bg-white/[0.03] p-8 rounded-[2.5rem] border border-white/5 backdrop-blur-xl space-y-6">
              <SectionHeader icon={Car} title="Asset Specifications" subtitle="Vehicle Technical Data" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-4 bg-black/40 p-4 rounded-3xl border border-white/5">
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">Text Size</span>
                  <input 
                    type="range" 
                    min="10" 
                    max="40" 
                    value={formData.vehicleTitleSize} 
                    onChange={(e) => setFormData({...formData, vehicleTitleSize: parseInt(e.target.value)})} 
                    className="flex-1 accent-red-700 h-1.5 bg-white/5 rounded-lg cursor-pointer appearance-none" 
                  />
                  <span className="text-[10px] font-black text-red-700 bg-red-700/10 px-2 py-0.5 rounded-md">{formData.vehicleTitleSize}px</span>
                </div>

                <div className="flex items-center gap-2 bg-black/40 p-4 rounded-3xl border border-white/5">
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mr-2">Alignment</span>
                  <div className="flex bg-white/5 rounded-xl p-1 gap-1">
                    {(['left', 'center', 'right', 'justify'] as const).map((align) => (
                      <button
                        key={align}
                        type="button"
                        onClick={() => setFormData({ ...formData, vehicleTitleAlign: align })}
                        className={`p-2 rounded-lg transition-all ${formData.vehicleTitleAlign === align ? 'bg-red-700 text-white' : 'text-gray-500 hover:text-white hover:bg-white/10'}`}
                      >
                        {align === 'left' && <AlignLeft size={16} />}
                        {align === 'center' && <AlignCenter size={16} />}
                        {align === 'right' && <AlignRight size={16} />}
                        {align === 'justify' && <AlignJustify size={16} />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className={labelClass}>Vehicle Description (Paragraph)</label>
                <textarea 
                  placeholder="e.g. TOYOTA HIACE GL BUS..." 
                  value={formData.vehicleTitle} 
                  onChange={(e) => setFormData({...formData, vehicleTitle: e.target.value})} 
                  className={`${inputClass} min-h-[120px] resize-y`}
                  style={{ textAlign: formData.vehicleTitleAlign }}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {['yearModel', 'color', 'chassisNumber', 'engineNumber', 'auctionPoint', 'quantity'].map(field => (
                  <div key={field}>
                    <label className={labelClass}>
                      {field === 'auctionPoint' ? 'AUCTION POINT' : field === 'quantity' ? 'QTY' : field.toUpperCase()}
                    </label>
                    <input 
                      type={field === 'quantity' ? 'number' : 'text'} 
                      placeholder={field === 'auctionPoint' ? 'e.g. 4.5' : `Enter ${field}`} 
                      value={(formData as any)[field] || ''} 
                      onChange={(e) => {
                        const val = field === 'quantity' ? parseInt(e.target.value) || 0 : e.target.value;
                        setFormData({...formData, [field]: val});
                      }} 
                      className={inputClass} 
                    />
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {(formData.type === DocumentType.INVOICE || formData.type === DocumentType.QUOTATION || formData.type === DocumentType.BILL) && (
          <>
            <div className="bg-white/[0.03] p-8 rounded-[2.5rem] border border-white/5 backdrop-blur-xl">
              <SectionHeader icon={User} title="Stakeholder Profile" subtitle="Client Identity Records" />
              <div className="space-y-6">
                {formData.type === DocumentType.INVOICE && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-white/5 mb-6">
                    <div>
                      <label className={labelClass}>DATE</label>
                      <input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Invoice no.</label>
                      <input type="text" placeholder="INV-XXXXXX" value={formData.docNumber} onChange={(e) => setFormData({...formData, docNumber: e.target.value})} className={inputClass} />
                    </div>
                  </div>
                )}

                {formData.type === DocumentType.QUOTATION ? (
                  <div className="space-y-6">
                    <div className="pb-4 border-b border-white/5">
                      <label className={labelClass}>Quotation Date</label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className={`${inputClass} !pl-12`} />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className={labelClass}>Officer Designation</label>
                        <input type="text" placeholder="e.g. The Manager" value={formData.clientDesignation || ''} onChange={(e) => setFormData({...formData, clientDesignation: e.target.value})} className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>Associated Organization</label>
                        <input type="text" placeholder="e.g. City Bank PLC" value={formData.clientOffice || ''} onChange={(e) => setFormData({...formData, clientOffice: e.target.value})} className={inputClass} />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Registered Address</label>
                      <textarea placeholder="Legal Physical Address" rows={2} value={formData.clientAddress} onChange={(e) => setFormData({...formData, clientAddress: e.target.value})} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Account / Bank Reference (A/C)</label>
                      <input type="text" placeholder="e.g. A/C NAME OR REF" value={formData.acName || ''} onChange={(e) => setFormData({...formData, acName: e.target.value})} className={inputClass} />
                    </div>
                  </div>
                ) : formData.type === DocumentType.BILL ? (
                  <div className="space-y-6">
                    <div>
                      <label className={labelClass}>A/C Name or Recipient</label>
                      <input type="text" placeholder="e.g. RAWSHAN JAHAN" value={formData.acName || ''} onChange={(e) => setFormData({...formData, acName: e.target.value})} className={inputClass} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className={labelClass}>Officer Designation</label>
                        <input type="text" placeholder="e.g. Head Office" value={formData.clientDesignation || ''} onChange={(e) => setFormData({...formData, clientDesignation: e.target.value})} className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>Associated Organization</label>
                        <input type="text" placeholder="e.g. City Bank PLC" value={formData.clientOffice || ''} onChange={(e) => setFormData({...formData, clientOffice: e.target.value})} className={inputClass} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={labelClass}>Buyer's Identity</label>
                      <input type="text" placeholder="Full Name" value={formData.clientName} onChange={(e) => setFormData({...formData, clientName: e.target.value})} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Contact Communication</label>
                      <input type="text" placeholder="Mobile / Phone" value={formData.clientPhone || ''} onChange={(e) => setFormData({...formData, clientPhone: e.target.value})} className={inputClass} />
                    </div>
                  </div>
                )}
                
                {formData.type !== DocumentType.QUOTATION && (
                  <div>
                    <label className={labelClass}>Registered Address</label>
                    <textarea placeholder="Legal Physical Address" rows={2} value={formData.clientAddress} onChange={(e) => setFormData({...formData, clientAddress: e.target.value})} className={inputClass} />
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white/[0.03] p-8 rounded-[2.5rem] border border-white/5 backdrop-blur-xl space-y-6">
              <SectionHeader icon={Car} title="Asset Valuation" subtitle="Vehicle Portfolio Details" />
              
              {formData.type === DocumentType.QUOTATION && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center gap-4 bg-black/40 p-4 rounded-3xl border border-white/5">
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">Header Typography</span>
                    <input 
                      type="range" 
                      min="10" 
                      max="40" 
                      value={formData.vehicleTitleSize} 
                      onChange={(e) => setFormData({...formData, vehicleTitleSize: parseInt(e.target.value)})} 
                      className="flex-1 accent-red-700 h-1.5 bg-white/5 rounded-lg cursor-pointer appearance-none" 
                    />
                    <span className="text-[10px] font-black text-red-700 bg-red-700/10 px-2 py-0.5 rounded-md">{formData.vehicleTitleSize}px</span>
                  </div>

                  <div className="flex items-center gap-2 bg-black/40 p-4 rounded-3xl border border-white/5">
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mr-2">Alignment</span>
                    <div className="flex bg-white/5 rounded-xl p-1 gap-1">
                      {(['left', 'center', 'right', 'justify'] as const).map((align) => (
                        <button
                          key={align}
                          type="button"
                          onClick={() => setFormData({ ...formData, vehicleTitleAlign: align })}
                          className={`p-2 rounded-lg transition-all ${formData.vehicleTitleAlign === align ? 'bg-red-700 text-white' : 'text-gray-500 hover:text-white hover:bg-white/10'}`}
                        >
                          {align === 'left' && <AlignLeft size={16} />}
                          {align === 'center' && <AlignCenter size={16} />}
                          {align === 'right' && <AlignRight size={16} />}
                          {align === 'justify' && <AlignJustify size={16} />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <label className={labelClass}>Vehicle Description {formData.type === DocumentType.QUOTATION ? '(Paragraph)' : ''}</label>
                  {formData.type === DocumentType.QUOTATION ? (
                    <textarea 
                      placeholder="Full vehicle title or description paragraph..." 
                      value={formData.vehicleTitle} 
                      onChange={(e) => setFormData({...formData, vehicleTitle: e.target.value})} 
                      className={`${inputClass} min-h-[120px] resize-y`}
                      style={{ textAlign: formData.vehicleTitleAlign }}
                    />
                  ) : (
                    <input type="text" placeholder="Full vehicle title" value={formData.vehicleTitle} onChange={(e) => setFormData({...formData, vehicleTitle: e.target.value})} className={inputClass} />
                  )}
                </div>

                {formData.type !== DocumentType.QUOTATION && (
                  <div className="flex items-center gap-6 px-6 py-4 bg-black/40 rounded-3xl border border-white/5">
                     <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">Header Typography</span>
                     <input type="range" min="10" max="40" value={formData.vehicleTitleSize} onChange={(e) => setFormData({...formData, vehicleTitleSize: parseInt(e.target.value)})} className="flex-1 accent-red-700 h-1.5 bg-white/5 rounded-lg cursor-pointer appearance-none" />
                     <span className="text-[10px] font-black text-red-700 bg-red-700/10 px-2 py-0.5 rounded-md">{formData.vehicleTitleSize}px</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {(formData.type === DocumentType.BILL || formData.type === DocumentType.QUOTATION) ? (
                    <>
                      {(formData.type === DocumentType.QUOTATION 
                        ? ['brand', 'model', 'yearModel', 'color', 'chassisNumber', 'engineNumber', 'cc', 'fuel', 'transmission', 'quantity']
                        : ['yearModel', 'cc', 'engineNumber', 'chassisNumber', 'color']
                      ).map(field => (
                        <div key={field} className="flex items-center gap-4 bg-black/20 p-2 rounded-2xl border border-white/5">
                          <div className="flex-1">
                            <label className={labelClass}>
                              {field === 'cc' ? 'Cubic Capacity (CC)' : field === 'quantity' ? 'QTY' : field.toUpperCase()}
                            </label>
                            <input 
                              type={field === 'quantity' ? 'number' : 'text'} 
                              placeholder={field === 'quantity' ? '01' : `Enter ${field}`} 
                              value={(formData as any)[field] || ''} 
                              onChange={(e) => {
                                const val = field === 'quantity' ? parseInt(e.target.value) || 0 : e.target.value;
                                setFormData({...formData, [field]: val});
                              }} 
                              className={inputClass} 
                            />
                          </div>
                          <div className="pt-6 px-2"><ToggleSwitch checked={isFieldVisible(field)} onChange={() => toggleField(field)} /></div>
                        </div>
                      ))}
                      
                      {formData.type === DocumentType.BILL && (
                        <div className="flex items-center gap-4 bg-red-700/5 p-2 rounded-2xl border border-red-700/20">
                          <div className="flex-1">
                            <label className={labelClass}>Net Valuation (TK)</label>
                            <input 
                              type="number" 
                              placeholder="Total Price" 
                              value={formData.vehiclePrice || ''} 
                              onChange={(e) => {
                                const net = parseFloat(e.target.value) || 0;
                                setFormData({
                                  ...formData, 
                                  vehiclePrice: net
                                });
                              }} 
                              className={`${inputClass} font-black text-red-700 !bg-red-700/10 border-red-700/30`} 
                            />
                          </div>
                          <div className="pt-6 px-2"><ToggleSwitch checked={isFieldVisible('vehiclePrice')} onChange={() => toggleField('vehiclePrice')} /></div>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      {['model', 'color', 'cc', 'chassisNumber', 'engineNumber'].map(field => (
                        <div key={field} className="flex items-center gap-4 bg-black/20 p-2 rounded-2xl border border-white/5">
                          <div className="flex-1">
                            <label className={labelClass}>{field.toUpperCase()}</label>
                            <input type="text" placeholder={`Enter ${field}`} value={(formData as any)[field] || ''} onChange={(e) => setFormData({...formData, [field]: e.target.value})} className={inputClass} />
                          </div>
                          <div className="pt-6 px-2"><ToggleSwitch checked={isFieldVisible(field)} onChange={() => toggleField(field)} /></div>
                        </div>
                      ))}
                      {formData.type === DocumentType.INVOICE && (
                        <div className="flex items-center gap-4 bg-red-700/5 p-2 rounded-2xl border border-red-700/20">
                          <div className="flex-1">
                            <label className={labelClass}>NET VEHICLE PRICE (TK)</label>
                            <input 
                              type="number" 
                              placeholder="Enter Car Price" 
                              value={formData.vehiclePrice || ''} 
                              onChange={(e) => setFormData({...formData, vehiclePrice: parseFloat(e.target.value) || 0})} 
                              className={`${inputClass} font-black text-red-700 !bg-red-700/10 border-red-700/30`} 
                            />
                          </div>
                          <div className="pt-6 px-2"><ToggleSwitch checked={isFieldVisible('vehiclePrice')} onChange={() => toggleField('vehiclePrice')} /></div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white/[0.03] p-8 rounded-[2.5rem] border border-white/5 backdrop-blur-xl">
              <SectionHeader icon={CreditCard} title="Fiscal Transaction" subtitle="Payment & Settlement Records" />
              <div className="space-y-6">
                {formData.type === DocumentType.INVOICE ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Transaction History</h4>
                      <button type="button" onClick={addPayment} className="px-5 py-2.5 bg-red-700 text-white rounded-xl font-black text-[10px] uppercase hover:bg-red-800 transition-all shadow-xl shadow-red-700/20 active:scale-95 flex items-center gap-2">
                        <Plus className="w-3.5 h-3.5" /> Append Record
                      </button>
                    </div>
                    <div className="space-y-4">
                      {(formData.payments || []).map((pay) => (
                        <div key={pay.id} className="flex gap-4 items-center p-5 bg-black/30 rounded-3xl border border-white/5 animate-in slide-in-from-right-4">
                          <div className="w-[160px]">
                            <label className={labelClass}>Execution Date</label>
                            <input type="date" value={pay.date} onChange={(e) => updatePayment(pay.id, 'date', e.target.value)} className={`${inputClass} !py-3`} />
                          </div>
                          <div className="w-[140px]">
                            <label className={labelClass}>Amount (TK)</label>
                            <input type="number" placeholder="0" value={pay.amount || ''} onChange={(e) => updatePayment(pay.id, 'amount', parseFloat(e.target.value) || 0)} className={`${inputClass} !py-3 font-black text-red-700`} />
                          </div>
                          <div className="flex-1">
                            <label className={labelClass}>Payment Instrument / Note</label>
                            <input type="text" placeholder="CASH / BKASH / CHECK" value={pay.note} onChange={(e) => updatePayment(pay.id, 'note', e.target.value)} className={`${inputClass} !py-3 uppercase`} />
                          </div>
                          <button type="button" onClick={() => removePayment(pay.id)} className="w-12 h-12 bg-white/5 text-gray-500 rounded-2xl hover:text-white hover:bg-red-700 transition-all mt-6 border border-white/5 active:scale-90 flex items-center justify-center">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : formData.type === DocumentType.BILL ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-6">
                       <div className="bg-black/20 p-5 rounded-2xl border border-white/5">
                         <label className={labelClass}>Advance Paid By Customer (TK)</label>
                         <input 
                           type="number" 
                           value={formData.advancedPaidAmount} 
                           onChange={(e) => {
                             const adv = parseFloat(e.target.value) || 0;
                             const net = formData.vehiclePrice || 0;
                             setFormData({
                               ...formData, 
                               advancedPaidAmount: adv,
                               bankPaymentAmount: Math.max(0, net - adv)
                             });
                           }} 
                           className={`${inputClass} ${(formData.advancedPaidAmount || 0) > (formData.vehiclePrice || 0) ? 'border-red-500 focus:border-red-500' : ''}`} 
                         />
                       </div>
                       <div className="bg-black/20 p-5 rounded-2xl border border-white/5">
                         <label className={labelClass}>Paid by Bank (Amount)</label>
                         <input type="number" value={formData.bankPaymentAmount} onChange={(e) => setFormData({...formData, bankPaymentAmount: parseFloat(e.target.value) || 0})} className={inputClass} />
                       </div>
                     </div>
                     <div className="space-y-6">
                       <div className="bg-black/20 p-5 rounded-2xl border border-white/5">
                         <label className={labelClass}>Bank Name</label>
                         <input type="text" placeholder="e.g. City Bank PLC" value={formData.bankName} onChange={(e) => setFormData({...formData, bankName: e.target.value})} className={inputClass} />
                       </div>
                       <div className="bg-black/20 p-5 rounded-2xl border border-white/5">
                         <label className={labelClass}>Unit</label>
                         <input type="number" placeholder="01" value={formData.quantity || ''} onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 0})} className={inputClass} />
                       </div>
                     </div>
                  </div>
                ) : (
                  <div className="bg-red-700/5 p-6 rounded-3xl border border-red-700/20">
                    <label className={labelClass}>Net Proposed Valuation (TK)</label>
                    <input type="number" placeholder="Offer Price" value={formData.vehiclePrice || ''} onChange={(e) => setFormData({...formData, vehiclePrice: parseFloat(e.target.value) || 0})} className={`${inputClass} font-black text-red-700 !bg-red-700/10 border-red-700/30`} />
                  </div>
                )}
                
                {(formData.type === DocumentType.BILL || formData.type === DocumentType.QUOTATION) && (
                  <div className="pt-4">
                    <label className={labelClass}>Valuation in Verbal Format</label>
                    <input type="text" placeholder="e.g. Thirty Eight Lac Taka Only" value={formData.priceInWords || ''} onChange={(e) => setFormData({...formData, priceInWords: e.target.value})} className={inputClass} />
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {formData.type !== DocumentType.INVOICE && formData.type !== DocumentType.BILL && formData.type !== DocumentType.CHALLAN && (
          <div className="bg-white/[0.03] p-8 rounded-[2.5rem] border border-white/5 backdrop-blur-xl">
            <SectionHeader icon={Plus} title="Miscellaneous Notes" subtitle="Optional Disclaimers & Terms" />
            <textarea placeholder="Append additional instructions, accessories list, or legal disclaimers..." rows={4} value={formData.notes || ''} onChange={(e) => setFormData({...formData, notes: e.target.value})} className={inputClass} />
          </div>
        )}
      </form>

      <div className="p-10 border-t border-white/5 bg-[#0a0a0b] shrink-0 flex gap-6 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
        <button 
          type="button" 
          onClick={handleSubmit} 
          className="flex-1 bg-red-700 text-white font-black py-5 rounded-[2rem] hover:bg-red-800 transition-all flex items-center justify-center gap-4 active:scale-[0.98] shadow-2xl shadow-red-700/40 uppercase tracking-widest text-xs border border-red-600/50"
        >
          <Save className="w-6 h-6" /> Commit Record to Storage
        </button>
        <button 
          type="button" 
          onClick={onCancel} 
          className="px-10 bg-white/5 text-gray-400 font-black py-5 rounded-[2rem] border border-white/10 hover:bg-white/10 hover:text-white active:scale-95 transition-all uppercase tracking-widest text-xs"
        >
          Discard
        </button>
      </div>
    </div>
  );
};

export default DocumentForm;