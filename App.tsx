import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Plus, 
  Download, 
  Trash2, 
  Edit, 
  Eye, 
  Settings,
  X,
  LayoutDashboard,
  ChevronRight,
  ArrowRight,
  Database,
  CircleDollarSign,
  Activity,
  Cpu,
  Globe,
  Zap,
  Layers,
  ShoppingBag,
  CheckCircle2
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { BusinessDocument, DocumentType } from './types';
import { DOC_TYPES_CONFIG } from './constants';
import { addOrUpdateDocument, loadDocuments, deleteDocument } from './utils/storage';
import DocumentForm from './components/DocumentForm';
import DocumentPreview from './components/DocumentPreview';
import ProInvoiceGenerator from './components/ProInvoiceGenerator';
import AssetLibrary from './components/AssetLibrary';

const BANNERS = [
  "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=2000",
  "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=2000",
  "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80&w=2000"
];

const RUNNING_TEXTS = [
  "Welcome to Garir Dokan Pro - Your Ultimate Automotive Solution",
  "Generate Professional Invoices, Quotations & Delivery Challans Instantly",
  "Managing your Automotive Business has never been this easy and stylish",
  "Premium Export Quality PDF Documents with One Click Download"
];

const STATS_BG = "https://images.unsplash.com/photo-1486006920555-c77dcf18193c?auto=format&fit=crop&q=80&w=2500";

