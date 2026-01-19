
import React, { useState, useRef, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI, Type, GenerateContentResponse } from '@google/genai';
import { 
  Camera, 
  Upload, 
  Car, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  ChevronLeft, 
  Trash2, 
  Info, 
  Search,
  Check,
  Zap,
  Tag,
  Phone,
  User,
  MapPin,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';

// --- Constants ---
const STEPS = [
  { id: 'upload', title: 'تحميل الصور', icon: Upload },
  { id: 'analyze', title: 'تحليل البيانات', icon: Zap },
  { id: 'review', title: 'مراجعة التفاصيل', icon: Car },
  { id: 'pricing', title: 'تقدير السعر', icon: Tag },
  { id: 'finalize', title: 'نشر الإعلان', icon: CheckCircle2 },
];

// --- Types ---
interface AnalysisResult {
  brand: { value: string; confidence: number };
  model: { value: string; confidence: number };
  yearRange: { value: string; confidence: number };
  bodyType: { value: string; confidence: number };
  color: { value: string; confidence: number };
  trim: { value: string; confidence: number };
  damage: { value: string; confidence: number; details: string };
  reasoning: string;
}

interface PriceEstimate {
  type: 'conservative' | 'market' | 'premium';
  price: number;
  confidence: number;
  basis: string;
}

interface CarData {
  images: string[];
  analysis: AnalysisResult | null;
  selectedBrand: string;
  selectedModel: string;
  selectedYear: string;
  selectedBody: string;
  selectedColor: string;
  selectedTrim: string;
  mileage: string;
  location: string;
  priceEstimates: PriceEstimate[];
  finalPrice: string;
  contactName: string;
  contactPhone: string;
}

const INITIAL_CAR_DATA: CarData = {
  images: [],
  analysis: null,
  selectedBrand: '',
  selectedModel: '',
  selectedYear: '',
  selectedBody: '',
  selectedColor: '',
  selectedTrim: '',
  mileage: '',
  location: 'Sofia, Bulgaria',
  priceEstimates: [],
  finalPrice: '',
  contactName: '',
  contactPhone: '',
};

// --- Components ---

const App = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [carData, setCarData] = useState<CarData>(INITIAL_CAR_DATA);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: string[] = [];
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setCarData(prev => ({
            ...prev,
            images: [...prev.images, ev.target!.result as string]
          }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setCarData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  // Fixed analyzeCar to use correct SDK patterns and address type errors
  const analyzeCar = async () => {
    if (carData.images.length === 0) {
      setError("يرجى تحميل صورة واحدة على الأقل.");
      return;
    }

    setLoading(true);
    setError(null);
    setCurrentStep(1); // Analysis step

    try {
      // Create instance right before call as per guidelines and use process.env.API_KEY directly
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      // Ensure base64Data is a string and handle split safely
      const base64Data = carData.images[0].split(',')[1] || '';
      
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { text: "Analyze this car image for a Bulgarian car marketplace listing. Provide details in JSON format. Fields: brand (e.g. BMW), model (e.g. 3 Series), yearRange (approximate, e.g. 2015-2018), bodyType (e.g. Sedan), color, trim (e.g. M-Sport), damage (describe visible issues), and reasoning (why you think so). Also include confidence (0-1) for each identification field." },
            { inlineData: { mimeType: 'image/jpeg', data: base64Data } }
          ]
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              brand: { type: Type.OBJECT, properties: { value: { type: Type.STRING }, confidence: { type: Type.NUMBER } } },
              model: { type: Type.OBJECT, properties: { value: { type: Type.STRING }, confidence: { type: Type.NUMBER } } },
              yearRange: { type: Type.OBJECT, properties: { value: { type: Type.STRING }, confidence: { type: Type.NUMBER } } },
              bodyType: { type: Type.OBJECT, properties: { value: { type: Type.STRING }, confidence: { type: Type.NUMBER } } },
              color: { type: Type.OBJECT, properties: { value: { type: Type.STRING }, confidence: { type: Type.NUMBER } } },
              trim: { type: Type.OBJECT, properties: { value: { type: Type.STRING }, confidence: { type: Type.NUMBER } } },
              damage: { type: Type.OBJECT, properties: { value: { type: Type.STRING }, confidence: { type: Type.NUMBER }, details: { type: Type.STRING } } },
              reasoning: { type: Type.STRING }
            },
            required: ["brand", "model", "yearRange", "bodyType", "color", "trim", "damage", "reasoning"]
          }
        }
      });

      const text = response.text;
      if (!text) throw new Error("فشل الحصول على نص من المحلل.");
      
      const result = JSON.parse(text) as AnalysisResult;
      setCarData(prev => ({
        ...prev,
        analysis: result,
        selectedBrand: result.brand.value,
        selectedModel: result.model.value,
        selectedYear: result.yearRange.value.split('-')[0].trim(),
        selectedBody: result.bodyType.value,
        selectedColor: result.color.value,
        selectedTrim: result.trim.value
      }));
      nextStep(); // Move to Review
    } catch (err: any) {
      console.error(err);
      setError("فشل تحليل الصور. يرجى المحاولة مرة أخرى أو الإدخال يدوياً.");
    } finally {
      setLoading(false);
    }
  };

  // Fixed calculatePrice to use correct SDK patterns and address type errors
  const calculatePrice = async () => {
    if (!carData.mileage) {
      setError("يرجى إدخال المسافة المقطوعة (الكيلومترات) لتقدير السعر.");
      return;
    }

    setLoading(true);
    try {
      // Create instance right before call as per guidelines and use process.env.API_KEY directly
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Based on the Bulgarian car market (Mobile.bg, Cars.bg data), estimate the price for:
      Brand: ${carData.selectedBrand}
      Model: ${carData.selectedModel}
      Year: ${carData.selectedYear}
      Mileage: ${carData.mileage} km
      Trim: ${carData.selectedTrim}
      Body: ${carData.selectedBody}
      Color: ${carData.selectedColor}
      Location: Sofia, Bulgaria
      Provide 3 tiers: conservative, market, and premium. Include confidence and basis for each. Return as JSON.`;

      const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING },
                price: { type: Type.NUMBER },
                confidence: { type: Type.NUMBER },
                basis: { type: Type.STRING }
              },
              required: ["type", "price", "confidence", "basis"]
            }
          }
        }
      });

      const text = response.text;
      if (!text) throw new Error("فشل الحصول على تقدير السعر.");
      
      const estimates = JSON.parse(text) as PriceEstimate[];
      setCarData(prev => ({
        ...prev,
        priceEstimates: estimates,
        finalPrice: estimates.find(e => e.type === 'market')?.price.toString() || ''
      }));
      nextStep();
    } catch (err) {
      console.error(err);
      setError("فشل تقدير السعر. يمكنك إدخال السعر يدوياً.");
      setCarData(prev => ({ ...prev, priceEstimates: [] }));
      nextStep();
    } finally {
      setLoading(false);
    }
  };

  const publishAd = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      nextStep();
    }, 2000);
  };

  return (
    <div className="min-h-screen pb-20 bg-gray-50 text-gray-900 overflow-x-hidden">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-lg text-white">
            <Car size={24} />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-blue-900">AutoAI</span>
        </div>
        <div className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full border">
          محرك بلغاريا الذكي
        </div>
      </header>

      {/* Progress Stepper */}
      <div className="max-w-4xl mx-auto mt-6 px-4">
        <div className="flex justify-between items-center relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -z-10 -translate-y-1/2"></div>
          {STEPS.map((step, idx) => (
            <div key={step.id} className="flex flex-col items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                idx <= currentStep ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-300 text-gray-400'
              }`}>
                {idx < currentStep ? <Check size={20} /> : <step.icon size={20} />}
              </div>
              <span className={`text-[10px] sm:text-xs text-center hidden sm:block ${idx <= currentStep ? 'text-blue-700 font-bold' : 'text-gray-400'}`}>
                {step.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      <main className="max-w-4xl mx-auto mt-8 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6 flex items-start gap-3 shadow-sm">
            <AlertCircle className="shrink-0 mt-0.5" size={18} />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Step 0: Upload */}
        {currentStep === 0 && (
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">أضف صور سيارتك</h2>
              <p className="text-gray-500">سيتعرف الذكاء الاصطناعي على كافة التفاصيل بدقة</p>
            </div>
            
            <div 
              className="border-2 border-dashed border-gray-300 rounded-3xl p-12 flex flex-col items-center justify-center gap-4 hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer group"
              onClick={() => document.getElementById('imageInput')?.click()}
            >
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                <Upload size={32} />
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-gray-700">اسحب الصور هنا أو انقر للاختيار</p>
                <p className="text-sm text-gray-400 mt-1">يفضل التقاط زوايا متعددة (أمامية، خلفية، جانبية)</p>
              </div>
              <input 
                id="imageInput"
                type="file" 
                multiple 
                accept="image/*" 
                className="hidden" 
                onChange={handleImageUpload} 
              />
            </div>

            {carData.images.length > 0 && (
              <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
                {carData.images.map((img, i) => (
                  <div key={i} className="relative aspect-square rounded-2xl overflow-hidden group border shadow-md">
                    <img src={img} className="w-full h-full object-cover" />
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeImage(i); }}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button 
              disabled={carData.images.length === 0 || loading}
              onClick={analyzeCar}
              className="w-full mt-10 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg disabled:bg-gray-400 disabled:shadow-none transition-all active:scale-[0.98]"
            >
              {loading ? "جارٍ بدء التحليل..." : "بدء التحليل الذكي"}
              {!loading && <ChevronRight size={20} />}
            </button>
          </div>
        )}

        {/* Step 1: Analyzing */}
        {currentStep === 1 && (
          <div className="bg-white rounded-3xl p-12 shadow-xl border border-gray-100 flex flex-col items-center justify-center text-center">
            <div className="relative mb-10">
              <div className="w-32 h-32 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center text-blue-600">
                <Zap size={40} className="animate-pulse" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">جارٍ فحص الصور...</h2>
            <p className="text-gray-500 max-w-xs mx-auto">نقوم حالياً بتحليل تفاصيل السيارة، المحرك، الفئة، والمواصفات المرئية.</p>
            
            <div className="mt-8 w-full max-w-sm">
              <div className="flex justify-between text-xs mb-1 font-medium text-gray-400">
                <span>التقدم</span>
                <span>85%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 w-[85%] animate-[pulse_2s_infinite]"></div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Review */}
        {currentStep === 2 && carData.analysis && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Info size={20} className="text-blue-600" />
                  مراجعة البيانات المستخرجة
                </h2>
                
                <div className="space-y-4">
                  {[
                    { label: 'الماركة', field: 'selectedBrand', options: ['BMW', 'Audi', 'Mercedes', 'Toyota', 'Volkswagen'], conf: carData.analysis.brand.confidence },
                    { label: 'الموديل', field: 'selectedModel', options: [carData.selectedModel, '3 Series', '5 Series', 'A4', 'C-Class'], conf: carData.analysis.model.confidence },
                    { label: 'السنة', field: 'selectedYear', options: ['2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017', '2016'], conf: carData.analysis.yearRange.confidence },
                    { label: 'فئة الجسم', field: 'selectedBody', options: ['Sedan', 'SUV', 'Hatchback', 'Coupe'], conf: carData.analysis.bodyType.confidence },
                    { label: 'اللون', field: 'selectedColor', options: ['Silver', 'Black', 'White', 'Blue', 'Red'], conf: carData.analysis.color.confidence },
                    { label: 'فئة التجهيز', field: 'selectedTrim', options: ['Standard', 'Luxury', 'M-Sport', 'AMG'], conf: carData.analysis.trim.confidence },
                  ].map((item) => (
                    <div key={item.field} className="group">
                      <label className="text-xs font-bold text-gray-500 mb-1 block mr-1">{item.label}</label>
                      <div className="relative">
                        <select 
                          value={(carData as any)[item.field]}
                          onChange={(e) => setCarData(prev => ({ ...prev, [item.field]: e.target.value }))}
                          className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none pr-10"
                        >
                          {item.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                          {item.conf > 0.85 ? (
                            <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <ShieldCheck size={10} /> موثوق
                            </span>
                          ) : (
                            <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Info size={10} /> تأكد
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-8 border-t">
                  <label className="text-sm font-bold text-gray-700 mb-3 block">المسافة المقطوعة (كلم)</label>
                  <input 
                    type="number" 
                    placeholder="مثال: 120,000"
                    value={carData.mileage}
                    onChange={(e) => setCarData(prev => ({ ...prev, mileage: e.target.value }))}
                    className="w-full bg-blue-50 border-2 border-blue-100 p-4 rounded-xl text-xl font-bold focus:border-blue-500 focus:bg-white outline-none transition-all"
                  />
                  <p className="text-xs text-gray-400 mt-2">مطلوب لحساب القيمة السوقية العادلة في بلغاريا</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Search size={18} className="text-blue-600" />
                  تحليل الحالة المرئية
                </h3>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <span className="text-xs font-bold text-gray-400 block mb-1">الأعطال/التلفيات</span>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {carData.analysis.damage.details || "لم يتم اكتشاف تلفيات كبيرة في الهيكل الخارجي."}
                    </p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                    <span className="text-xs font-bold text-blue-400 block mb-1">سبب الاقتراح</span>
                    <p className="text-sm text-blue-900 italic">
                      "{carData.analysis.reasoning}"
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3">
                <AlertCircle size={20} className="text-amber-600 shrink-0" />
                <p className="text-xs text-amber-800 leading-relaxed">
                  تأكد من صحة الموديل والسنة، حيث سيتم استخدامهما في محرك التسعير البلغاري لمقارنة إعلانك بآلاف الإعلانات المشابهة.
                </p>
              </div>

              <button 
                disabled={loading}
                onClick={calculatePrice}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold shadow-lg transition-all flex items-center justify-center gap-2"
              >
                {loading ? "جارٍ الحساب..." : "الذهاب لتقدير السعر"}
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Pricing */}
        {currentStep === 3 && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-800 mb-2">تقدير السعر المقترح</h2>
              <p className="text-gray-500">تم تحليل سوق السيارات البلغاري لتقديم أفضل سعر لسيارتك</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {carData.priceEstimates.map((est) => (
                <div 
                  key={est.type}
                  className={`bg-white rounded-3xl p-6 border-2 transition-all cursor-pointer relative overflow-hidden ${
                    carData.finalPrice === est.price.toString() ? 'border-blue-600 ring-4 ring-blue-50' : 'border-gray-100 hover:border-blue-200'
                  }`}
                  onClick={() => setCarData(prev => ({ ...prev, finalPrice: est.price.toString() }))}
                >
                  {carData.finalPrice === est.price.toString() && (
                    <div className="absolute top-0 left-0 bg-blue-600 text-white px-3 py-1 rounded-br-2xl text-[10px] font-bold uppercase tracking-wider">
                      مختار
                    </div>
                  )}
                  <div className="flex flex-col h-full">
                    <span className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">
                      {est.type === 'conservative' ? 'سعر سريع' : est.type === 'market' ? 'سعر السوق' : 'سعر مميز'}
                    </span>
                    <div className="text-2xl font-black text-blue-900 mb-2">€{est.price.toLocaleString()}</div>
                    <p className="text-xs text-gray-500 mb-6 flex-grow">{est.basis}</p>
                    <div className="pt-4 border-t flex items-center justify-between">
                      <span className="text-[10px] text-gray-400 font-bold">نسبة الثقة</span>
                      <span className="text-[10px] font-black text-blue-600">{(est.confidence * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 max-w-2xl mx-auto">
              <label className="text-sm font-bold text-gray-700 mb-4 block text-center">أو أدخل سعرك الخاص</label>
              <div className="flex items-center gap-4">
                <div className="flex-grow relative">
                  <input 
                    type="number"
                    value={carData.finalPrice}
                    onChange={(e) => setCarData(prev => ({ ...prev, finalPrice: e.target.value }))}
                    className="w-full bg-gray-50 border border-gray-200 p-4 rounded-2xl text-2xl font-black text-center focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">€</div>
                </div>
              </div>
              
              <div className="mt-8 flex items-center gap-6 justify-center text-xs text-gray-400 font-medium">
                <div className="flex items-center gap-1.5">
                  <TrendingUp size={14} className="text-blue-500" />
                  <span>بناءً على 24 إعلان مشابه</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin size={14} className="text-blue-500" />
                  <span>السوق البلغاري (صوفيا)</span>
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <button 
                onClick={prevStep}
                className="px-8 py-4 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-2xl font-bold transition-all"
              >
                رجوع
              </button>
              <button 
                onClick={nextStep}
                className="px-12 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-lg transition-all flex items-center gap-2"
              >
                تأكيد السعر والمتابعة
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Finalize */}
        {currentStep === 4 && (
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
              <h2 className="text-2xl font-bold mb-6">معلومات الاتصال</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 mb-1 block mr-1">الاسم الكامل</label>
                  <div className="relative">
                    <User className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                    <input 
                      type="text"
                      placeholder="أدخل اسمك"
                      className="w-full bg-gray-50 border border-gray-200 p-4 pr-12 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      value={carData.contactName}
                      onChange={(e) => setCarData(prev => ({ ...prev, contactName: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 mb-1 block mr-1">رقم الهاتف</label>
                  <div className="relative">
                    <Phone className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                    <input 
                      type="tel"
                      placeholder="+359 XXX XXX XXX"
                      className="w-full bg-gray-50 border border-gray-200 p-4 pr-12 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      value={carData.contactPhone}
                      onChange={(e) => setCarData(prev => ({ ...prev, contactPhone: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <Car size={300} className="absolute -bottom-20 -left-20" />
              </div>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">ملخص الإعلان</h3>
              <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                <div>
                  <span className="text-blue-300 text-[10px] font-bold uppercase block">السيارة</span>
                  <p className="font-bold">{carData.selectedBrand} {carData.selectedModel} {carData.selectedYear}</p>
                </div>
                <div>
                  <span className="text-blue-300 text-[10px] font-bold uppercase block">السعر</span>
                  <p className="font-black text-xl">€{Number(carData.finalPrice).toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-blue-300 text-[10px] font-bold uppercase block">المسافة</span>
                  <p className="font-bold">{Number(carData.mileage).toLocaleString()} كلم</p>
                </div>
                <div>
                  <span className="text-blue-300 text-[10px] font-bold uppercase block">الموقع</span>
                  <p className="font-bold">{carData.location}</p>
                </div>
              </div>
            </div>

            <button 
              disabled={loading || !carData.contactPhone}
              onClick={publishAd}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-5 rounded-2xl font-black text-lg shadow-xl transition-all flex items-center justify-center gap-2 disabled:bg-gray-400"
            >
              {loading ? "جارٍ نشر إعلانك..." : "نشر الإعلان الآن"}
              {!loading && <CheckCircle2 size={24} />}
            </button>
          </div>
        )}

        {/* Success Screen */}
        {currentStep === 5 && (
          <div className="max-w-xl mx-auto bg-white rounded-3xl p-12 text-center shadow-2xl border border-gray-100 flex flex-col items-center">
            <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 animate-bounce">
              <Check size={48} />
            </div>
            <h2 className="text-3xl font-black text-gray-800 mb-4">تم النشر بنجاح!</h2>
            <p className="text-gray-500 mb-10 leading-relaxed">
              إعلانك الآن متاح لآلاف المشترين في بلغاريا. ستتلقى إشعارات عند وجود أي اهتمام بسيارتك.
            </p>
            <div className="space-y-4 w-full">
              <button className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg">مشاهدة الإعلان</button>
              <button 
                onClick={() => {
                  setCarData(INITIAL_CAR_DATA);
                  setCurrentStep(0);
                }}
                className="w-full bg-gray-100 text-gray-600 py-4 rounded-2xl font-bold"
              >
                إضافة إعلان آخر
              </button>
            </div>
          </div>
        )}

      </main>

      {/* Footer Branding */}
      <footer className="fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-md border-t py-2 px-4 flex justify-center items-center gap-4 z-40">
        <span className="text-[10px] text-gray-400 flex items-center gap-1">
          <ShieldCheck size={12} /> محمي بواسطة AutoAI Security
        </span>
        <div className="w-px h-3 bg-gray-200"></div>
        <span className="text-[10px] text-gray-400 font-bold">Bulgaria Market v4.2.0</span>
      </footer>
    </div>
  );
};

createRoot(document.getElementById('root')!).render(<App />);
