
import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Image as ImageIcon, Wand2, Download, Upload, Loader2, Key, ExternalLink, PenTool, ArrowRight, Lightbulb } from 'lucide-react';
import { generateAiImage, editAiImage, getOmniStudioIdea } from '../../services/geminiService';
import Logo from '../ui/Logo';

const ImageStudio: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'generate' | 'edit' | 'logo'>('generate');
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [loading, setLoading] = useState(false);
  const [ideaLoading, setIdeaLoading] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState<boolean>(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const checkKey = async () => {
      if ((activeTab === 'generate' || activeTab === 'logo') && typeof window.aistudio !== 'undefined') {
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(selected);
      }
    };
    checkKey();
  }, [activeTab]);

  const handleSelectKey = async () => {
    if (typeof window.aistudio !== 'undefined') {
      await window.aistudio.openSelectKey();
      setHasApiKey(true);
    }
  };

  const handleAction = async () => {
    let finalPrompt = prompt;
    if (activeTab === 'logo') {
      finalPrompt = `Professional modern app icon for "${prompt || 'Omnihub'}". Minimalist, sleek design, geometric shapes, vibrant gradients, high-end tech aesthetic, soft shadows, 4k resolution, white background, centered icon.`;
    }

    if (!finalPrompt.trim()) return;
    setLoading(true);
    try {
      if (activeTab === 'generate' || activeTab === 'logo') {
        const img = await generateAiImage(finalPrompt, size);
        setResultImage(img);
      } else {
        if (!sourceImage) return;
        const img = await editAiImage(sourceImage, finalPrompt);
        setResultImage(img);
      }
    } catch (error: any) {
      setHasApiKey(false);
      await handleSelectKey();
    } finally {
      setLoading(false);
    }
  };

  const handleIdea = async () => {
    setIdeaLoading(true);
    try {
      const idea = await getOmniStudioIdea("Propon una idea creativa breve para una ilustración llamativa y moderna en español.");
      setPrompt(idea);
    } catch (error) {
      console.error("Error obteniendo idea:", error);
    } finally {
      setIdeaLoading(false);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSourceImage(reader.result as string);
        setResultImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-16">
      <header className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Logo size={48} variant="studio" />
            <h2 className="text-3xl font-black tracking-tighter uppercase dark:text-white text-slate-900">Omni-Studio</h2>
          </div>
          <p className="text-slate-800 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">IA Creativa de Próxima Generación</p>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex bg-slate-200 dark:bg-slate-900/80 p-1.5 rounded-[2rem] border border-slate-300 dark:border-white/5">
        <button 
          onClick={() => setActiveTab('generate')}
          className={`flex-1 flex flex-col items-center gap-1 py-4 rounded-[1.5rem] transition-all ${activeTab === 'generate' ? 'bg-white dark:bg-purple-600 text-purple-700 dark:text-white shadow-xl' : 'text-slate-600'}`}
        >
          <ImageIcon size={18} />
          <span className="text-[8px] font-black uppercase tracking-widest">Crear</span>
        </button>
        <button 
          onClick={() => setActiveTab('logo')}
          className={`flex-1 flex flex-col items-center gap-1 py-4 rounded-[1.5rem] transition-all ${activeTab === 'logo' ? 'bg-white dark:bg-purple-600 text-purple-700 dark:text-white shadow-xl' : 'text-slate-600'}`}
        >
          <PenTool size={18} />
          <span className="text-[8px] font-black uppercase tracking-widest">Logos</span>
        </button>
        <button 
          onClick={() => setActiveTab('edit')}
          className={`flex-1 flex flex-col items-center gap-1 py-4 rounded-[1.5rem] transition-all ${activeTab === 'edit' ? 'bg-white dark:bg-purple-600 text-purple-700 dark:text-white shadow-xl' : 'text-slate-600'}`}
        >
          <Wand2 size={18} />
          <span className="text-[8px] font-black uppercase tracking-widest">Editar</span>
        </button>
      </div>

      <div className="space-y-8">
        {/* Editor Area */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-[3rem] p-8 shadow-2xl relative overflow-hidden">
           {activeTab === 'edit' && (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square bg-slate-100 dark:bg-slate-950 border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-[2.5rem] flex flex-col items-center justify-center cursor-pointer mb-6 overflow-hidden"
              >
                {sourceImage ? (
                  <img src={sourceImage} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center">
                    <Upload size={32} className="text-slate-400 mx-auto mb-3" />
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Subir Imagen</p>
                  </div>
                )}
                <input type="file" ref={fileInputRef} onChange={onFileChange} className="hidden" accept="image/*" />
              </div>
           )}

           <div className="space-y-4">
           <label className="text-[10px] font-black uppercase text-slate-900 dark:text-slate-500 tracking-[0.2em] block">
              Tu Visión Creativa
            </label>
            <div className="flex justify-end mb-2">
              <button
                type="button"
                onClick={handleIdea}
                disabled={ideaLoading}
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-purple-600 dark:text-purple-300 disabled:opacity-40"
              >
                {ideaLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Lightbulb size={14} />}
                Inspiración Gemini
              </button>
            </div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe tu obra maestra aquí..."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/5 rounded-[2rem] p-6 text-base font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 resize-none h-40"
              />
           </div>

           <button 
              onClick={handleAction}
              disabled={loading || !prompt.trim()}
              className="w-full py-6 mt-8 bg-purple-600 hover:bg-purple-500 text-white rounded-[2rem] font-black text-lg shadow-xl shadow-purple-600/30 active:scale-95 transition-all flex items-center justify-center gap-4 uppercase tracking-tighter disabled:opacity-30"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Sparkles />}
              {loading ? 'Sintetizando...' : 'Generar Magia'}
            </button>
        </div>

        {/* Result Area */}
        {resultImage && (
          <div className="bg-slate-950 rounded-[3.5rem] p-4 shadow-2xl animate-in zoom-in duration-500">
             <div className="relative rounded-[3rem] overflow-hidden border border-white/10 aspect-square flex items-center justify-center bg-slate-900">
                <img src={resultImage} className="max-w-full h-full object-contain" />
                <button 
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = resultImage;
                    link.download = `omni-studio-${Date.now()}.png`;
                    link.click();
                  }}
                  className="absolute bottom-6 right-6 p-5 bg-white text-slate-900 rounded-3xl shadow-2xl active:scale-90 transition-all"
                >
                  <Download size={24} />
                </button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageStudio;
