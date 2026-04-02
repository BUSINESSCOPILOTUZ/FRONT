import React, { useState } from "react";
import { motion } from "motion/react";
import {
  Send,
  Sparkles,
  Layout,
  Zap,
  Languages,
  Type,
  Image,
  Check,
  Download,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { aiApi } from "../../services/api";
import type {
  AdsPlatform,
  TgAdsLang,
  AdsResult,
  MetaTexts,
  MetaImage,
} from "../../types";

export default function AdsPage() {
  // ─── State ───────────────────────────────
  const [adsInput, setAdsInput] = useState("");
  const [adsPlatform, setAdsPlatform] = useState<AdsPlatform>("tg");
  const [adsResult, setAdsResult] = useState<AdsResult | null>(null);
  const [adsLoading, setAdsLoading] = useState(false);

  // TG
  const [tgAdsLang, setTgAdsLang] = useState<TgAdsLang>("uz");
  const [tgTextVariants, setTgTextVariants] = useState<string[]>([]);
  const [tgImageVariants, setTgImageVariants] = useState<(string | null)[]>([]);
  const [tgSelectedText, setTgSelectedText] = useState<number | null>(null);
  const [tgSelectedImage, setTgSelectedImage] = useState<number | null>(null);
  const [tgImagesLoading, setTgImagesLoading] = useState(false);

  // Meta
  const [metaImages, setMetaImages] = useState<MetaImage[]>([]);
  const [metaTexts, setMetaTexts] = useState<MetaTexts | null>(null);
  const [metaImagesLoading, setMetaImagesLoading] = useState(false);

  // ─── Handler ─────────────────────────────
  const handleGenerate = async () => {
    if (!adsInput.trim()) return;
    setAdsLoading(true);
    setTgTextVariants([]);
    setTgImageVariants([]);
    setTgSelectedText(null);
    setTgSelectedImage(null);
    setMetaImages([]);
    setMetaTexts(null);
    setTgImagesLoading(false);
    setMetaImagesLoading(false);

    try {
      const result = await aiApi.generateAds(
        adsInput,
        adsPlatform,
        adsPlatform === "tg" ? tgAdsLang : undefined,
      );
      setAdsResult(result);

      if (adsPlatform === "tg") {
        const langLabel = tgAdsLang === "uz" ? "O'zbek" : tgAdsLang === "en" ? "English" : "Русский";
        const textVars: string[] = result.textVariants || [
          result.creative?.substring(0, 160) || `${langLabel}: ${adsInput.substring(0, 120)}... 🔥`,
          ...(result.hooks || []).slice(0, 4).map((h: string) => h.substring(0, 160)),
        ];
        while (textVars.length < 5) textVars.push(`${langLabel} variant ${textVars.length + 1}: ${adsInput.substring(0, 100)}`);
        setTgTextVariants(textVars.slice(0, 5).map((t: string) => t.substring(0, 160)));

        setTgImagesLoading(true);
        setTgImageVariants([null, null, null]);
        setAdsLoading(false);

        try {
          const imgData = await aiApi.generateAdImages(adsInput, "tg", tgAdsLang);
          setTgImageVariants((imgData.images as string[]) || [null, null, null]);
        } catch {
          setTgImageVariants([
            "https://placehold.co/800x450/f97316/white?text=TG+Ad+1",
            "https://placehold.co/800x450/1e293b/white?text=TG+Ad+2",
            "https://placehold.co/800x450/3b82f6/white?text=TG+Ad+3",
          ]);
        } finally {
          setTgImagesLoading(false);
        }
      } else {
        setMetaTexts(result.metaTexts || {
          headline: result.hooks?.[0] || "Sarlavha matni",
          primary: result.creative || "Asosiy reklama matni",
          cta: result.ctas?.[0] || "Batafsil ma'lumot",
        });

        setMetaImagesLoading(true);
        setMetaImages([
          { url: null, ratio: "1:1", label: "Kvadrat (1:1)" },
          { url: null, ratio: "16:9", label: "Landshaft (16:9)" },
          { url: null, ratio: "9:16", label: "Story (9:16)" },
        ]);
        setAdsLoading(false);

        try {
          const imgData = await aiApi.generateAdImages(adsInput, "instagram");
          setMetaImages((imgData.images as MetaImage[]) || [
            { url: null, ratio: "1:1", label: "Kvadrat (1:1)" },
            { url: null, ratio: "16:9", label: "Landshaft (16:9)" },
            { url: null, ratio: "9:16", label: "Story (9:16)" },
          ]);
        } catch {
          setMetaImages([
            { url: "https://placehold.co/600x600/f97316/white?text=1:1", ratio: "1:1", label: "Kvadrat (1:1)" },
            { url: "https://placehold.co/800x450/1e293b/white?text=16:9", ratio: "16:9", label: "Landshaft (16:9)" },
            { url: "https://placehold.co/450x800/8b5cf6/white?text=9:16", ratio: "9:16", label: "Story (9:16)" },
          ]);
        } finally {
          setMetaImagesLoading(false);
        }
      }
    } catch (error) {
      console.error("Ads AI error:", error);
      setAdsLoading(false);
    }
  };

  // ─── Render ──────────────────────────────
  return (
    <motion.div
      key="ads"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8 pb-12"
    >
      {/* Header + Platform Toggle */}
      <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              Reklama Avtomatizatsiyasi (AI)
            </h3>
            <p className="text-slate-500 text-sm">TG Ads va Meta Ads uchun kreativlar yarating</p>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <a
              href="https://adsshop.org/channels"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2 bg-blue-50 text-blue-600 rounded-xl text-sm font-bold hover:bg-blue-100 transition-colors border border-blue-100"
            >
              <Send size={16} />
              Telegram Ads
            </a>
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setAdsPlatform("tg")}
                className={cn(
                  "px-6 py-2 rounded-lg text-sm font-bold transition-colors",
                  adsPlatform === "tg"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700",
                )}
              >
                TG Ads (AI)
              </button>
              <button
                onClick={() => setAdsPlatform("instagram")}
                className={cn(
                  "px-6 py-2 rounded-lg text-sm font-bold transition-colors",
                  adsPlatform === "instagram"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700",
                )}
              >
                Meta Ads (AI)
              </button>
            </div>
          </div>
        </div>

        {/* TG Ads: Language Selector */}
        {adsPlatform === "tg" && (
          <div className="flex items-center gap-3">
            <Languages size={16} className="text-slate-400" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Til:</span>
            <div className="flex bg-slate-100 p-1 rounded-lg">
              {([
                { key: "uz" as const, label: "O'zbek" },
                { key: "en" as const, label: "Inglizcha" },
                { key: "ru" as const, label: "Ruscha" },
              ]).map((lang) => (
                <button
                  key={lang.key}
                  onClick={() => setTgAdsLang(lang.key)}
                  className={cn(
                    "px-4 py-1.5 rounded-md text-xs font-bold transition-colors",
                    tgAdsLang === lang.key
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-700",
                  )}
                >
                  {lang.label}
                </button>
              ))}
            </div>
            {tgAdsLang === "uz" && (
              <span className="text-[10px] text-orange-500 font-semibold">Lotin yozuvida</span>
            )}
          </div>
        )}

        {/* Input + Generate */}
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
            Mahsulot yoki xizmat haqida qisqacha
          </label>
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <textarea
                value={adsInput}
                onChange={(e) => {
                  if (adsPlatform === "tg" && e.target.value.length > 160) return;
                  setAdsInput(e.target.value);
                }}
                maxLength={adsPlatform === "tg" ? 160 : undefined}
                placeholder={
                  adsPlatform === "tg"
                    ? "Masalan: Toshkentda yangi ochilgan milliy taomlar restorani uchun reklama... (max 160 belgi)"
                    : "Masalan: Toshkentda yangi ochilgan milliy taomlar restorani uchun reklama..."
                }
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 min-h-[100px] text-sm"
              />
              {adsPlatform === "tg" && (
                <div className="absolute bottom-3 right-3 flex items-center gap-1.5">
                  <span
                    className={cn(
                      "text-xs font-bold tabular-nums",
                      adsInput.length > 140
                        ? "text-red-500"
                        : adsInput.length > 100
                          ? "text-orange-500"
                          : "text-slate-400",
                    )}
                  >
                    {adsInput.length}
                  </span>
                  <span className="text-xs text-slate-300">/160</span>
                </div>
              )}
            </div>
            <button
              onClick={handleGenerate}
              disabled={adsLoading || !adsInput.trim()}
              className="px-8 bg-orange-500 text-white rounded-2xl font-black hover:bg-orange-600 transition-colors disabled:opacity-50 flex flex-col items-center justify-center gap-2"
            >
              {adsLoading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles size={24} />
                  <span className="text-sm">Yaratish</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* TG Results */}
      {adsPlatform === "tg" && tgTextVariants.length > 0 && (
        <TgAdsResults
          adsResult={adsResult}
          tgTextVariants={tgTextVariants}
          tgImageVariants={tgImageVariants}
          tgSelectedText={tgSelectedText}
          tgSelectedImage={tgSelectedImage}
          tgImagesLoading={tgImagesLoading}
          setTgSelectedText={setTgSelectedText}
          setTgSelectedImage={setTgSelectedImage}
        />
      )}

      {/* Meta Results */}
      {adsPlatform === "instagram" && metaTexts && (
        <MetaAdsResults
          adsResult={adsResult}
          metaTexts={metaTexts}
          metaImages={metaImages}
          metaImagesLoading={metaImagesLoading}
        />
      )}
    </motion.div>
  );
}

