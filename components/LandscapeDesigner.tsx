

import React, { useState, useRef, ChangeEvent, useEffect } from 'react';
import { GoogleGenAI, Modality, Part } from "@google/genai";

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === 'string') {
                resolve(reader.result.split(',')[1]);
            } else {
                reject(new Error("Failed to read file as base64."));
            }
        };
        reader.onerror = () => reject(new Error("Failed to read file."));
        reader.readAsDataURL(file);
    });
};

// Icons
const UploadIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>);
const SendIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" /></svg>);
const LoadingSpinner: React.FC = () => (<div className="w-5 h-5 border-2 border-dashed rounded-full animate-spin border-white"></div>);
const DownloadIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>);
const PenIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>);
const EyeIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>);

type InputMode = 'dimensions' | 'draw';

const LandscapeDesigner: React.FC = () => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [lastGeneratedBase64, setLastGeneratedBase64] = useState<string | null>(null);
    const [lastGeneratedMimeType, setLastGeneratedMimeType] = useState<string | null>(null);
    const [topDownViewImage, setTopDownViewImage] = useState<string | null>(null);
    
    // Input state
    const [inputMode, setInputMode] = useState<InputMode>('dimensions');
    const [length, setLength] = useState('');
    const [width, setWidth] = useState('');
    const [description, setDescription] = useState('');
    const [followUpPrompt, setFollowUpPrompt] = useState('');
    const [isPenEditMode, setIsPenEditMode] = useState(false);

    // Loading and error state
    const [isLoading, setIsLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isGeneratingTopDown, setIsGeneratingTopDown] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Refs
    const fileInputRef = useRef<HTMLInputElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const editCanvasRef = useRef<HTMLCanvasElement>(null);
    const isDrawingRef = useRef(false);
    const isDrawingOnEditCanvasRef = useRef(false);
    const lastEditPositionRef = useRef<{ x: number, y: number } | null>(null);
    const aiRef = useRef<GoogleGenAI | null>(null);

    if (!aiRef.current && process.env.API_KEY) {
        aiRef.current = new GoogleGenAI({ apiKey: process.env.API_KEY });
    }

    const resetAllOutputs = () => {
        setGeneratedImage(null);
        setLastGeneratedBase64(null);
        setLastGeneratedMimeType(null);
        setTopDownViewImage(null);
        setDescription('');
        setFollowUpPrompt('');
        setIsPenEditMode(false);
    };

    const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            resetAllOutputs();
            const previewUrl = URL.createObjectURL(file);
            setImagePreview(previewUrl);
        }
    };

    const callGeminiApiForImage = async (parts: Part[]): Promise<{ base64: string, mimeType: string }> => {
        if (!aiRef.current) throw new Error("AI client not initialized.");
        
        const response = await aiRef.current.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });
        
        const imageResponsePart = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);
        if (imageResponsePart && imageResponsePart.inlineData) {
            return {
                base64: imageResponsePart.inlineData.data,
                mimeType: imageResponsePart.inlineData.mimeType || 'image/png'
            };
        } else {
            const textResponsePart = response.candidates?.[0]?.content?.parts?.find(part => part.text);
            if (textResponsePart && textResponsePart.text) {
                console.error("Image generation failed with text response:", textResponsePart.text);
                throw new Error(`فشل إنشاء الصورة: ${textResponsePart.text}`);
            }
            throw new Error("لم يتمكن الذكاء الاصطناعي من إنشاء صورة. قد يكون الطلب غير واضح. حاول مرة أخرى بوصف مختلف.");
        }
    };
    
    const handleGenerate = async () => {
        if (!imageFile || !description.trim()) {
            setError("يرجى رفع صورة وكتابة وصف للتصميم المطلوب.");
            return;
        }
        setIsLoading(true);
        setError(null);
        // Do not reset all outputs here, keep description and dimensions
        setGeneratedImage(null);
        setLastGeneratedBase64(null);
        setLastGeneratedMimeType(null);
        setTopDownViewImage(null);
        setFollowUpPrompt('');

        try {
            let base64Data: string;
            let prompt: string;
            let mimeType = imageFile.type;

            if (inputMode === 'draw' && canvasRef.current) {
                base64Data = canvasRef.current.toDataURL(mimeType).split(',')[1];
                prompt = `في الصورة المقدمة، تم تحديد منطقة برسم شبه شفاف. يرجى تطبيق تصميم المناظر الطبيعية التالي **فقط داخل هذه المنطقة المحددة**: "${description}". استبدل الرسم بالكامل بالتصميم المطلوب، مع دمجه بسلاسة مع بقية الصورة. حافظ على جميع العناصر خارج المنطقة المحددة دون تغيير.`;
            } else {
                base64Data = await fileToBase64(imageFile);
                prompt = `قم بتعديل هذه الصورة لتصميم منظر طبيعي.`;
                if (length && width) {
                    prompt += ` أبعاد قطعة الأرض هي ${length} متر طول و ${width} متر عرض.`
                }
                prompt += ` تفاصيل التصميم المطلوب هي كالتالي: ${description}.`;
                prompt += ` حافظ على المباني أو العناصر الموجودة في الأرض دون تغيير، وقم فقط بإضافة العناصر المطلوبة في المساحات الفارغة بشكل واقعي واحترافي.`;
            }
            
            const imagePart: Part = { inlineData: { data: base64Data, mimeType } };
            const textPart: Part = { text: prompt };
            
            const result = await callGeminiApiForImage([imagePart, textPart]);
            setGeneratedImage(`data:${result.mimeType};base64,${result.base64}`);
            setLastGeneratedBase64(result.base64);
            setLastGeneratedMimeType(result.mimeType);

        } catch (err: any) {
            console.error("Image generation failed:", err);
            setError(err.message || "حدث خطأ غير متوقع أثناء إنشاء التصميم.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = async () => {
        if (!followUpPrompt.trim()) {
            setError("يرجى كتابة التعديل المطلوب.");
            return;
        }
        setIsEditing(true);
        setError(null);

        try {
            let editPrompt: string;
            let imagePart: Part;

            if (isPenEditMode && editCanvasRef.current) {
                const mimeType = 'image/png';
                const base64Data = editCanvasRef.current.toDataURL(mimeType).split(',')[1];
                editPrompt = `بالنسبة للمنطقة المحددة بالرسم الأحمر، قم بتطبيق هذا التعديل: "${followUpPrompt}". لا تغير أي شيء خارج المنطقة المحددة.`;
                imagePart = { inlineData: { data: base64Data, mimeType } };
            } else {
                if (!lastGeneratedBase64) throw new Error("لا توجد صورة سابقة لتعديلها.");
                const base64Data = lastGeneratedBase64;
                const mimeType = lastGeneratedMimeType || 'image/png';
                editPrompt = `طبق هذا التعديل على الصورة: "${followUpPrompt}". حافظ على بقية الصورة دون تغيير.`;
                imagePart = { inlineData: { data: base64Data, mimeType } };
            }

            const textPart: Part = { text: editPrompt };

            const result = await callGeminiApiForImage([imagePart, textPart]);
            setGeneratedImage(`data:${result.mimeType};base64,${result.base64}`);
            setLastGeneratedBase64(result.base64);
            setLastGeneratedMimeType(result.mimeType);
            setFollowUpPrompt('');
            setIsPenEditMode(false);
        } catch (err: any) {
            console.error("Image editing failed:", err);
            setError(err.message || "حدث خطأ أثناء إجراء التعديل.");
        } finally {
            setIsEditing(false);
        }
    };

    const handleGenerateTopDownView = async () => {
        if (!lastGeneratedBase64) {
            setError("يجب إنشاء تصميم أولاً.");
            return;
        }
        setIsGeneratingTopDown(true);
        setError(null);

        try {
            const prompt = "أعد رسم هذه الصورة من منظور علوي مباشر (منظور الطائر). يجب أن يظل التصميم والمحتوى كما هو، ولكن يتم عرضه من الأعلى.";
            const mimeType = lastGeneratedMimeType || 'image/png';
            const imagePart: Part = { inlineData: { data: lastGeneratedBase64, mimeType } };
            const textPart: Part = { text: prompt };
            
            const result = await callGeminiApiForImage([imagePart, textPart]);
            setTopDownViewImage(`data:${result.mimeType};base64,${result.base64}`);

        } catch (err: any) {
            console.error("Top-down view generation failed:", err);
            setError(err.message || "حدث خطأ أثناء إنشاء المنظور العلوي.");
        } finally {
            setIsGeneratingTopDown(false);
        }
    };
    
    const handleDownload = () => {
        if (!generatedImage) return;
        const link = document.createElement('a');
        link.href = generatedImage;
        link.download = 'landscape-design.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    // Canvas drawing logic for initial mode
    useEffect(() => {
        if (inputMode !== 'draw' || !canvasRef.current || !imagePreview) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const img = new Image();
        img.src = imagePreview;
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
        };
    }, [inputMode, imagePreview]);

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
        e.preventDefault();
        isDrawingRef.current = true;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        ctx.beginPath();
        ctx.moveTo((e.clientX - rect.left) * scaleX, (e.clientY - rect.top) * scaleY);
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawingRef.current) return;
        e.preventDefault();
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        ctx.lineTo((e.clientX - rect.left) * scaleX, (e.clientY - rect.top) * scaleY);
        ctx.strokeStyle = 'rgba(26, 115, 232, 0.7)';
        ctx.lineWidth = 20 * scaleX;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
    };

    const stopDrawing = () => {
        isDrawingRef.current = false;
        canvasRef.current?.getContext('2d')?.closePath();
    };
    
    const clearCanvas = () => {
         if (!canvasRef.current || !imagePreview) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const img = new Image();
        img.src = imagePreview;
        img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
        };
    };

    // Canvas drawing logic for pen edit mode
    useEffect(() => {
        if (!isPenEditMode || !editCanvasRef.current || !generatedImage) return;
        const canvas = editCanvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = generatedImage;
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
        };
    }, [isPenEditMode, generatedImage]);

    const startEditDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
        e.preventDefault();
        isDrawingOnEditCanvasRef.current = true;
        const canvas = editCanvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        lastEditPositionRef.current = {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY,
        };
    };

    const drawOnEdit = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawingOnEditCanvasRef.current || !lastEditPositionRef.current) return;
        e.preventDefault();
        const canvas = editCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const currentPos = {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY,
        };

        ctx.beginPath();
        ctx.moveTo(lastEditPositionRef.current.x, lastEditPositionRef.current.y);
        ctx.lineTo(currentPos.x, currentPos.y);
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.7)';
        ctx.lineWidth = 20 * scaleX;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
        
        lastEditPositionRef.current = currentPos;
    };

    const stopEditDrawing = () => {
        isDrawingOnEditCanvasRef.current = false;
        lastEditPositionRef.current = null;
    };


    return (
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex flex-col lg:flex-row gap-8">
            {/* Input Panel */}
            <div className="w-full lg:w-1/3 flex-shrink-0 space-y-6">
                <div className="p-6 rounded-2xl shadow-lg" style={{ backgroundColor: 'var(--bg-main)'}}>
                    <h2 className="text-xl font-bold mb-4">تفاصيل التصميم</h2>
                    
                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)'}}>1. ارفع صورة الأرض</label>
                        <div className="border-2 border-dashed rounded-lg p-2 text-center cursor-pointer hover:border-blue-500" style={{ borderColor: 'var(--border-color)'}} onClick={() => fileInputRef.current?.click()}>
                            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
                            {!imagePreview && <div className="p-4"><UploadIcon className="w-10 h-10 mx-auto" style={{ color: 'var(--text-secondary)'}} /><p className="mt-2 text-sm">انقر هنا لرفع صورة</p></div>}
                            {imagePreview && inputMode === 'dimensions' && <img src={imagePreview} alt="Preview" className="w-full max-h-48 rounded-md object-cover mx-auto" />}
                            {imagePreview && inputMode === 'draw' && (
                                <canvas ref={canvasRef} onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing} className="w-full h-auto cursor-crosshair rounded-md" />
                            )}
                        </div>
                         {imagePreview && inputMode === 'draw' && (
                            <button onClick={clearCanvas} className="text-sm mt-2 font-semibold" style={{ color: 'var(--accent-primary)'}}>مسح الرسم</button>
                         )}
                    </div>
                    
                    <div className="mt-4">
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)'}}>2. حدد منطقة التصميم</label>
                        <div className="flex gap-2 p-1 rounded-lg" style={{ backgroundColor: 'var(--bg-input)'}}>
                            <button onClick={() => setInputMode('dimensions')} className={`w-1/2 p-2 rounded-md text-sm font-semibold transition-colors ${inputMode === 'dimensions' ? 'bg-white dark:bg-gray-700 shadow' : ''}`}>الأبعاد</button>
                            <button onClick={() => setInputMode('draw')} className={`w-1/2 p-2 rounded-md text-sm font-semibold transition-colors ${inputMode === 'draw' ? 'bg-white dark:bg-gray-700 shadow' : ''}`}>الرسم على الصورة</button>
                        </div>
                    </div>

                    {inputMode === 'dimensions' ? (
                        <div className="mt-4">
                            <div className="flex gap-4">
                                <input type="text" placeholder="الطول (متر)" value={length} onChange={e => setLength(e.target.value)} className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 sm:text-sm text-right" style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', '--tw-ring-color': 'var(--accent-primary)' }} />
                                <input type="text" placeholder="العرض (متر)" value={width} onChange={e => setWidth(e.target.value)} className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 sm:text-sm text-right" style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', '--tw-ring-color': 'var(--accent-primary)' }} />
                            </div>
                        </div>
                    ) : (
                         <p className="text-xs text-center mt-2" style={{color: 'var(--text-secondary)'}}>ارسم على الصورة لتحديد المنطقة التي تريد تصميمها.</p>
                    )}

                    <div className="mt-4">
                         <label htmlFor="description" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)'}}>3. صف تصميمك المطلوب</label>
                         <textarea id="description" rows={5} value={description} onChange={e => setDescription(e.target.value)} className="block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 sm:text-sm text-right resize-y" style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', '--tw-ring-color': 'var(--accent-primary)' }} placeholder="مثال: أضف مسبحاً على اليسار، وأشجار نخيل..." />
                    </div>
                    
                    {error && <p className="text-sm text-red-500 text-center mt-4">{error}</p>}
                    
                    <div className="mt-6">
                        <button onClick={handleGenerate} disabled={!imageFile || !description || isLoading} className="w-full text-white font-bold py-3 px-6 rounded-lg transition-transform transform hover:scale-105 shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2" style={{ backgroundColor: 'var(--accent-primary)', '--tw-ring-color': 'var(--accent-primary)'}}>
                            {isLoading && <LoadingSpinner />}
                            {isLoading ? 'جارٍ الإنشاء...' : 'إنشاء التصميم الأولي'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Output Panel */}
            <div className="w-full lg:w-2/3 flex-1 flex flex-col p-6 rounded-2xl shadow-lg space-y-6" style={{ backgroundColor: 'var(--bg-main)'}}>
                 <div className="w-full flex-1 flex flex-col md:flex-row items-stretch justify-around gap-6">
                    <div className="text-center w-full md:w-1/2 flex flex-col">
                        <h3 className="text-lg font-semibold mb-2">{topDownViewImage ? 'منظور علوي' : 'الصورة الأصلية'}</h3>
                        {imagePreview && (
                            <div className="flex-1 flex items-center justify-center p-2 rounded-lg" style={{ backgroundColor: 'var(--bg-input)'}}>
                                <img src={topDownViewImage || imagePreview} alt="Reference" className="w-full h-auto rounded-lg shadow-md object-contain max-h-[45vh]" />
                            </div>
                        )}
                    </div>
                   
                   <div className="text-center w-full md:w-1/2 flex flex-col">
                         <div className="flex items-center justify-center gap-4 mb-2">
                            <h3 className="text-lg font-semibold">تصميم الذكاء الاصطناعي</h3>
                            {generatedImage && (
                                <div className="flex items-center gap-2">
                                    <button onClick={handleDownload} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10" style={{ color: 'var(--text-secondary)'}} aria-label="تنزيل الصورة"><DownloadIcon className="w-5 h-5"/></button>
                                    <button onClick={handleGenerateTopDownView} disabled={isGeneratingTopDown} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-50" style={{ color: 'var(--text-secondary)'}} aria-label="عرض منظور علوي">
                                        {isGeneratingTopDown ? <div className="w-5 h-5 border-2 border-dashed rounded-full animate-spin" style={{ borderColor: 'var(--accent-primary)'}}></div> : <EyeIcon className="w-5 h-5"/>}
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className="flex-1 flex items-center justify-center p-2 rounded-lg min-h-[200px]" style={{ backgroundColor: 'var(--bg-input)'}}>
                            {isLoading ? (<div className="flex flex-col items-center justify-center h-full"><div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin" style={{ borderColor: 'var(--accent-primary)'}}></div><p className="mt-4 font-semibold" style={{ color: 'var(--text-secondary)'}}>يقوم الذكاء الاصطناعي بالعمل...</p></div>) 
                            : generatedImage ? (
                                isPenEditMode ? (
                                    <canvas ref={editCanvasRef} onMouseDown={startEditDrawing} onMouseMove={drawOnEdit} onMouseUp={stopEditDrawing} onMouseLeave={stopEditDrawing} className="w-full h-auto rounded-lg shadow-md object-contain max-h-[45vh] cursor-crosshair" />
                                ) : (
                                    <img src={generatedImage} alt="Generated" className="w-full h-auto rounded-lg shadow-md object-contain max-h-[45vh]" />
                                )
                            )
                            : (<p style={{ color: 'var(--text-secondary)'}}>سيظهر تصميمك المعدل هنا.</p>)}
                        </div>
                   </div>
                </div>

                {generatedImage && (
                    <div className="pt-4 border-t" style={{ borderColor: 'var(--border-color)'}}>
                        <label className="block text-sm font-medium mb-2 text-center" style={{ color: 'var(--text-secondary)'}}>هل تريد تعديلاً آخر على التصميم الرئيسي؟</label>
                        <div className="flex items-center space-x-2 space-x-reverse rounded-full p-2" style={{ backgroundColor: 'var(--bg-input)'}}>
                            <button onClick={() => setIsPenEditMode(!isPenEditMode)} className={`p-2 rounded-full transition-colors ${isPenEditMode ? 'bg-blue-500/20 text-blue-600' : 'hover:bg-black/10 dark:hover:bg-white/10'}`} style={{ color: isPenEditMode ? 'var(--accent-primary)' : 'var(--text-secondary)'}} aria-label="تفعيل وضع التعديل بالقلم">
                                <PenIcon className="w-6 h-6" />
                            </button>
                            <input type="text" value={followUpPrompt} onChange={(e) => setFollowUpPrompt(e.target.value)} onKeyDown={(e) => { if(e.key === 'Enter' && !isEditing) handleEdit(); }} placeholder={isPenEditMode ? "حدد بالقلم ثم اكتب تعديلك هنا..." : "اكتب تعديلك هنا..."} className="flex-1 bg-transparent px-2 py-2 focus:outline-none text-right" style={{ color: 'var(--text-primary)' }} />
                            <button onClick={handleEdit} disabled={!followUpPrompt.trim() || isEditing} className="text-white rounded-full p-2.5 flex items-center justify-center w-10 h-10 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors" style={{ backgroundColor: 'var(--accent-primary)'}} aria-label="إرسال التعديل">
                                {isEditing ? <LoadingSpinner /> : <SendIcon className="w-5 h-5" />}
                            </button>
                          </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LandscapeDesigner;