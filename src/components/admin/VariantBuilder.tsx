"use client";

import { useState } from "react";
import { Plus, Trash2, Upload, ChevronDown, ChevronUp, X, Check, Eye } from "lucide-react";
import { toast } from "sonner";
import { SelectDropdown } from "@/components/ui/SelectDropdown";

export interface VariantImage { url: string; displayOrder: number; isPrimary: boolean; }
export interface VariantSize { label: string; stock: number; lowStockThreshold: number; }
export interface ProductVariant { id?: string; colourName: string; colourHex?: string; images: VariantImage[]; sizes: VariantSize[]; displayOrder: number; }

interface VariantBuilderProps {
  variants: ProductVariant[];
  onChange: (variants: ProductVariant[]) => void;
  trackStock: boolean;
}

export function VariantBuilder({ variants, onChange, trackStock }: VariantBuilderProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  // Tracks raw typed strings for stock/lowAt fields so the user can backspace freely
  const [rawValues, setRawValues] = useState<Record<string, string>>({});

  const rawKey = (vIdx: number, sIdx: number, field: string) => `${vIdx}-${sIdx}-${field}`;

  const getRaw = (vIdx: number, sIdx: number, field: string, fallback: number): string => {
    const k = rawKey(vIdx, sIdx, field);
    return k in rawValues ? rawValues[k] : String(fallback);
  };

  const setRaw = (vIdx: number, sIdx: number, field: string, val: string) =>
    setRawValues(prev => ({ ...prev, [rawKey(vIdx, sIdx, field)]: val }));

  const clearRaw = (vIdx: number, sIdx: number, field: string) =>
    setRawValues(prev => { const next = { ...prev }; delete next[rawKey(vIdx, sIdx, field)]; return next; });

  const addVariant = () => {
    const newVariant: ProductVariant = {
      colourName: "New Colour",
      colourHex: "#ffffff",
      images: [],
      sizes: [],
      displayOrder: variants.length,
    };
    onChange([...variants, newVariant]);
    setExpandedIndex(variants.length);
  };

  const removeVariant = (index: number) => {
    const newVariants = [...variants];
    newVariants.splice(index, 1);
    onChange(newVariants);
    if (expandedIndex === index) setExpandedIndex(null);
  };

  const updateVariant = (index: number, field: keyof ProductVariant, value: any) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    onChange(newVariants);
  };

  const pickImage = (onPicked: (url: string) => void) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => onPicked(reader.result as string);
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const addSize = (variantIndex: number) => {
    const variant = variants[variantIndex];
    const used = new Set(variant.sizes.map(s => s.label));
    const next = ["SMALL", "MEDIUM", "LARGE", "XL", "XXL"].find(s => !used.has(s));
    
    if (!next) {
        toast.error("All sizes added for this variant.");
        return;
    }

    const newSizes = [...variant.sizes, { label: next, stock: 0, lowStockThreshold: 10 }];
    updateVariant(variantIndex, "sizes", newSizes);
  };

  const updateSize = (variantIndex: number, sizeIndex: number, field: keyof VariantSize, value: any) => {
    const variant = variants[variantIndex];
    const newSizes = [...variant.sizes];
    newSizes[sizeIndex] = { ...newSizes[sizeIndex], [field]: value };
    updateVariant(variantIndex, "sizes", newSizes);
  };

  const removeSize = (variantIndex: number, sizeIndex: number) => {
    const variant = variants[variantIndex];
    const newSizes = [...variant.sizes];
    newSizes.splice(sizeIndex, 1);
    updateVariant(variantIndex, "sizes", newSizes);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium text-white">Product Variants (Colours)</h4>
          <p className="text-xs text-white/50 mt-1">Manage colours, their images, and their sizes.</p>
        </div>
        <button 
          onClick={addVariant}
          className="flex items-center gap-2 px-3 py-1.5 bg-[var(--gold)] text-[#080e1a] rounded-md text-sm font-semibold hover:bg-[var(--gold-light)] transition-colors shadow-lg"
        >
          <Plus size={14} /> Add Colour
        </button>
      </div>

      {variants.length === 0 ? (
        <div className="border border-white/10 bg-white/[0.02] rounded-xl p-8 text-center border-dashed">
          <p className="text-sm text-white/40 mb-4 max-w-sm mx-auto">This product currently has no variants. Click &apos;Add Colour&apos; to create one.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {variants.map((variant, vIdx) => (
            <div key={vIdx} className="bg-white/[0.02] border border-white/10 rounded-xl overflow-hidden transition-all duration-300">
              {/* Accordion Header */}
              <div 
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors"
                onClick={() => setExpandedIndex(expandedIndex === vIdx ? null : vIdx)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center shrink-0" style={{ backgroundColor: variant.colourHex || 'transparent' }}>
                    {!variant.colourHex && <span className="text-[10px] text-white/50">?</span>}
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-white">{variant.colourName || "Unnamed Colour"}</h5>
                    <p className="text-xs text-white/40">{variant.sizes.length} sizes, {variant.images.length} images</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={(e) => { e.stopPropagation(); removeVariant(vIdx); }}
                    className="p-1.5 text-white/30 hover:text-red-400 hover:bg-white/10 rounded-md transition-colors"
                    title="Delete Variant"
                  >
                    <Trash2 size={16} />
                  </button>
                  {expandedIndex === vIdx ? <ChevronUp size={20} className="text-white/40" /> : <ChevronDown size={20} className="text-white/40" />}
                </div>
              </div>

              {/* Accordion Body */}
              {expandedIndex === vIdx && (
                <div className="p-4 border-t border-white/5 space-y-8 bg-black/20">
                  
                  {/* Basic Colour Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Colour Name *</label>
                      <input 
                        type="text" 
                        value={variant.colourName}
                        onChange={(e) => updateVariant(vIdx, "colourName", e.target.value)}
                        placeholder="e.g. Midnight Black" 
                        className="w-full bg-[#080e1a] border border-white/10 rounded-md px-3 py-2 text-white focus:outline-none focus:border-[var(--gold)]/50 transition-colors" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Colour Hex Code</label>
                      <div className="flex items-center gap-2">
                        <input 
                          type="color"
                          value={variant.colourHex || "#ffffff"}
                          onChange={(e) => updateVariant(vIdx, "colourHex", e.target.value)}
                          className="w-10 h-10 rounded cursor-pointer bg-transparent border-0 p-0"
                        />
                        <input 
                          type="text" 
                          value={variant.colourHex || ""}
                          onChange={(e) => updateVariant(vIdx, "colourHex", e.target.value)}
                          placeholder="#000000" 
                          className="flex-1 bg-[#080e1a] border border-white/10 rounded-md px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-[var(--gold)]/50 transition-colors" 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Images */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Variant Images</label>
                      <span className="text-[10px] text-[var(--gold)]">Click star to set primary</span>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {variant.images.map((img, imgIdx) => (
                        <div key={imgIdx} className={`relative aspect-square rounded-xl overflow-hidden border ${img.isPrimary ? 'border-[var(--gold)]' : 'border-white/10'} group`}>
                          <img src={img.url} alt="Variant" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                const newImages = variant.images.map((img, i) => ({ ...img, isPrimary: i === imgIdx }));
                                updateVariant(vIdx, "images", newImages);
                              }}
                              className={`p-2 rounded-full ${img.isPrimary ? 'bg-[var(--gold)] text-black' : 'bg-white/20 text-white hover:bg-[var(--gold)] hover:text-black'} transition-colors`}
                              title="Set Primary"
                            >
                              <Check size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const newImages = [...variant.images];
                                newImages.splice(imgIdx, 1);
                                if (img.isPrimary && newImages.length > 0) newImages[0].isPrimary = true;
                                updateVariant(vIdx, "images", newImages);
                              }}
                              className="p-2 rounded-full bg-red-500/80 text-white hover:bg-red-500 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                          {img.isPrimary && <div className="absolute top-2 left-2 bg-[var(--gold)] text-black text-[10px] font-bold px-2 py-0.5 rounded">Primary</div>}
                        </div>
                      ))}
                      
                      <button
                        type="button"
                        onClick={() => pickImage((url) => {
                          const newImage = { url, displayOrder: variant.images.length, isPrimary: variant.images.length === 0 };
                          updateVariant(vIdx, "images", [...variant.images, newImage]);
                        })}
                        className="aspect-square bg-white/5 border border-white/10 rounded-xl border-dashed hover:border-[var(--gold)]/50 hover:bg-white/10 transition-colors flex items-center justify-center cursor-pointer group"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <Plus className="w-6 h-6 text-white/40 group-hover:text-[var(--gold)] transition-colors" />
                          <span className="text-xs text-white/40 group-hover:text-[var(--gold)]/80">Add Image</span>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Sizes */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Sizes & Inventory for {variant.colourName}</label>
                      <button 
                        onClick={() => addSize(vIdx)}
                        className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 border border-white/10 text-white rounded text-xs hover:bg-white/10 transition-colors"
                      >
                        <Plus size={12} /> Add Size
                      </button>
                    </div>

                    {variant.sizes.length === 0 ? (
                      <div className="text-xs text-white/40 p-4 border border-white/5 border-dashed rounded-lg text-center">No sizes added for this variant.</div>
                    ) : (
                      <div className="space-y-2">
                        <div className="grid grid-cols-12 gap-2 px-2 pb-1">
                          <div className={trackStock ? "col-span-4 text-[10px] text-white/40 uppercase" : "col-span-7 text-[10px] text-white/40 uppercase"}>Size</div>
                          <div className={trackStock ? "col-span-3 text-[10px] text-white/40 uppercase" : "col-span-4 text-[10px] text-white/40 uppercase"}>Stock</div>
                          {trackStock && <div className="col-span-4 text-[10px] text-white/40 uppercase">Low At</div>}
                        </div>
                        
                        {variant.sizes.map((size, sIdx) => (
                          <div key={sIdx} className="grid grid-cols-12 gap-2 items-center bg-white/[0.02] rounded border border-white/5 p-2">
                            <div className={trackStock ? "col-span-4" : "col-span-7"}>
                              <select
                                value={size.label}
                                onChange={(e) => updateSize(vIdx, sIdx, "label", e.target.value)}
                                className="w-full bg-[#080e1a] border border-white/10 rounded px-2 py-1.5 text-white text-xs focus:outline-none focus:border-[var(--gold)]/50"
                              >
                                <option value="SMALL">S</option>
                                <option value="MEDIUM">M</option>
                                <option value="LARGE">L</option>
                                <option value="XL">XL</option>
                                <option value="XXL">XXL</option>
                              </select>
                            </div>
                            <div className={trackStock ? "col-span-3" : "col-span-4"}>
                              <input 
                                type="text"
                                inputMode="numeric"
                                value={getRaw(vIdx, sIdx, "stock", size.stock)}
                                onChange={(e) => {
                                  const raw = e.target.value;
                                  // Allow empty or a valid integer string while typing
                                  if (raw === "" || /^\d+$/.test(raw)) {
                                    setRaw(vIdx, sIdx, "stock", raw);
                                    if (raw !== "") updateSize(vIdx, sIdx, "stock", parseInt(raw, 10));
                                  }
                                }}
                                onBlur={() => {
                                  const raw = getRaw(vIdx, sIdx, "stock", size.stock);
                                  clearRaw(vIdx, sIdx, "stock");
                                  updateSize(vIdx, sIdx, "stock", raw === "" ? 0 : parseInt(raw, 10) || 0);
                                }}
                                onFocus={(e) => e.target.select()}
                                className="w-full bg-[#080e1a] border border-white/10 rounded px-2 py-1.5 text-white text-xs font-mono focus:outline-none focus:border-[var(--gold)]/50" 
                              />
                            </div>
                            {trackStock && (
                              <div className="col-span-4">
                                <input 
                                  type="text"
                                  inputMode="numeric"
                                  value={getRaw(vIdx, sIdx, "lowAt", size.lowStockThreshold)}
                                  onChange={(e) => {
                                    const raw = e.target.value;
                                    if (raw === "" || /^\d+$/.test(raw)) {
                                      setRaw(vIdx, sIdx, "lowAt", raw);
                                      if (raw !== "") updateSize(vIdx, sIdx, "lowStockThreshold", parseInt(raw, 10));
                                    }
                                  }}
                                  onBlur={() => {
                                    const raw = getRaw(vIdx, sIdx, "lowAt", size.lowStockThreshold);
                                    clearRaw(vIdx, sIdx, "lowAt");
                                    updateSize(vIdx, sIdx, "lowStockThreshold", raw === "" ? 0 : parseInt(raw, 10) || 0);
                                  }}
                                  onFocus={(e) => e.target.select()}
                                  className="w-full bg-[#080e1a] border border-white/10 rounded px-2 py-1.5 text-white text-xs font-mono focus:outline-none focus:border-[var(--gold)]/50" 
                                />
                              </div>
                            )}
                            <div className="col-span-1 flex justify-end">
                              <button 
                                onClick={() => removeSize(vIdx, sIdx)}
                                className="p-1 text-white/30 hover:text-red-400 hover:bg-white/5 rounded transition-colors"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