// ─── TG Ads Results ──────────────────────────
function TgAdsResults({
  adsResult,
  tgTextVariants,
  tgImageVariants,
  tgSelectedText,
  tgSelectedImage,
  tgImagesLoading,
  setTgSelectedText,
  setTgSelectedImage,
}: {
  adsResult: AdsResult | null;
  tgTextVariants: string[];
  tgImageVariants: (string | null)[];
  tgSelectedText: number | null;
  tgSelectedImage: number | null;
  tgImagesLoading: boolean;
  setTgSelectedText: (i: number) => void;
  setTgSelectedImage: (i: number) => void;
}) {
  return (
    <div className="space-y-6">
      {/* Creative summary */}
      {adsResult && <CreativeSummary result={adsResult} />}

      {/* Text Variants */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Type size={14} /> Matn variantlari — tanlang (1 ta)
          </h4>
          {tgSelectedText !== null && (
            <span className="text-xs font-bold text-green-600 flex items-center gap-1">
              <Check size={12} /> Variant {tgSelectedText + 1} tanlandi
            </span>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {tgTextVariants.map((text, i) => (
            <button
              key={i}
              onClick={() => setTgSelectedText(i)}
              className={cn(
                "p-4 rounded-xl border-2 text-left text-sm transition-all",
                tgSelectedText === i
                  ? "border-orange-500 bg-orange-50 ring-2 ring-orange-200"
                  : "border-slate-100 bg-slate-50 hover:border-slate-300",
              )}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-[10px] font-black text-slate-400 uppercase">
                  Variant {i + 1}
                </span>
                {tgSelectedText === i && (
                  <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center shrink-0">
                    <Check size={12} className="text-white" />
                  </div>
                )}
              </div>
              <p className="text-slate-700 leading-relaxed">{text}</p>
              <p className="text-[10px] text-slate-400 mt-2 tabular-nums">{text.length}/160 belgi</p>
            </button>
          ))}
        </div>
      </div>

      {/* Image Variants */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Image size={14} /> Rasm variantlari (16:9) — tanlang (1 ta)
            {tgImagesLoading && (
              <span className="ml-2 text-orange-500 font-semibold normal-case tracking-normal flex items-center gap-1">
                <div className="w-3 h-3 border-2 border-orange-300 border-t-orange-600 rounded-full animate-spin" />
                DALL-E yaratmoqda...
              </span>
            )}
          </h4>
          {tgSelectedImage !== null && (
            <span className="text-xs font-bold text-green-600 flex items-center gap-1">
              <Check size={12} /> Rasm {tgSelectedImage + 1} tanlandi
            </span>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tgImageVariants.map((url, i) => (
            <button
              key={i}
              onClick={() => url && setTgSelectedImage(i)}
              disabled={!url}
              className={cn(
                "rounded-xl border-2 overflow-hidden transition-all group relative",
                !url && "cursor-default",
                tgSelectedImage === i
                  ? "border-orange-500 ring-2 ring-orange-200"
                  : "border-slate-100 hover:border-slate-300",
              )}
            >
              <div className="aspect-video bg-slate-100 relative">
                {url ? (
                  <img src={url} alt={`TG reklama rasm ${i + 1}`} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                    <div className="w-8 h-8 border-3 border-slate-200 border-t-orange-500 rounded-full animate-spin" />
                    <span className="text-[10px] text-slate-400 font-medium">Yaratilmoqda...</span>
                  </div>
                )}
                {tgSelectedImage === i && url && (
                  <div className="absolute top-2 right-2 w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center shadow-lg">
                    <Check size={14} className="text-white" />
                  </div>
                )}
              </div>
              <div className="p-3 bg-white">
                <p className="text-xs font-bold text-slate-500">Rasm {i + 1}</p>
                <p className="text-[10px] text-slate-400">16:9 · 1792×1024 · DALL-E 3</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Selection Summary */}
      <div
        className={cn(
          "p-5 rounded-2xl border text-sm",
          tgSelectedText !== null && tgSelectedImage !== null
            ? "bg-green-50 border-green-200"
            : "bg-slate-50 border-slate-100",
        )}
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-white",
                tgSelectedText !== null ? "bg-green-500" : "bg-slate-300",
              )}
            >
              <Type size={14} />
            </div>
            <span className="text-slate-600 font-medium">
              {tgSelectedText !== null ? `Matn variant ${tgSelectedText + 1} tanlandi` : "Matn tanlanmagan"}
            </span>
            <div className="w-px h-6 bg-slate-200" />
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-white",
                tgSelectedImage !== null ? "bg-green-500" : "bg-slate-300",
              )}
            >
              <Image size={14} />
            </div>
            <span className="text-slate-600 font-medium">
              {tgSelectedImage !== null ? `Rasm variant ${tgSelectedImage + 1} tanlandi` : "Rasm tanlanmagan"}
            </span>
          </div>
          {tgSelectedText !== null && tgSelectedImage !== null && (
            <button className="px-6 py-2.5 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 transition-colors flex items-center gap-2">
              <Check size={16} />
              Tayyor — Davom etish
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Meta Ads Results ────────────────────────
function MetaAdsResults({
  adsResult,
  metaTexts,
  metaImages,
  metaImagesLoading,
}: {
  adsResult: AdsResult | null;
  metaTexts: MetaTexts;
  metaImages: MetaImage[];
  metaImagesLoading: boolean;
}) {
  return (
    <div className="space-y-6">
      {adsResult && <CreativeSummary result={adsResult} />}

      {/* Text Fields */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <Type size={14} /> Reklama matnlari
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 bg-orange-50 rounded-xl border border-orange-100 space-y-2">
            <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Sarlavha (Headline)</p>
            <p className="text-slate-900 font-bold text-lg leading-snug">{metaTexts.headline}</p>
          </div>
          <div className="p-5 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Asosiy matn (Primary)</p>
            <p className="text-slate-700 text-sm leading-relaxed">{metaTexts.primary}</p>
          </div>
          <div className="p-5 bg-blue-50 rounded-xl border border-blue-100 space-y-2">
            <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Harakatga chaqiriq (CTA)</p>
            <p className="text-slate-900 font-bold">{metaTexts.cta}</p>
          </div>
        </div>
      </div>

      {/* Images */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <Image size={14} /> Reklama rasmlari (3 format)
          {metaImagesLoading && (
            <span className="ml-2 text-orange-500 font-semibold normal-case tracking-normal flex items-center gap-1">
              <div className="w-3 h-3 border-2 border-orange-300 border-t-orange-600 rounded-full animate-spin" />
              DALL-E yaratmoqda...
            </span>
          )}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
          {metaImages.map((img, i) => {
            const sizeLabel =
              img.ratio === "1:1" ? "1024×1024" : img.ratio === "16:9" ? "1792×1024" : "1024×1792";
            return (
              <div key={i} className="rounded-xl border border-slate-100 overflow-hidden bg-slate-50">
                <div
                  className={cn(
                    "relative bg-slate-200",
                    img.ratio === "1:1" && "aspect-square",
                    img.ratio === "16:9" && "aspect-video",
                    img.ratio === "9:16" && "aspect-[9/16]",
                  )}
                >
                  {img.url ? (
                    <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                      <div className="w-8 h-8 border-3 border-slate-200 border-t-orange-500 rounded-full animate-spin" />
                      <span className="text-[10px] text-slate-400 font-medium">Yaratilmoqda...</span>
                    </div>
                  )}
                  <div className="absolute top-2 left-2 px-2 py-1 bg-white/90 backdrop-blur rounded-md">
                    <span className="text-[10px] font-bold text-slate-600">{img.ratio}</span>
                  </div>
                </div>
                <div className="p-3 bg-white flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-700">{img.label}</p>
                    <p className="text-[10px] text-slate-400">{sizeLabel} · DALL-E 3</p>
                  </div>
                  {img.url ? (
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                      <Check size={12} className="text-green-600" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 border-2 border-slate-200 border-t-slate-400 rounded-full animate-spin" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {!metaImagesLoading && metaImages.every((img) => img.url) && (
          <p className="text-xs text-slate-400 flex items-center gap-1.5">
            <Check size={12} className="text-green-500" />
            Barcha formatlar avtomatik tanlangan — tayyor eksport qilishga
          </p>
        )}
      </div>

      {/* Export Summary */}
      <div
        className={cn(
          "p-5 rounded-2xl border flex items-center justify-between flex-wrap gap-4",
          !metaImagesLoading && metaImages.every((img) => img.url)
            ? "bg-green-50 border-green-200"
            : "bg-slate-50 border-slate-100",
        )}
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center",
              !metaImagesLoading && metaImages.every((img) => img.url) ? "bg-green-500" : "bg-slate-300",
            )}
          >
            {metaImagesLoading ? (
              <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <Check size={18} className="text-white" />
            )}
          </div>
          <div>
            <p className="font-bold text-slate-900 text-sm">
              {metaImagesLoading ? "Rasmlar yaratilmoqda..." : "Meta Ads to'plami tayyor"}
            </p>
            <p className="text-xs text-slate-500">3 rasm formati + 3 matn turi — to'liq kreativ to'plam</p>
          </div>
        </div>
        <button
          disabled={metaImagesLoading || !metaImages.every((img) => img.url)}
          className="px-6 py-2.5 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download size={16} />
          Eksport qilish
        </button>
      </div>
    </div>
  );
}

// ─── Shared Creative Summary ─────────────────
function CreativeSummary({ result }: { result: AdsResult }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
          <Layout size={14} /> Kreativ G'oya
        </h4>
        <p className="text-slate-700 text-sm leading-relaxed">{result.creative}</p>
      </div>
      <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100">
        <h4 className="text-xs font-black text-orange-500 uppercase tracking-widest mb-3 flex items-center gap-2">
          <Zap size={14} /> Hook'lar
        </h4>
        <ul className="space-y-2">
          {result.hooks.map((hook: string, i: number) => (
            <li key={i} className="flex gap-2 text-slate-700 text-sm">
              <span className="text-orange-500 font-bold">{i + 1}.</span>
              {hook}
            </li>
          ))}
        </ul>
      </div>
      <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
        <h4 className="text-xs font-black text-blue-500 uppercase tracking-widest mb-3 flex items-center gap-2">
          <Send size={14} /> CTA
        </h4>
        <ul className="space-y-2">
          {result.ctas.map((cta: string, i: number) => (
            <li key={i} className="flex gap-2 text-slate-700 text-sm">
              <span className="text-blue-500 font-bold">{i + 1}.</span>
              {cta}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