const App: React.FC = () => {
  const [currentBanner, setCurrentBanner] = useState(0);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [documents, setDocuments] = useState<BusinessDocument[]>([]);
  const [editingDoc, setEditingDoc] = useState<Partial<BusinessDocument> | null>(null);
  const [previewingDoc, setPreviewingDoc] = useState<BusinessDocument | null>(null);
  const [draftDoc, setDraftDoc] = useState<Partial<BusinessDocument> | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'landing' | 'list' | 'assets'>('landing');
  const [activeType, setActiveType] = useState<DocumentType | null>(null);
  const [showProGenerator, setShowProGenerator] = useState(false);
  const [showSaveToast, setShowSaveToast] = useState(false);

  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDocuments(loadDocuments());
    
    const bannerInterval = setInterval(() => {
      setCurrentBanner(prev => (prev + 1) % BANNERS.length);
    }, 5000);

    const textInterval = setInterval(() => {
      setCurrentTextIndex(prev => (prev + 1) % RUNNING_TEXTS.length);
    }, 3000);

    return () => {
      clearInterval(bannerInterval);
      clearInterval(textInterval);
    };
  }, []);

  const handleSave = (doc: BusinessDocument) => {
    const updated = addOrUpdateDocument(doc);
    // Only update and close if the count changed or the document actually saved
    if (updated !== documents) {
      setDocuments(updated);
      setEditingDoc(null);
      setDraftDoc(null);
      setShowProGenerator(false);
      setShowSaveToast(true);
      setTimeout(() => setShowSaveToast(false), 3000);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this document?')) {
      const updated = deleteDocument(id);
      setDocuments(updated);
    }
  };

  const handleDownloadPDF = async (docToDownload?: BusinessDocument) => {
    const targetDoc = docToDownload || previewingDoc;
    if (!previewRef.current || !targetDoc) return;

    const element = previewRef.current;
    const canvas = await html2canvas(element, { scale: 3, useCORS: true });
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF('p', 'mm', 'a4');
    pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
    pdf.save(`${targetDoc.docNumber}_${targetDoc.clientName}.pdf`);
  };

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.clientName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          doc.docNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = activeType ? doc.type === activeType : true;
    return matchesSearch && matchesType;
  }).sort((a, b) => b.createdAt - a.createdAt);

  const totalRecords = documents.length;
  const totalAssetValue = documents.reduce((sum, doc) => sum + (doc.vehiclePrice || 0), 0);
  
  const getCountByType = (type: DocumentType) => documents.filter(doc => doc.type === type).length;

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white font-sans selection:bg-red-700 selection:text-white">
      {/* Save Success Toast */}
      {showSaveToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-green-600 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-3 shadow-2xl shadow-green-900/40 animate-in slide-in-from-top-10">
          <CheckCircle2 className="w-6 h-6" />
          <span className="uppercase tracking-widest text-xs">Document Secured Successfully</span>
        </div>
      )}

      <nav className="fixed top-0 left-0 right-0 z-50 px-10 py-6 flex justify-between items-center backdrop-blur-md bg-black/20 border-b border-white/5">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => {setViewMode('landing'); setActiveType(null);}}>
          <div className="w-10 h-10 bg-red-700 rounded-xl flex items-center justify-center font-black text-xl shadow-lg shadow-red-700/30">GD</div>
          <span className="text-xl font-black tracking-tighter">Garir Dokan <span className="text-red-700 uppercase">Pro</span></span>
        </div>
        
        <div className="flex items-center gap-8">
          <button onClick={() => {setViewMode('landing'); setActiveType(null);}} className={`text-sm font-bold uppercase tracking-widest transition-colors ${viewMode === 'landing' ? 'text-red-600' : 'text-gray-400 hover:text-white'}`}>Home</button>
          <button onClick={() => {setViewMode('assets');}} className={`text-sm font-bold uppercase tracking-widest transition-colors ${viewMode === 'assets' ? 'text-red-600' : 'text-gray-400 hover:text-white'}`}>Asset Library</button>
          <button onClick={() => {setViewMode('list'); setActiveType(null);}} className={`text-sm font-bold uppercase tracking-widest transition-colors ${viewMode === 'list' ? 'text-red-600' : 'text-gray-400 hover:text-white'}`}>Records</button>
          <div className="h-4 w-px bg-white/10"></div>
          <button className="p-2 text-gray-400 hover:text-white transition-colors"><Settings className="w-5 h-5" /></button>
          <button onClick={() => setViewMode('landing')} className="bg-red-700 px-6 py-2 rounded-xl font-bold text-sm shadow-lg shadow-red-700/20 hover:bg-red-800 transition-all active:scale-95">Dashboard</button>
        </div>
      </nav>

      {viewMode === 'landing' && (
        <div className="flex flex-col overflow-x-hidden">
          {/* Hero Banner Section */}
          <section className="relative h-[90vh] overflow-hidden">
            {BANNERS.map((banner, idx) => (
              <div 
                key={idx}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === currentBanner ? 'opacity-100' : 'opacity-0'}`}
                style={{
                  backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 100%), url(${banner})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              />
            ))}

            <div className="absolute left-20 top-1/2 -translate-y-1/2 z-10">
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 p-12 rounded-[3.5rem] w-[580px] shadow-2xl relative overflow-hidden group">
                <div className="absolute -top-20 -left-20 w-40 h-40 bg-red-700/20 rounded-full blur-3xl group-hover:bg-red-700/40 transition-all"></div>
                
                <h1 className="text-6xl font-black leading-[1.1] mb-6 tracking-tighter uppercase">
                  Automotive <br/><span className="text-red-700 uppercase">Business</span> Manager
                </h1>
                
                <div className="h-10 overflow-hidden relative border-l-4 border-red-700 pl-4 bg-white/5 rounded-r-lg">
                  <div className="transition-all duration-500 transform translate-y-0 flex flex-col">
                    <p className="text-sm font-bold text-red-100/80 uppercase tracking-[0.2em] py-2">
                      {RUNNING_TEXTS[currentTextIndex]}
                    </p>
                  </div>
                </div>

                <div className="mt-12 flex gap-4">
                  <button onClick={() => setViewMode('list')} className="bg-red-700 text-white px-10 py-5 rounded-2xl font-black flex items-center gap-3 shadow-2xl shadow-red-700/40 hover:bg-red-800 transition-all group/btn uppercase tracking-widest text-xs">
                    View Inventory <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-2 transition-transform" />
                  </button>
                  <button className="bg-white/10 text-white px-10 py-5 rounded-2xl font-black border border-white/10 hover:bg-white/20 transition-all uppercase tracking-widest text-xs">
                    User Guide
                  </button>
                </div>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#0a0a0b] to-transparent"></div>
          </section>

          {/* Core Services Section */}
          <section className="px-20 pt-32 pb-16 bg-[#0a0a0b] relative">
            <div className="mb-24 flex flex-col items-center text-center">
              <p className="text-red-600 font-black uppercase tracking-[0.5em] text-[10px] mb-4">Enterprise Edition</p>
              <h2 className="text-6xl font-black mb-6 uppercase tracking-tighter">Premium <span className="text-red-700">Workspace</span></h2>
              <div className="h-2 w-32 bg-red-700 rounded-full shadow-lg shadow-red-700/40"></div>
            </div>

            {/* Document Creation Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-10 max-w-[1800px] mx-auto mb-16">
              {Object.entries(DOC_TYPES_CONFIG).map(([type, config]) => (
                <div 
                  key={type}
                  className="group relative bg-white rounded-[2.5rem] border border-gray-200/50 shadow-[0_15px_40px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_50px_100px_-20px_rgba(185,28,28,0.2)] hover:-translate-y-3 transition-all duration-700 overflow-hidden flex flex-col min-h-[420px]"
                >
                  <div 
                    onClick={() => {
                      setViewMode('list');
                      setActiveType(type as DocumentType);
                    }}
                    className="p-10 pb-8 flex-1 transition-all duration-700 group-hover:bg-[#8b0000] cursor-pointer flex flex-col"
                  >
                    <div className="w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-10 transition-all duration-700 bg-red-50 text-red-700 border border-red-100 shadow-sm group-hover:bg-white group-hover:text-red-800 group-hover:rotate-6 group-hover:scale-110">
                      {React.cloneElement(config.icon as React.ReactElement<any>, { className: 'w-7 h-7' })}
                    </div>
                    <h3 className="text-2xl font-black text-red-900 mb-4 uppercase tracking-tighter transition-all duration-700 group-hover:text-white group-hover:translate-x-1">{config.label}</h3>
                    <p className="text-[13px] text-gray-500 font-bold leading-relaxed mb-6 group-hover:text-red-100 transition-colors duration-700">
                      {type === DocumentType.INVOICE && "Professional vehicle sales records and automatic tracking."}
                      {type === DocumentType.QUOTATION && "Standard official quotes for individual or bank use."}
                      {type === DocumentType.BILL && "Record supplier transactions and operational costs."}
                      {type === DocumentType.CHALLAN && "Manage precise vehicle handover and item checks."}
                      {type === DocumentType.PRO_INVOICE && "High-impact visual documents for premium clients."}
                    </p>
                    <div className="mt-auto opacity-40 group-hover:opacity-100 transition-all duration-700 text-red-700 group-hover:text-white/80 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                      View History <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div 
                    onClick={() => {
                      if (type === DocumentType.PRO_INVOICE) {
                        setShowProGenerator(true);
                      } else {
                        setEditingDoc({ type: type as DocumentType });
                      }
                    }}
                    className="mt-auto border-t border-gray-50 p-10 flex justify-between items-center bg-[#9d1414] border-transparent transition-all duration-700 cursor-pointer hover:!bg-[#b91c1c] group/bottom"
                  >
                    <span className="text-[11px] font-black uppercase tracking-[0.3em] text-white group-hover:translate-x-2 transition-all duration-700">NEW DOCUMENT</span>
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#9d1414] shadow-sm transition-all duration-700 transform group-hover:rotate-[360deg] group-hover:scale-110">
                      <Plus className="w-6 h-6" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* HIGH-TECH BRIDGE STRIP */}
            <div className="max-w-[1800px] mx-auto px-10 mb-8 relative">
               <div className="h-px w-full bg-gradient-to-r from-transparent via-red-900/50 to-transparent mb-12"></div>
               <div className="flex flex-wrap items-center justify-between gap-10 px-10 py-8 bg-white/[0.03] border border-white/5 rounded-[2rem] backdrop-blur-md relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-900/10 via-transparent to-red-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                  
                  <div className="flex items-center gap-6 relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-red-700/10 border border-red-700/20 flex items-center justify-center">
                      <Zap className="w-6 h-6 text-red-700 animate-pulse" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">System Throughput</p>
                      <p className="text-sm font-bold text-white uppercase tracking-tighter">Real-time Performance Metrics</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-12 relative z-10">
                    <div className="flex items-center gap-4">
                      <div className="w-2 h-2 rounded-full bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.8)]"></div>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Database Ready</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]"></div>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Cloud Sync Active</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <Globe className="w-4 h-4 text-gray-600" />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Global Region: AP-South</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 relative z-10">
                    <div className="text-right">
                      <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Processor Load</p>
                      <p className="text-xs font-bold text-red-700">0.02ms latency</p>
                    </div>
                    <div className="h-10 w-px bg-white/10 mx-2"></div>
                    <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 group-hover:text-red-700 transition-colors">
                      <Cpu className="w-5 h-5" />
                    </div>
                  </div>
               </div>
            </div>

            {/* Business Intelligence Section with Background Image & Glassmorphism */}
            <div className="relative -mx-20 py-24 overflow-hidden">
              {/* Parallax-style Background Image */}
              <div 
                className="absolute inset-0 z-0 opacity-50 bg-fixed pointer-events-none"
                style={{
                  backgroundImage: `linear-gradient(to bottom, #0a0a0b 0%, rgba(10,10,11,0.4) 50%, #0a0a0b 100%), url(${STATS_BG})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              />
              
              <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(to_bottom,transparent_50%,#fff_50%)] bg-[length:100%_4px] animate-[scanline_10s_linear_infinite]"></div>

              <div className="max-w-[1800px] mx-auto px-20 relative z-10">
                <div className="flex flex-col gap-8">
                  
                  {/* CENTERED HEADER */}
                  <div className="flex flex-col items-center text-center mb-6 relative group">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[100px] bg-red-700/5 blur-[100px] pointer-events-none group-hover:bg-red-700/10 transition-all duration-1000"></div>
                    
                    <div className="bg-white/[0.03] border border-white/10 px-16 py-6 rounded-[4rem] backdrop-blur-xl shadow-2xl relative z-10 overflow-hidden transition-all duration-700 group-hover:bg-white/[0.05] group-hover:border-red-700/20 group-hover:-translate-y-1">
                      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.05] to-transparent pointer-events-none"></div>
                      
                      <h3 className="text-6xl font-black uppercase tracking-tighter text-white drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                        Business <span className="text-red-700">Intelligence</span>
                      </h3>
                      <p className="text-gray-400 text-[12px] font-black uppercase tracking-[0.6em] mt-4 opacity-70 group-hover:opacity-100 group-hover:text-red-100 transition-all duration-700">
                        Advanced Real-time Analytics Dashboard
                      </p>
                    </div>

                    <div className="mt-6 flex items-center gap-4 bg-black/40 px-8 py-3 rounded-full border border-white/5 backdrop-blur-3xl shadow-lg group/status hover:border-red-700/30 transition-all">
                       <Activity className="w-5 h-5 text-red-700 animate-pulse" />
                       <span className="text-[10px] font-black text-red-600 uppercase tracking-widest group-hover/status:text-white transition-colors">System Engine Status: 100% Optimal</span>
                    </div>
                  </div>

                  {/* Main Hero Stats - Non-Italic Numbers */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-black/60 border border-white/10 p-12 rounded-[4rem] backdrop-blur-[50px] relative overflow-hidden group hover:bg-black/80 hover:border-red-700/40 transition-all duration-700 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)]">
                      <div className="absolute -top-10 -right-10 opacity-5 group-hover:opacity-20 transition-all duration-700 scale-150 rotate-12">
                        <Database className="w-64 h-64 text-red-700" />
                      </div>
                      <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                           <div className="h-2 w-2 rounded-full bg-red-700 animate-ping"></div>
                           <p className="text-red-700 text-[11px] font-black uppercase tracking-[0.5em]">Inventory Audit</p>
                        </div>
                        <h4 className="text-8xl font-black tracking-tighter mb-6 group-hover:translate-x-2 transition-transform duration-700">
                          {totalRecords.toString().padStart(2, '0')}<span className="text-3xl text-gray-500 ml-5 font-bold tracking-normal opacity-50">Total Files</span>
                        </h4>
                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden mb-4">
                          <div className="h-full bg-gradient-to-r from-red-900 to-red-600 animate-pulse" style={{width: '75%'}}></div>
                        </div>
                        <p className="text-gray-600 text-[10px] font-bold uppercase tracking-widest leading-relaxed">Verified documents in active repository</p>
                      </div>
                    </div>

                    <div className="bg-black/60 border border-white/10 p-12 rounded-[4rem] backdrop-blur-[50px] relative overflow-hidden group hover:bg-black/80 hover:border-red-700/40 transition-all duration-700 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)]">
                      <div className="absolute -top-10 -right-10 opacity-5 group-hover:opacity-20 transition-all duration-700 scale-150 -rotate-12">
                        <CircleDollarSign className="w-64 h-64 text-red-700" />
                      </div>
                      <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                           <div className="h-2 w-2 rounded-full bg-red-700 animate-ping"></div>
                           <p className="text-red-700 text-[11px] font-black uppercase tracking-[0.5em]">Liquidity Value</p>
                        </div>
                        <div className="text-8xl font-black tracking-tighter mb-6 group-hover:translate-x-2 transition-transform duration-700 flex items-baseline gap-4">
                          <span className="text-5xl text-red-700">৳</span>{totalAssetValue.toLocaleString()}
                        </div>
                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden mb-4">
                          <div className="h-full bg-gradient-to-r from-red-900 to-red-600 animate-pulse" style={{width: '90%'}}></div>
                        </div>
                        <p className="text-gray-600 text-[10px] font-bold uppercase tracking-widest leading-relaxed">Gross financial tracking of registered assets</p>
                      </div>
                    </div>
                  </div>

                  {/* Categorical Breakdown Grid - Non-Italic Numbers */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mt-4">
                    {Object.entries(DOC_TYPES_CONFIG).map(([type, config]) => {
                      const count = getCountByType(type as DocumentType);
                      return (
                        <div key={type} className="bg-black/50 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-3xl hover:bg-red-950/40 hover:border-red-700/60 transition-all duration-700 group relative overflow-hidden shadow-2xl">
                          <div className="absolute -bottom-6 -right-6 opacity-[0.03] group-hover:opacity-20 transition-all duration-700">
                            {React.cloneElement(config.icon as React.ReactElement<any>, { className: 'w-20 h-20' })}
                          </div>
                          <div className="flex items-center gap-4 mb-4">
                             <div className="p-2.5 bg-red-700/10 rounded-xl text-red-700 group-hover:bg-red-700 group-hover:text-white transition-all duration-500">
                               {React.cloneElement(config.icon as React.ReactElement<any>, { className: 'w-4 h-4' })}
                             </div>
                             <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 group-hover:text-white transition-colors">{config.label}</span>
                          </div>
                          <div className="text-4xl font-black tracking-tighter group-hover:scale-110 transition-transform origin-left text-white">
                            {count.toString().padStart(2, '0')}
                          </div>
                          <p className="text-[8px] font-black text-gray-700 uppercase mt-3 tracking-[0.3em] group-hover:text-red-700 transition-colors">Records Audit</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <footer className="px-20 py-24 border-t border-white/5 bg-[#080809] flex flex-col items-center">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 bg-red-700 rounded-2xl flex items-center justify-center font-black text-2xl shadow-xl shadow-red-700/20">GD</div>
              <span className="text-2xl font-black tracking-tighter">Garir Dokan <span className="text-red-700 uppercase">Pro</span></span>
            </div>
            <p className="text-gray-600 text-[11px] font-black uppercase tracking-[0.5em] text-center max-w-2xl leading-loose">
              Advanced Document Infrastructure for Automotive Trading • Importers • Dealers
            </p>
            <div className="mt-16 text-gray-800 text-[11px] font-black uppercase tracking-[0.2em]">© 2025 GARIR DOKAN PRO • ALL RIGHTS RESERVED</div>
          </footer>
        </div>
      )}

      {viewMode === 'assets' && (
        <div className="pt-32 px-10 min-h-screen pb-20">
          <AssetLibrary />
        </div>
      )}

      {viewMode === 'list' && (
        <div className="pt-32 px-10 min-h-screen flex flex-col pb-20">
          <header className="flex justify-between items-center mb-10">
            <div className="animate-in fade-in duration-500">
              <div className="flex items-center gap-3 mb-2">
                 <button onClick={() => {setViewMode('landing'); setActiveType(null);}} className="text-gray-600 hover:text-red-600 transition-colors uppercase text-[10px] font-black tracking-widest">Dashboard</button>
                 <ChevronRight className="w-3 h-3 text-gray-700" />
                 <span className="text-red-700 uppercase text-[10px] font-black tracking-widest">Record Archive</span>
              </div>
            </div>

            <div className="flex items-center gap-6">
               <div className="relative w-96 group">
                 <Search className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-red-700 transition-colors" />
                 <input 
                   type="text" 
                   placeholder="Search ID, Client or Vehicle..." 
                   className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold focus:border-red-700/50 focus:bg-white/10 outline-none transition-all placeholder:text-gray-600"
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                 />
               </div>
               <button 
                 onClick={() => {
                   if (activeType === DocumentType.PRO_INVOICE) {
                     setShowProGenerator(true);
                   } else {
                     setEditingDoc({ type: activeType || DocumentType.INVOICE });
                   }
                 }}
                 className="bg-red-700 text-white px-10 py-4 rounded-2xl font-black flex items-center gap-3 hover:bg-red-800 transition-all active:scale-95 shadow-2xl shadow-red-700/20 uppercase tracking-widest text-xs"
               >
                 <Plus className="w-6 h-6" /> Create New
               </button>
            </div>
          </header>

          {/* Records Navigation Tabs */}
          <div className="mb-10 flex flex-wrap items-center gap-4 bg-white/5 p-3 rounded-[2.5rem] border border-white/5 backdrop-blur-xl animate-in slide-in-from-top-4 duration-500">
             <button 
               onClick={() => setActiveType(null)}
               className={`px-8 py-3.5 rounded-full font-black text-[11px] uppercase tracking-widest transition-all flex items-center gap-3 ${activeType === null ? 'bg-red-700 text-white shadow-lg shadow-red-700/20' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
             >
               <LayoutDashboard className="w-4 h-4" />
               All Records
               <span className={`px-2 py-0.5 rounded-md text-[9px] ${activeType === null ? 'bg-white/20' : 'bg-white/10'}`}>{documents.length}</span>
             </button>
             
             <div className="h-6 w-px bg-white/10 mx-2"></div>

             {Object.entries(DOC_TYPES_CONFIG).map(([type, config]) => {
               const count = getCountByType(type as DocumentType);
               const isActive = activeType === type;
               return (
                 <button 
                   key={type}
                   onClick={() => setActiveType(type as DocumentType)}
                   className={`px-6 py-3.5 rounded-full font-black text-[11px] uppercase tracking-widest transition-all flex items-center gap-3 ${isActive ? 'bg-red-700 text-white shadow-lg shadow-red-700/20' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                 >
                   {React.cloneElement(config.icon as React.ReactElement<any>, { className: 'w-4 h-4' })}
                   {config.label}
                   <span className={`px-2 py-0.5 rounded-md text-[9px] ${isActive ? 'bg-white/20' : 'bg-white/10'}`}>{count}</span>
                 </button>
               );
             })}
          </div>

          <div className="flex-1 bg-white/5 border border-white/5 rounded-[3.5rem] overflow-hidden backdrop-blur-xl animate-in slide-in-from-bottom-10 duration-700">
            <table className="w-full text-left">
              <thead className="bg-white/5 border-b border-white/5">
                <tr className="text-[11px] font-black text-gray-500 uppercase tracking-[0.2em]">
                  <th className="px-12 py-8">Category</th>
                  <th className="px-12 py-8">Document / ID</th>
                  <th className="px-12 py-8">Recipient</th>
                  <th className="px-12 py-8">Valuation</th>
                  <th className="px-12 py-8 text-right">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-white/5 transition-all group/row">
                    <td className="px-12 py-7">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-2xl transition-all group-hover/row:scale-110 ${DOC_TYPES_CONFIG[doc.type].bgColor} ${DOC_TYPES_CONFIG[doc.type].color}`}>
                          {DOC_TYPES_CONFIG[doc.type].icon}
                        </div>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{DOC_TYPES_CONFIG[doc.type].label}</p>
                      </div>
                    </td>
                    <td className="px-12 py-7">
                      <p className="text-base font-black text-white group-hover/row:text-red-700 transition-colors">{doc.docNumber}</p>
                      <p className="text-[10px] font-bold text-gray-600 uppercase mt-1">Ref No: {doc.id.slice(0,6)}</p>
                    </td>
                    <td className="px-12 py-7">
                      <p className="text-sm font-bold text-gray-200 uppercase tracking-tight">{doc.clientName}</p>
                      <p className="text-[10px] text-gray-600 font-bold mt-1 max-w-[200px] truncate uppercase">{doc.vehicleTitle}</p>
                    </td>
                    <td className="px-12 py-7">
                      <p className="text-base font-black text-white">৳{doc.vehiclePrice.toLocaleString()}</p>
                    </td>
                    <td className="px-12 py-7 text-right flex justify-end gap-3">
                      <button onClick={() => setPreviewingDoc(doc)} className="p-4 text-red-600 bg-red-700/10 rounded-2xl hover:bg-red-700 hover:text-white transition-all shadow-sm"><Eye className="w-5 h-5" /></button>
                      <button onClick={() => setEditingDoc(doc)} className="p-4 text-blue-500 bg-blue-500/10 rounded-2xl hover:bg-blue-500 hover:text-white transition-all shadow-sm"><Edit className="w-5 h-5" /></button>
                      <button onClick={() => handleDelete(doc.id)} className="p-4 text-gray-500 bg-white/5 rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-sm"><Trash2 className="w-5 h-5" /></button>
                    </td>
                  </tr>
                ))}
                {filteredDocs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-8 py-32 text-center text-gray-700 font-black text-lg uppercase tracking-[0.5em] opacity-30 italic">No records found in database</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {editingDoc && (
        <div className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-0">
          <div className="bg-[#0a0a0b] w-full h-full border-white/10 shadow-2xl overflow-hidden flex animate-in zoom-in duration-500">
            <div className="flex-1 overflow-hidden">
              {editingDoc.type === DocumentType.PRO_INVOICE ? (
                <ProInvoiceGenerator 
                  initialData={editingDoc}
                  onSave={handleSave} 
                  onCancel={() => setEditingDoc(null)} 
                />
              ) : (
                <DocumentForm 
                  initialData={editingDoc} 
                  onSave={handleSave} 
                  onCancel={() => setEditingDoc(null)}
                  onChange={setDraftDoc}
                />
              )}
            </div>
            {editingDoc.type !== DocumentType.PRO_INVOICE && (
              <div className="w-[45%] bg-black/50 p-12 overflow-y-auto flex flex-col items-center scrollbar-hide border-l border-white/10">
                <div className="mb-8 w-full flex justify-between items-center text-white/40">
                  <span className="text-[11px] font-black uppercase tracking-[0.3em]">Live Rendering Engine</span>
                  <span className="text-[11px] font-bold">Standard A4 Format</span>
                </div>
                <div className="hover:scale-[1.02] transition-transform duration-700 ease-out">
                  {draftDoc && <DocumentPreview document={draftDoc as BusinessDocument} containerRef={previewRef} scale={0.65} />}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showProGenerator && (
        <ProInvoiceGenerator 
          onSave={handleSave} 
          onCancel={() => setShowProGenerator(false)} 
        />
      )}

      {previewingDoc && (
        <div className="fixed inset-0 z-[60] bg-black/98 backdrop-blur-3xl flex flex-col items-center animate-in fade-in duration-500">
          <div className="w-full bg-black/60 p-8 flex justify-between items-center shadow-2xl px-16 border-b border-white/5 backdrop-blur-md">
            <div className="flex items-center gap-6">
               <button onClick={() => setPreviewingDoc(null)} className="p-4 hover:bg-white/10 rounded-[2rem] transition-all group"><X className="w-8 h-8 text-gray-500 group-hover:text-white" /></button>
               <div>
                 <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-1 leading-none">{previewingDoc.docNumber}</h2>
                 <p className="text-[11px] font-black text-red-700 uppercase tracking-[0.2em]">{previewingDoc.clientName}</p>
               </div>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => handleDownloadPDF(previewingDoc)}
                className="bg-red-700 text-white px-12 py-5 rounded-[2rem] font-black flex items-center gap-3 shadow-2xl shadow-red-700/20 hover:bg-red-800 transition-all active:scale-95 uppercase tracking-widest text-xs"
              >
                <Download className="w-6 h-6" /> Export Document
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto py-20 px-4 w-full flex justify-center scrollbar-hide">
            <DocumentPreview document={previewingDoc} containerRef={previewRef} />
          </div>
        </div>
      )}
    </div>
  );
};

export default App;