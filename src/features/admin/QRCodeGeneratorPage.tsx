import { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { QrCode, Download, Printer, Coffee, Sparkles, Copy, Check } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { toast } from '@/components/ui/Toast';

export function QRCodeGeneratorPage() {
  const { language } = useLanguage();

  const [baseUrl, setBaseUrl] = useState(() => {
    return window.location.origin ? `${window.location.origin}/#/menu` : 'https://3plus2coffee.com/#/menu';
  });
  const [tableNumber, setTableNumber] = useState('');
  const [includeWifi, setIncludeWifi] = useState(false);
  const [wifiName, setWifiName] = useState('3+2 Coffee Guest');
  const [wifiPass, setWifiPass] = useState('SingleOrigin2026');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const printCardRef = useRef<HTMLDivElement>(null);

  // Compute final QR target URL (with optional ?table= parameter)
  const fullUrl = tableNumber.trim()
    ? `${baseUrl.trim()}?table=${encodeURIComponent(tableNumber.trim())}`
    : baseUrl.trim();

  // Generate QR Code data URL whenever fullUrl changes
  useEffect(() => {
    QRCode.toDataURL(fullUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: '#3C2A1E', // Brand espresso
        light: '#FFFFFF', // Clean white
      },
      errorCorrectionLevel: 'H',
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('QR generation failed:', err));
  }, [fullUrl]);

  const handleCopyUrl = () => {
    void navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    toast('success', 'Menu URL copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPNG = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.download = `3plus2-qr${tableNumber ? `-table-${tableNumber}` : ''}.png`;
    link.href = qrDataUrl;
    link.click();
    toast('success', 'QR Code image downloaded');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-brand-espresso flex items-center gap-2">
            <QrCode size={24} className="text-brand-olive" />
            <span>{language === 'ar' ? 'رمز QR لطاولات المقهى' : 'Table QR Code Generator'}</span>
          </h1>
          <p className="text-xs text-brand-olive-500 mt-1">
            {language === 'ar'
              ? 'توليد وطباعة بطاقات رمز QR مخصصة لكل طاولة تفتح القائمة الرقمية مباشرة'
              : 'Generate and print table stand cards linking customers directly to /menu'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={handleDownloadPNG} className="btn-secondary text-xs">
            <Download size={14} />
            <span>{language === 'ar' ? 'تحميل كصورة PNG' : 'Download PNG'}</span>
          </button>
          <button onClick={handlePrint} className="btn-primary text-xs">
            <Printer size={14} />
            <span>{language === 'ar' ? 'طباعة البطاقة' : 'Print Table Card'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Controls Column */}
        <div className="lg:col-span-6 card p-6 space-y-5">
          <h2 className="font-serif font-bold text-base text-brand-espresso">
            {language === 'ar' ? 'إعدادات الرابط والبطاقة' : 'URL & Table Settings'}
          </h2>

          <div>
            <label className="block text-xs font-semibold text-brand-espresso mb-1">
              {language === 'ar' ? 'رابط القائمة الرقمية' : 'Digital Menu Destination URL'}
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="https://menu.3plus2coffee.com/menu"
                className="input-field text-xs font-mono"
              />
              <button
                type="button"
                onClick={handleCopyUrl}
                className="px-3 py-2 border border-brand-cream-300 rounded-brand hover:bg-brand-cream-100 shrink-0"
                title="Copy URL"
              >
                {copied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} className="text-brand-olive" />}
              </button>
            </div>
            <p className="text-[11px] text-brand-olive-400 mt-1">
              {language === 'ar'
                ? 'يفتح هذا الرابط صفحة /menu مباشرة دون المرور بصفحة الترحيب'
                : 'Directly opens /menu, bypassing the welcome landing page'}
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-espresso mb-1">
              {language === 'ar' ? 'رقم الطاولة (اختياري)' : 'Table Number (Optional)'}
            </label>
            <input
              type="text"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              placeholder="e.g. 05 or Bar 1"
              className="input-field text-xs"
            />
          </div>

          <div className="pt-2 border-t border-brand-cream-200">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-brand-espresso">
              <input
                type="checkbox"
                checked={includeWifi}
                onChange={(e) => setIncludeWifi(e.target.checked)}
                className="rounded text-brand-olive"
              />
              <span>{language === 'ar' ? 'إضافة بيانات شبكة الـ Wi-Fi على البطاقة' : 'Include Guest Wi-Fi details on card'}</span>
            </label>

            {includeWifi && (
              <div className="mt-3 grid grid-cols-2 gap-3 pl-6">
                <div>
                  <label className="block text-[11px] text-brand-olive-500 mb-1">Network (SSID)</label>
                  <input
                    type="text"
                    value={wifiName}
                    onChange={(e) => setWifiName(e.target.value)}
                    className="input-field text-xs py-2"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-brand-olive-500 mb-1">Password</label>
                  <input
                    type="text"
                    value={wifiPass}
                    onChange={(e) => setWifiPass(e.target.value)}
                    className="input-field text-xs py-2 font-mono"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Live Table Card Preview Column */}
        <div className="lg:col-span-6 flex flex-col items-center">
          <div className="text-xs font-semibold text-brand-olive-400 mb-2 uppercase tracking-wider">
            {language === 'ar' ? 'معاينة بطاقة الطاولة المطبوعة' : 'Live Table Stand Preview'}
          </div>

          {/* Printable Card Stand Container */}
          <div
            ref={printCardRef}
            className="w-full max-w-sm bg-brand-cream rounded-2xl shadow-brand-lg border-2 border-brand-olive/20 p-8 text-center space-y-4 print:shadow-none print:border-none print:p-0"
          >
            {/* Header / Brand */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-brand-olive text-brand-cream flex items-center justify-center mb-2 shadow-brand-sm">
                <Coffee size={24} />
              </div>
              <h3 className="font-serif font-bold text-2xl text-brand-espresso leading-none">
                3+2
              </h3>
              <p className="text-[10px] uppercase tracking-widest text-brand-olive font-semibold mt-1">
                Specialty Coffee
              </p>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-brand-gold/20 text-brand-espresso text-[10px] font-medium mt-2">
                <Sparkles size={10} className="text-brand-gold" />
                <span>3 Sisters, 2 Brothers</span>
              </div>
            </div>

            {/* QR Code Container */}
            <div className="bg-white p-4 rounded-xl shadow-inner border border-brand-cream-300 inline-block mx-auto">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="3+2 Coffee Menu QR Code"
                  className="w-48 h-48 mx-auto"
                />
              ) : (
                <div className="w-48 h-48 bg-brand-cream-100 flex items-center justify-center text-xs text-brand-olive-400">
                  Generating QR...
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="space-y-1">
              <p className="font-serif font-semibold text-base text-brand-espresso">
                {language === 'ar' ? 'امسح الرمز لاستعراض القائمة' : 'Scan to Explore Our Menu'}
              </p>
              <p className="text-xs text-brand-olive-500">
                {language === 'ar'
                  ? 'اختر مشروبك المفضل المحضر طازجاً'
                  : 'Handcrafted drinks roasted & brewed to order'}
              </p>
            </div>

            {/* Table Number Badge */}
            {tableNumber.trim() && (
              <div className="inline-block px-4 py-1.5 rounded-full bg-brand-olive text-brand-cream text-xs font-bold uppercase tracking-wider">
                {language === 'ar' ? `طاولة: ${tableNumber}` : `Table ${tableNumber}`}
              </div>
            )}

            {/* Wi-Fi Info */}
            {includeWifi && (
              <div className="pt-3 border-t border-brand-cream-300/80 text-[11px] text-brand-olive-600 space-y-0.5">
                <p>
                  <span className="font-semibold">Wi-Fi:</span> {wifiName}
                </p>
                <p>
                  <span className="font-semibold">Password:</span> <span className="font-mono">{wifiPass}</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
