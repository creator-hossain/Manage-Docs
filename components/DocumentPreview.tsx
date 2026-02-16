import React from 'react';
import { BusinessDocument, DocumentType, InvoiceItem } from '../types';

interface DocumentPreviewProps {
  document: BusinessDocument;
  containerRef?: React.RefObject<HTMLDivElement>;
  scale?: number;
}

const DocumentPreview: React.FC<DocumentPreviewProps> = ({ document, containerRef, scale = 1 }) => {
  const { 
    type, docNumber, date, clientName, clientAddress, clientPhone,
    clientDesignation, clientOffice, acName, logoUrl, logoSize = 220, logoPosition = 0,
    vehicleTitle, vehicleTitleSize = 16, vehicleTitleAlign = 'left', brand, model, yearModel, color, chassisNumber, engineNumber, auctionPoint, cc, fuel, transmission,
    vehiclePrice, priceInWords, payments, quantity, notes, hiddenFields = [],
    advancedPaidAmount = 0, bankPaymentAmount = 0, bankName = "",
    productImageUrl, items = []
  } = document;

  const isHidden = (id: string) => hiddenFields.includes(id);

  const isQuotation = type === DocumentType.QUOTATION;
  const isBill = type === DocumentType.BILL;
  const isChallan = type === DocumentType.CHALLAN;
  const isProInvoice = type === DocumentType.PRO_INVOICE;

  const formattedPrice = vehiclePrice > 0 ? new Intl.NumberFormat('en-IN').format(vehiclePrice) : "0";

  const commonA4Style: React.CSSProperties = {
    fontFamily: '"Times New Roman", Times, serif',
    width: '210mm',
    minHeight: '297mm',
    padding: '0',
    transform: scale !== 1 ? `scale(${scale})` : 'none',
    transformOrigin: 'top center',
    marginBottom: scale !== 1 ? `-${297 * (1 - scale)}mm` : '10px',
    color: '#000000',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'white',
    boxSizing: 'border-box'
  };

  // Render Product Invoice (Multi-row variant) - Precisely matched to OIL FILTER image
  if (isProInvoice) {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const totalPaid = (payments || []).reduce((sum, p) => sum + (p.amount || 0), 0);
    const balance = subtotal - totalPaid;
    const showImageColumn = !isHidden('itemImageColumn');

    const proInvoiceStyle: React.CSSProperties = {
      ...commonA4Style,
      fontFamily: '"Segoe UI", Arial, sans-serif',
    };

    return (
      <div className="bg-[#525659] p-4 overflow-auto flex justify-center w-full">
        <div ref={containerRef} className="a4-page shadow-2xl relative bg-white !text-black" style={proInvoiceStyle}>
          <div className="flex pt-[5mm] mb-[5px] w-full">
            <div className="logo-container" style={{ width: `${logoSize}px`, marginLeft: `${logoPosition}px` }}>
              {logoUrl && <img src={logoUrl} alt="Logo" className="w-full block" />}
            </div>
          </div>
          <div className="grey-bar bg-[#d1d3d4] py-[4px] pl-[5mm] italic text-[14px] font-serif border-y border-gray-400 mb-[15px] w-full text-left text-black box-border">
            Importer & All kinds of Brand new & Reconditioned Vehicles Supplier
          </div>
          
          <div className="main-content px-[15mm] text-black flex-1 flex flex-col pb-[30mm]">
            <div className="flex justify-between items-baseline mb-6 border-b border-black pb-2 text-black">
              <h1 className="m-0 text-[32px] font-bold text-black tracking-tight uppercase">INVOICE</h1>
              <div className="text-[11px] font-bold text-black uppercase tracking-widest">CUSTOMER COPY</div>
            </div>

            <div className="grid grid-cols-[1.4fr_0.6fr] gap-10 mb-8 text-[14px] text-black">
              <div className="space-y-1 text-black">
                <div className="flex text-black items-start">
                  <span className="font-bold min-w-[110px] text-black">Buyer's Name</span>
                  <span className="mr-2 text-black">:</span> 
                  <span className="font-bold uppercase flex-1 text-black">{clientName || '---'}</span>
                </div>
                <div className="flex text-black items-start">
                  <span className="font-bold min-w-[110px] text-black">Phone</span>
                  <span className="mr-2 text-black">:</span> 
                  <span className="flex-1 text-black">{clientPhone || '---'}</span>
                </div>
                <div className="flex text-black items-start">
                  <span className="font-bold min-w-[110px] text-black">Address</span>
                  <span className="mr-2 text-black">:</span> 
                  <span className="capitalize flex-1 leading-snug text-black">{clientAddress || '---'}</span>
                </div>
              </div>
              <div className="space-y-1 text-right text-black">
                <div className="flex justify-end text-black">
                  <span className="font-bold min-w-[80px] text-right mr-2 text-black">DATE:</span> 
                  <span className="font-bold text-black">{new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-')}</span>
                </div>
                <div className="flex justify-end text-black">
                  <span className="font-bold min-w-[80px] text-right mr-2 text-black">Invoice no.:</span> 
                  <span className="font-bold text-black">{docNumber}</span>
                </div>
              </div>
            </div>

            <table className="w-full border-collapse text-black table-fixed">
              <thead>
                <tr className="bg-white border-y-[1.5px] border-black">
                  {/* Narrow SL NO as per screenshot */}
                  <th className="p-2.5 text-center font-bold w-[8%] uppercase text-[12px] text-black whitespace-nowrap">SL NO</th>
                  {/* Wide Description */}
                  <th className="p-2.5 text-left font-bold uppercase pl-4 text-[12px] text-black w-[38%]">DESCRIPTION</th>
                  {/* Image Column */}
                  {showImageColumn && <th className="p-2.5 text-center font-bold w-[14%] uppercase text-[12px] text-black">IMAGE</th>}
                  {/* narrow QTY */}
                  <th className="p-2.5 text-center font-bold w-[8%] uppercase text-[12px] text-black">QTY</th>
                  {/* Unit price */}
                  <th className="p-2.5 text-right font-bold w-[16%] uppercase pr-4 text-[12px] text-black">UNIT PRICE</th>
                  {/* Total */}
                  <th className="p-2.5 text-right font-bold w-[16%] uppercase pr-4 text-[12px] text-black">TOTAL</th>
                </tr>
              </thead>
              <tbody>
                {items.length > 0 ? items.map((item, index) => (
                  <tr key={item.id} className="text-black border-b border-gray-100 last:border-black last:border-b-[1.5px]">
                    <td className="p-3 text-center align-middle font-bold text-[13px] text-black whitespace-nowrap">{(index + 1).toString().padStart(2, '0')}</td>
                    <td className="p-3 align-middle font-bold pl-4 text-[14px] text-black uppercase overflow-hidden truncate">
                      {item.description}
                    </td>
                    {showImageColumn && (
                      <td className="p-3 text-center align-middle">
                        {item.imageUrl && (
                          <div className={`mx-auto rounded-lg overflow-hidden border border-gray-100 shadow-sm ${
                            item.imageSize === 'small' ? 'w-10 h-10' : 
                            item.imageSize === 'medium' ? 'w-14 h-14' : 
                            'w-20 h-20'
                          }`}>
                            <img src={item.imageUrl} alt="Product" className="w-full h-full object-cover" />
                          </div>
                        )}
                      </td>
                    )}
                    <td className="p-3 text-center align-middle font-bold text-[14px] text-black">{item.quantity}</td>
                    <td className="p-3 text-right align-middle font-bold pr-4 text-[14px] text-black">{item.unitPrice.toLocaleString()}/-</td>
                    <td className="p-3 text-right align-middle font-black pr-4 text-[15px] text-black">{(item.quantity * item.unitPrice).toLocaleString()}/-</td>
                  </tr>
                )) : (
                  <tr className="h-[100px] text-black border-b-[1.5px] border-black">
                    <td colSpan={showImageColumn ? 6 : 5} className="text-center text-black font-bold italic align-middle">No items added to invoice</td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="mt-8 self-end w-[320px] text-black">
              <div className="flex justify-between items-center mb-1 text-[16px] font-bold">
                <div className="text-right flex-1 pr-6 uppercase">Subtotal:</div>
                <div className="w-[140px] text-right font-black">{subtotal.toLocaleString()}/-</div>
              </div>
              <div className="flex justify-between items-center mb-1 text-[16px] font-bold">
                <div className="text-right flex-1 pr-6 uppercase">Total Paid:</div>
                <div className="w-[140px] text-right border-b border-gray-400 font-black">{totalPaid.toLocaleString()}/-</div>
              </div>
              <div className="flex justify-between items-center mt-2 text-[18px] font-bold">
                <div className="text-right flex-1 pr-6 uppercase">Balance:</div>
                <div className="w-[140px] text-right bg-[#fff1f2] text-red-700 font-black px-2 py-1 rounded">৳ {balance.toLocaleString()}/-</div>
              </div>
            </div>
          </div>

          <div className="footer-container absolute bottom-[10mm] left-0 right-0 px-[15mm] text-center z-10 text-black">
            <div className="h-px bg-red-600/30 w-full mb-3"></div>
            <div className="flex justify-center items-center gap-4 text-[11px] text-black font-bold">
              <span className="flex items-center gap-1 text-black"><span className="text-red-600">📍</span> A.Hamid Road, Pabna</span>
              <span className="flex items-center gap-1 text-black"><span className="text-red-600">✉️</span> garirdokan2021@gmail.com</span>
              <span className="flex items-center gap-1 text-black"><span className="text-red-600">📞</span> +880 1713 110 570</span>
            </div>
            <div className="web-url text-[15px] mt-[5px] tracking-[4px] font-sans text-black lowercase text-center font-bold">
              w w w . <span className="text-red-600">g</span> a r i r <span className="text-red-600">d</span> o k a n . c o m
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render Delivery Challan - Custom Matched to Image Reference
  if (isChallan) {
    const challanStyle: React.CSSProperties = {
      ...commonA4Style,
      fontFamily: "'Courier Prime', monospace",
      color: '#000000',
    };

    return (
      <div className="bg-[#525659] p-4 overflow-auto flex justify-center w-full">
        <div ref={containerRef} className="a4-page shadow-2xl relative overflow-hidden bg-white !text-black" style={challanStyle}>
          {/* Header Section */}
          <div className="flex justify-between items-start pt-[8mm] pl-[5mm] pr-[15mm] mb-[2mm] z-10 text-black">
            <div className="logo-container" style={{ width: `${logoSize}px`, marginLeft: `${logoPosition}px` }}>
              {logoUrl && <img src={logoUrl} alt="Logo" className="w-full block" />}
            </div>
            <div className="text-right flex flex-col items-end text-black">
              <span className="text-[#d1d3d4] text-[42px] font-sans font-light leading-none tracking-[8px] uppercase">DELIVERY</span>
              <span className="text-[#d1d3d4] text-[42px] font-sans font-light leading-none tracking-[8px] uppercase mt-[-5px]">CHALLAN</span>
            </div>
          </div>

          {/* Importer Tagline Bar - Updated to match Quotation style as requested */}
          <div className="grey-bar bg-[#d1d3d4] py-[4px] pl-[5mm] italic text-[14px] font-serif border-y border-gray-400 mb-[20px] w-full text-left text-black z-10 box-border">
            Importer & All kinds of Brand new & Reconditioned Vehicles Supplier
          </div>

          <div className="main-content px-[15mm] text-black flex-1 relative z-10 pb-[30mm]">
            {/* Document Info Grid */}
            <div className="flex justify-between mb-8 text-[16px] leading-relaxed text-black">
              <div className="space-y-1 text-black">
                <div><span className="text-gray-600">Invoice No:</span></div>
                <div className="font-bold text-[18px] text-black">#{docNumber}</div>
                <div className="pt-4"><span className="text-gray-600">Date Issued:</span></div>
                <div className="font-bold text-black">{new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
              </div>
              <div className="text-left w-[350px] text-black">
                <div className="text-gray-600">Issued to:</div>
                <div className="font-bold uppercase text-black">{clientName}</div>
                <div><span className="text-gray-600">Cell:</span> <span className="text-black">{clientPhone}</span></div>
                <div><span className="text-gray-600">Adress:</span> <span className="capitalize text-black">{clientAddress}</span></div>
              </div>
            </div>

            {/* Table Section */}
            <table className="w-full border-collapse mb-8 border border-[#bcbec0] text-black">
              <thead>
                <tr className="bg-[#f1f2f2] text-black">
                  <th className="border border-[#bcbec0] p-2 text-center font-bold text-[14px] w-[60px] uppercase text-black">NO</th>
                  <th className="border border-[#bcbec0] p-2 text-left font-bold text-[14px] uppercase pl-6 text-black">DESCRIPTION</th>
                  <th className="border border-[#bcbec0] p-2 text-center font-bold text-[14px] w-[120px] uppercase text-black">QTY</th>
                </tr>
              </thead>
              <tbody>
                <tr className="min-h-[350px] text-black">
                  <td className="border border-[#bcbec0] p-4 text-center align-top text-black">1</td>
                  <td className="border border-[#bcbec0] p-6 align-top text-black">
                    <div 
                      className="uppercase font-bold mb-4 leading-tight text-black whitespace-pre-wrap"
                      style={{ fontSize: `${vehicleTitleSize}px`, textAlign: vehicleTitleAlign }}
                    >
                      {vehicleTitle}
                    </div>
                    <div className="space-y-1 mt-6 text-[15px] text-black">
                      <div className="flex text-black"><span className="w-[160px] font-bold text-black">| COLOR</span> <span className="mr-2 text-black">:</span> <span className="text-black">{color}</span></div>
                      <div className="flex text-black"><span className="w-[160px] font-bold text-black">| MODEL</span> <span className="mr-2 text-black">:</span> <span className="text-black">{yearModel}</span></div>
                      <div className="flex text-black"><span className="w-[160px] font-bold text-black">| Engine No</span> <span className="mr-2 text-black">:</span> <span className="text-black">{engineNumber}</span></div>
                      <div className="flex text-black"><span className="w-[160px] font-bold text-black">| AUCTION POINT</span> <span className="mr-2 text-black">:</span> <span className="text-black">{auctionPoint || ''}</span></div>
                      <div className="flex text-black"><span className="w-[160px] font-bold text-black">| Chassis No</span> <span className="mr-2 text-black">:</span> <span className="text-black">{chassisNumber}</span></div>
                    </div>
                  </td>
                  <td className="border border-[#bcbec0] p-4 text-center align-middle font-bold text-[18px] text-black">
                    {quantity < 10 ? `0${quantity}` : quantity}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Acknowledgment Section */}
            <div className="mt-10 text-black">
              <h3 className="font-bold text-[16px] mb-4 text-black">Customer Acknowledgment of Vehicle Condition:</h3>
              <p className="text-[14px] leading-relaxed text-justify mb-8 text-black">
                I, {clientName}, hereby acknowledge that I have received the vehicle with all the required paper documentation and I confirm that the vehicle has been delivered in complete and good condition. I have inspected the vehicle and found it to be satisfactory in all aspects, including its physical and mechanical condition. I have no complaints regarding the state of the vehicle at the time of delivery.
              </p>
            </div>

            {/* Signature Area */}
            <div className="flex justify-between mt-20 pt-10 text-black">
              <div className="text-center w-[250px] border-t border-black pt-2 text-black">
                <span className="text-[15px] font-bold text-black">Received By</span>
              </div>
              <div className="text-center w-[250px] border-t border-black pt-2 text-black">
                <span className="text-[15px] font-bold text-black">Proprietor</span>
              </div>
            </div>
          </div>

          {/* Footer Section */}
          <div className="footer-container absolute bottom-[10mm] left-0 right-0 px-[15mm] text-center z-10 text-black">
            <div className="h-px bg-red-600/30 w-full mb-3"></div>
            <div className="flex justify-center items-center gap-4 text-[11px] text-black font-bold">
              <span className="flex items-center gap-1 text-black"><span className="text-red-600">📍</span> A.Hamid Road, Pabna</span>
              <span className="flex items-center gap-1 text-black"><span className="text-red-600">✉️</span> garirdokan2021@gmail.com</span>
              <span className="flex items-center gap-1 text-black"><span className="text-red-600">📞</span> +880 1713 110 570</span>
            </div>
            <div className="web-url text-[15px] mt-[5px] tracking-[4px] font-sans text-black lowercase text-center font-bold">
              w w w . <span className="text-red-600">g</span> a r i r <span className="text-red-600">d</span> o k a n . c o m
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render Bill
  if (isBill) {
    return (
      <div className="bg-[#525659] p-4 overflow-auto flex justify-center w-full">
        <div ref={containerRef} className="a4-page shadow-2xl relative bg-white !text-black" style={commonA4Style}>
          <div className="flex pt-[5mm] mb-[5px] w-full text-black">
            <div className="logo-container" style={{ width: `${logoSize}px`, marginLeft: `${logoPosition}px` }}>
              {logoUrl && <img src={logoUrl} alt="Logo" className="w-full block" />}
            </div>
          </div>
          <div className="grey-bar bg-[#d1d3d4] py-[4px] pl-[5mm] italic text-[14px] font-serif border-y border-gray-400 mb-[15px] w-full text-left text-black box-border">
            Importer & All kinds of Brand new & Reconditioned Vehicles Supplier
          </div>
          <div className="main-content px-[20mm] text-black flex-1 relative pb-[30mm]">
            <div className="text-center font-bold uppercase mt-[-10px] mb-[15px] text-[22px] text-black">BILL</div>
            <div className="mb-[25px] leading-[1.2] text-[17px] text-black">
              To,<br />
              <div className="flex flex-col text-black">
                <span className="text-black font-bold">{acName ? `A/C: ${acName}` : clientName}</span>
                {clientDesignation && <span className="text-black font-bold">{clientDesignation},</span>}
                {clientOffice && <span className="text-black font-bold">{clientOffice}</span>}
                <div className="whitespace-pre-wrap text-black capitalize">{clientAddress}</div>
              </div>
            </div>
            <div className="font-bold mb-[30px] text-black" style={{ fontSize: `${vehicleTitleSize}px` }}>Sub: Bill for {vehicleTitle}</div>
            <div className="relative text-black">
              <table className="w-full border-collapse mb-[25px] border border-black relative z-[1] text-black">
                <thead>
                  <tr className="bg-white h-[45px] text-black">
                    <th className="border border-black p-2 text-center font-bold w-[55%] text-[17px] text-black bg-white uppercase">DESCRIPTION OF VEHICLE</th>
                    <th className="border border-black p-2 text-center font-bold w-[15%] text-[17px] text-black bg-white uppercase">Unit</th>
                    <th className="border border-black p-2 text-center font-bold w-[30%] text-[16px] text-black bg-white uppercase whitespace-nowrap">TOTAL AMOUNT (TK)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="text-black">
                    <td className="border-x border-black px-6 pt-8 pb-8 align-top text-black min-h-[400px]">
                      <div className="specs-block space-y-2 text-[20px] text-black">
                        <div className="grid grid-cols-[140px_25px_1fr] text-black">
                           <span className="font-bold text-black">Vehicle</span>
                           <span className="text-black">:</span>
                           <span className="font-bold text-black">{formattedPrice}/-</span>
                        </div>
                        {!isHidden('yearModel') && <div className="grid grid-cols-[140px_25px_1fr] text-black"><span className="text-black">Year</span><span className="text-black">:</span><span className="text-black">{yearModel}</span></div>}
                        {!isHidden('cc') && <div className="grid grid-cols-[140px_25px_1fr] text-black"><span className="text-black">CC.</span><span className="text-black">:</span><span className="text-black">{cc}</span></div>}
                        {!isHidden('engineNumber') && <div className="grid grid-cols-[140px_25px_1fr] text-black"><span className="text-black">Engine No.</span><span className="text-black">:</span><span className="text-black">{engineNumber}</span></div>}
                        {!isHidden('chassisNumber') && <div className="grid grid-cols-[140px_25px_1fr] text-black"><span className="text-black">Chassis No</span><span className="text-black">:</span><span className="text-black">{chassisNumber}</span></div>}
                        {!isHidden('color') && <div className="grid grid-cols-[140px_25px_1fr] text-black"><span className="text-black">Color</span><span className="text-black">:</span><span className="text-black">{color}</span></div>}
                      </div>
                    </td>
                    <td className="border-x border-black px-3 pt-8 text-center align-middle font-bold text-[22px] text-black">
                      {quantity < 10 ? `0${quantity}` : quantity}
                    </td>
                    <td className="border-x border-black px-6 pt-8 text-right align-middle text-[20px] text-black font-bold"></td>
                  </tr>
                  <tr className="text-black h-[40px] border-t border-black">
                    <td colSpan={2} className="border-r border-black px-6 text-left text-[16px] text-black align-middle">
                      Advance Paid By Customer
                    </td>
                    <td className="px-6 text-right text-[17px] text-black align-middle font-bold">
                      {advancedPaidAmount > 0 ? `${new Intl.NumberFormat('en-IN').format(advancedPaidAmount)}/-` : '-'}
                    </td>
                  </tr>
                  <tr className="text-black h-[40px] border-t border-black">
                    <td colSpan={2} className="border-r border-black px-6 text-left text-[16px] text-black align-middle">
                      Paid by {bankName || 'Bank Name'}
                    </td>
                    <td className="px-6 text-right text-[17px] text-black align-middle font-bold">
                      {bankPaymentAmount > 0 ? `${new Intl.NumberFormat('en-IN').format(bankPaymentAmount)}/-` : '-'}
                    </td>
                  </tr>
                  <tr className="font-bold border-t border-black text-black h-[55px]">
                    <td colSpan={2} className="border border-black px-6 text-left text-[18px] uppercase text-black align-middle">NET PRICE IN TAKA</td>
                    <td className="border border-black px-6 text-right text-[20px] text-black align-middle">{formattedPrice}/-</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="text-[19px] mt-[25px] text-black">
              <span className="font-bold text-black">Price in words : {priceInWords}</span>
            </div>
            <div className="text-[19px] font-bold text-black mt-[25px]">
              Yours Faithfully,
            </div>
          </div>
          <div className="footer-container absolute bottom-[10mm] left-[20mm] right-[20mm] text-center border-t border-red-500 pt-[8px] text-[12px] text-black">
            <div className="text-black">📍 A.Hamid Road, Pabna &nbsp; ✉️ garirdokan2021@gmail.com &nbsp; 📞 +880 1713 110 570</div>
            <div className="web-url text-[15px] mt-[5px] tracking-[2px] font-sans text-black uppercase text-center font-bold">
              w w w . <span className="text-red-600">g</span> a r i r <span className="text-red-600">d</span> o k a n . c o m
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render Quotation 
  if (isQuotation) {
    return (
      <div className="bg-[#525659] p-4 overflow-auto flex justify-center w-full">
        <div ref={containerRef} className="a4-page shadow-2xl relative bg-white !text-black" style={commonA4Style}>
          <div className="flex pt-[5mm] mb-[5px] w-full text-black">
            <div className="logo-container" style={{ width: `${logoSize}px`, marginLeft: `${logoPosition}px` }}>
              {logoUrl && <img src={logoUrl} alt="Logo" className="w-full block" />}
            </div>
          </div>
          <div className="grey-bar bg-[#d1d3d4] py-[4px] pl-[5mm] italic text-[14px] font-serif border-y border-gray-400 mb-[15px] w-full text-left text-black box-border">
            Importer & All kinds of Brand new & Reconditioned Vehicles Supplier
          </div>
          <div className="main-content px-[20mm] text-black">
            <div 
              className="quotation-heading font-bold uppercase mt-[10px] mb-[20px] text-black whitespace-pre-wrap leading-tight"
              style={{ fontSize: `${vehicleTitleSize}px`, textAlign: vehicleTitleAlign }}
            >
              QUOTATION FOR <span className="uppercase text-black">{vehicleTitle}</span>
            </div>
            <div className="top-details-flex flex justify-between items-start mb-[15px] leading-[1.4] text-[15px] text-black">
              <div id="recipient-block" className="text-black">
                To,<br />
                {clientDesignation && <span className="text-black">{clientDesignation}<br /></span>}
                {clientOffice && <span className="text-black">{clientOffice}<br /></span>}
                {clientAddress && <div className="whitespace-pre-wrap text-black capitalize">{clientAddress}</div>}
                {acName && <div className="mt-1 text-black font-bold">A/C: {acName}</div>}
              </div>
              {!isHidden('date') && <div className="date-box text-black">Date: {new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-')}</div>}
            </div>
            <div className="dear-sir-block mb-[15px] text-[15px] text-black">Dear Sir,<br /><span className="intro-text block whitespace-nowrap text-black">We have the pleasure to offer you the under mentioned vehicle with the following terms & conditions.</span></div>
            <div className="relative text-black">
               <table className="main-table w-full border-collapse mb-[15px] border border-black relative z-[1] text-black">
                <thead>
                  <tr className="bg-white text-black">
                    <th className="border border-black p-2 text-center font-bold w-[65%] text-[15px] text-black bg-white uppercase">DESCRIPTION OF VEHICLE</th>
                    <th className="border border-black p-2 text-center font-bold w-[10%] text-[15px] text-black bg-white uppercase">QTY</th>
                    <th className="border border-black p-2 text-center font-bold w-[25%] text-[15px] text-black bg-white whitespace-nowrap uppercase">TOTAL AMOUNT (TK)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="text-black">
                    <td className="border border-black p-2 align-top text-black">
                      <ul className="spec-list list-none m-0 p-0 leading-[1.5] text-[15px] text-black">
                        {!isHidden('brand') && <li className="text-black"><span className="inline-block w-[110px] font-bold text-black">Brand Name</span><span className="text-black">: </span>{brand}</li>}
                        {!isHidden('model') && <li className="text-black"><span className="inline-block w-[110px] font-bold text-black">Model</span><span className="text-black">: </span>{model}</li>}
                        {!isHidden('yearModel') && <li className="text-black"><span className="inline-block w-[110px] font-bold text-black">Year Model</span><span className="text-black">: </span>{yearModel}</li>}
                        {!isHidden('color') && <li className="text-black"><span className="inline-block w-[110px] font-bold text-black">Color</span><span className="text-black">: </span>{color}</li>}
                        {!isHidden('chassisNumber') && <li className="text-black"><span className="inline-block w-[110px] font-bold text-black">Chassis No</span><span className="text-black">: </span>{chassisNumber}</li>}
                        {!isHidden('engineNumber') && <li className="text-black"><span className="inline-block w-[110px] font-bold text-black">Engine No</span><span className="text-black">: </span>{engineNumber}</li>}
                        {!isHidden('cc') && <li className="text-black"><span className="inline-block w-[110px] font-bold text-black">C.C</span><span className="text-black">: </span>{cc}</li>}
                        {!isHidden('fuel') && <li className="text-black"><span className="inline-block w-[110px] font-bold text-black">Fuel</span><span className="text-black">: </span>{fuel}</li>}
                        {!isHidden('transmission') && <li className="text-black"><span className="inline-block w-[110px] font-bold text-black">Transmission</span><span className="text-black">: </span>{transmission}</li>}
                      </ul>
                    </td>
                    <td className="border border-black p-2 text-center align-middle text-black">{!isHidden('quantity') && (quantity < 10 ? `0${quantity}` : quantity)}</td>
                    <td className="border border-black p-2 text-right text-[18px] font-bold align-middle text-black">{formattedPrice}/-</td>
                  </tr>
                  <tr className="net-price-row font-bold text-black">
                    <td colSpan={2} className="border border-black p-2 text-left uppercase text-[15px] text-black">NET PRICE IN TAKA</td>
                    <td className="border border-black p-2 text-right text-[16px] text-black">{formattedPrice}/-</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="price-words-row mb-[15px] text-[15px] text-black"><span className="font-bold text-black">Price in words :</span> {priceInWords}</div>
            {notes && (<div className="accessories-box mt-[10px] mb-[15px] leading-[1.4] text-justify text-[14px] text-black"><span className="font-bold text-black">Fitting Accessories:</span> {notes}</div>)}
            <div className="mt-[10px] text-[15px] leading-[1.4] text-black"><p className="text-black">Price excluding REGISTRATION cost.<br /><span className="font-bold uppercase text-black">Yours Faithfully,</span></p></div>
          </div>
          <div className="footer-container absolute bottom-[10mm] left-[20mm] right-[20mm] text-center border-t border-red-500 pt-[8px] text-[12px] text-black">
            <div className="text-black">📍 A.Hamid Road, Pabna &nbsp; ✉️ garirdokan2021@gmail.com &nbsp; 📞 +880 1713 110 570</div>
            <div className="web-url text-[15px] mt-[5px] tracking-[1.5px] font-sans text-black uppercase text-center font-bold">
              w w w . <span className="text-red-600">g</span> a r i r <span className="text-red-600">d</span> o k a n . c o m
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Invoice Render (Default Standard / CAR SALE INVOICE)
  const totalPaidAmount = (payments || []).reduce((sum, p) => sum + (p.amount || 0), 0);
  const balanceAmount = (vehiclePrice || 0) - totalPaidAmount;

  return (
    <div className="bg-gray-100 p-4 overflow-auto flex justify-center w-full">
      <div 
        ref={containerRef} 
        className="a4-page shadow-2xl relative bg-white !text-black" 
        style={{ 
          fontFamily: '"Segoe UI", Arial, sans-serif',
          width: '210mm',
          minHeight: '297mm',
          padding: '0', 
          transform: scale !== 1 ? `scale(${scale})` : 'none',
          transformOrigin: 'top center',
          marginBottom: scale !== 1 ? `-${297 * (1 - scale)}mm` : '10px',
          color: '#000000',
          position: 'relative',
          backgroundColor: 'white'
        }}
      >
        <div className="text-black">
          <div className="flex pt-[5mm] mb-[5px] w-full text-black">
            <div className="logo-container" style={{ width: `${logoSize}px`, marginLeft: `${logoPosition}px` }}>
              {logoUrl && <img src={logoUrl} alt="Logo" className="w-full block" />}
            </div>
          </div>
          <div className="grey-bar bg-[#d1d3d4] py-[4px] pl-[5mm] italic text-[14px] font-serif border-y border-gray-400 mb-[15px] w-full text-left text-black box-border">
            Importer & All kinds of Brand new & Reconditioned Vehicles Supplier
          </div>
          <div className="px-[15mm] pt-[5mm] text-black">
            <div className="border-b border-black mb-4 flex justify-between items-baseline text-black">
              <h1 className="m-0 text-[32px] font-bold text-black">INVOICE</h1>
              <div className="text-[11px] font-bold text-black uppercase">CUSTOMER COPY</div>
            </div>
            <div className="grid grid-cols-[1.2fr_0.8fr] gap-5 mb-8 text-[14px] text-black">
              <div className="space-y-1 text-black">
                {!isHidden('clientName') && <div className="flex text-black"><span className="font-bold min-w-[100px] text-black">Buyer's Name</span><span className="mr-1 text-black">:</span> <span className="uppercase text-black">{clientName}</span></div>}
                {!isHidden('clientPhone') && <div className="flex text-black"><span className="font-bold min-w-[100px] text-black">Phone</span><span className="mr-1 text-black">:</span> <span className="text-black">{clientPhone}</span></div>}
                {!isHidden('clientAddress') && <div className="flex text-black"><span className="font-bold min-w-[100px] text-black">Address</span><span className="mr-1 text-black">:</span> <span className="capitalize text-black">{clientAddress}</span></div>}
              </div>
              <div className="space-y-1 text-black">
                <div className="flex justify-end text-black"><span className="font-bold min-w-[100px] text-right mr-1 text-black">DATE:</span> <span className="text-black">{new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-')}</span></div>
                <div className="flex justify-end text-black"><span className="font-bold min-w-[100px] text-right mr-1 text-black">Invoice no.:</span> <span className="text-black">{docNumber}</span></div>
              </div>
            </div>
            <table className="w-full border-collapse text-black">
              <thead>
                <tr className="text-black">
                  <th className="border-y-[1.5px] border-black py-2.5 pl-[80px] pr-1.5 text-left text-[14px] font-bold w-[45%] text-black bg-white border-x-0 uppercase">DESCRIPTION</th>
                  <th className="border-y-[1.5px] border-black py-2.5 px-1.5 text-left text-[14px] font-bold w-[35%] text-black bg-white border-x-0 uppercase">PAYMENT DATE</th>
                  <th className="border-y-[1.5px] border-black py-2.5 px-1.5 text-right text-[14px] font-bold w-[20%] text-black bg-white border-x-0 uppercase">AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                <tr className="text-black">
                  <td className="w-[45%] align-top pt-4 pr-2 text-black">
                    {!isHidden('vehicleTitle') && <span className="font-bold uppercase mb-4 block leading-tight text-black" style={{ fontSize: `${vehicleTitleSize}px` }}>{vehicleTitle}</span>}
                    {productImageUrl && (
                      <div className="mb-4 rounded-xl overflow-hidden border border-gray-100 max-w-[200px] shadow-sm">
                        <img src={productImageUrl} alt="Product" className="w-full h-auto block" />
                      </div>
                    )}
                    <div className="space-y-1 text-[14px] text-black">
                      {!isHidden('model') && <div className="grid grid-cols-[80px_10px_1fr] text-black"><span className="text-black">Model</span><span className="text-black">:</span><span className="text-black">{model}</span></div>}
                      {!isHidden('color') && <div className="grid grid-cols-[80px_10px_1fr] text-black"><span className="text-black">Color</span><span className="text-black">:</span><span className="text-black">{color}</span></div>}
                      {!isHidden('cc') && <div className="grid grid-cols-[80px_10px_1fr] text-black"><span className="text-black">CC</span><span className="text-black">:</span><span className="text-black">{cc}</span></div>}
                      {!isHidden('chassisNumber') && <div className="grid grid-cols-[80px_10px_1fr] text-black"><span className="text-black">Chassis no</span><span className="text-black">:</span><span className="text-black">{chassisNumber}</span></div>}
                      {!isHidden('engineNumber') && <div className="grid grid-cols-[80px_10px_1fr] text-black"><span className="text-black">Engine no</span><span className="text-black">:</span><span className="text-black">{engineNumber}</span></div>}
                    </div>
                    <br />
                    {!isHidden('vehiclePrice') && (
                      <div className="text-black">
                        <strong className="text-[15px] text-black">Car price : {vehiclePrice.toLocaleString()}/-</strong>
                        <span className="block text-[13px] mt-0.5 font-normal text-black">(Excluding registration fee)</span>
                      </div>
                    )}
                  </td>
                  <td colSpan={2} className="p-0 align-top border-l border-gray-200 text-black">
                    {payments?.map((p, index) => (
                      <div key={p.id} className={`flex ${index === payments.length - 1 ? '' : 'border-b border-gray-200'} text-black`}>
                        <div className="w-[63.6%] py-3 px-2 text-[13px] text-black align-top">
                          {new Date(p.date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-')}
                        </div>
                        <div className="w-[36.4%] text-right py-3 px-2 text-black">
                          <span className="font-bold block text-[13px] text-black">{p.amount.toLocaleString()}/-</span>
                          <span className="text-[11px] text-[#555] italic block mt-0.5 uppercase">{p.note}</span>
                        </div>
                      </div>
                    ))}
                  </td>
                </tr>
              </tbody>
            </table>
            <div className="mt-0 border-t-[1.5px] border-black pt-2.5 text-black">
              <div className="flex justify-end mb-1 text-[15px] text-black">
                <div className="w-[120px] text-right pr-5 font-bold text-black">Total Paid:</div>
                <div className="w-[140px] text-right border-b border-[#ddd] font-bold text-black">{totalPaidAmount.toLocaleString()}/-</div>
              </div>
              <div className="flex justify-end font-bold text-[15px] text-black">
                <div className="w-[120px] text-right pr-5 text-black">Balance:</div>
                <div className="w-[140px] text-right border-b border-[#ddd] text-black">{balanceAmount.toLocaleString()}/-</div>
              </div>
            </div>
          </div>
          <div className="absolute bottom-[10mm] left-[15mm] right-[15mm] border-t border-red-500 pt-2.5 text-center text-black">
            <div className="flex justify-center items-center gap-4 text-[12px] mb-2 text-black">
              <span className="text-black">📍 A.Hamid Road, Pabna</span>
              <span className="text-black">✉️ garirdokan2021@gmail.com</span>
              <span className="text-black">📞 +880 1713 110 570</span>
            </div>
            <div className="text-[15px] mt-[5px] tracking-[1.5px] font-sans text-black uppercase text-center font-bold">
              w w w . <span className="text-red-700">g</span> a r i r <span className="text-red-700">d</span> o k a n . c o m
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentPreview;