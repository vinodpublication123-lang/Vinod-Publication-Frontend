"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Box, Plus, Trash2, X, Save, ArrowLeft, Upload, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { SelectDropdown } from "@/components/ui/SelectDropdown";
import { DashboardCard } from "@/components/admin/DashboardCard";
import { VariantBuilder, ProductVariant } from "@/components/admin/VariantBuilder";
import { useRouter } from "next/navigation";
import { productsApi, authorsApi, ApiAuthor } from "@/lib/services";

export default function AddProductPage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("product"); // Start on Product Details
  
  // Dropdown States
  const [category, setCategory] = useState("books"); // Default to books
  const [status, setStatus] = useState("active");
  const [tax, setTax] = useState("18");
  const [outOfStock, setOutOfStock] = useState("stop");
  const [trackStock, setTrackStock] = useState(true);

  // Product Basic Details State
  const [productName, setProductName] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [sku, setSku] = useState("");
  
  // Pricing State
  const [price, setPrice] = useState(""); // Regular Price
  const [salePrice, setSalePrice] = useState(""); // Sale Price
  
  // Inventory State
  const [stock, setStock] = useState("");
  const [lowStock, setLowStock] = useState("10");

  // Book & Author Specific State
  const [authorName, setAuthorName] = useState("");
  const [authorShortBio, setAuthorShortBio] = useState("");
  const [authorFullBio, setAuthorFullBio] = useState("");
  const [authorStatus, setAuthorStatus] = useState("active");

  // Existing author selector
  const [existingAuthors, setExistingAuthors] = useState<ApiAuthor[]>([]);
  const [selectedExistingAuthorId, setSelectedExistingAuthorId] = useState<string>("");

  useEffect(() => {
    authorsApi.list({ limit: 100 })
      .then((res) => setExistingAuthors(res.items))
      .catch(() => {});
  }, []);

  const bookGenre_state = useState("");
  const [bookGenre, setBookGenre] = bookGenre_state;
  const [bookPublicationDate, setBookPublicationDate] = useState("");
  
  const [enableQR, setEnableQR] = useState(false);
  const [qrSongTitle, setQrSongTitle] = useState("");
  const [qrSongUrl, setQrSongUrl] = useState("");

  // Variants State
  const [variants, setVariants] = useState<ProductVariant[]>([]);

  // Image state
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [authorAvatarUrl, setAuthorAvatarUrl] = useState("");

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

  const handleSave = async () => {
    setIsSaving(true);
    
    // Validation
    if (!productName || !price) {
      toast.error("Please provide a product name and price");
      setIsSaving(false);
      return;
    }

    if (category === "books" && !authorName && !selectedExistingAuthorId) {
      toast.error("Please provide an author — either select an existing one or enter a new name");
      setIsSaving(false);
      return;
    }

    const parsedPrice = parseFloat(price) || 0;
    const parsedSalePrice = salePrice && parseFloat(salePrice) > 0 ? parseFloat(salePrice) : null;

    let outOfStockBehavior = "SHOW_AS_OUT_OF_STOCK";
    if (outOfStock === "continue") outOfStockBehavior = "ALLOW_BACKORDERS";

    const payload = {
      name: productName,
      category: category === "books" ? "BOOK" : category === "apparel" ? "APPAREL" : "MERCHANDISE",
      sku: sku || undefined,
      brand: "VINVERSE",
      status: status.toUpperCase(),
      price: parsedPrice,
      salePrice: parsedSalePrice,
      tax: parseFloat(tax) || 0,
      shortDescription: shortDescription || undefined,
      fullDescription: description || undefined,
      trackStock: trackStock,
      globalStock: parseInt(stock) || 0,
      lowStockThreshold: trackStock ? parseInt(lowStock) || 0 : 0,
      outOfStockBehavior: outOfStockBehavior,
      primaryImage: galleryImages[0] || coverImageUrl || undefined,
      galleryImages: galleryImages,
      sizes: [], // Handled by variants now
      variants: category === "apparel" ? variants : undefined,
      ...(category === "books" ? {
        book: {
          title: productName,
          genre: bookGenre || undefined,
          publicationDate: bookPublicationDate || undefined,
          shortDescription: shortDescription || undefined,
          fullDescription: description || undefined,
          coverUrl: coverImageUrl || undefined,
          qrEnabled: enableQR,
          qrSongTitle: enableQR ? qrSongTitle : undefined,
          qrSongUrl: enableQR ? qrSongUrl : undefined,
          // If existing author selected, pass authorId; otherwise pass inline author object
          ...(selectedExistingAuthorId
            ? { authorId: selectedExistingAuthorId }
            : {
                author: {
                  name: authorName,
                  shortBio: authorShortBio || undefined,
                  fullBio: authorFullBio || undefined,
                  avatarUrl: authorAvatarUrl || undefined,
                }
              }
          ),
        }
      } : {})
    };

    try {
      await productsApi.create(payload as Record<string, unknown>);
      toast.success("Product saved successfully!");
      router.push("/admin/products");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save product");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/products" className="p-2 rounded-full hover:bg-white/5 text-white/50 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h2 className="text-2xl font-serif text-[var(--ivory)]">Add New Product</h2>
            <p className="text-sm text-white/50">Create a new product, which automatically creates the associated book and author entries.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link href="/admin/products" className="flex-1 sm:flex-none px-4 py-2 border border-white/10 text-white/70 rounded-md text-sm font-medium hover:bg-white/5 transition-colors text-center">
            Cancel
          </Link>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-[var(--gold)] text-[#080e1a] rounded-md text-sm font-bold hover:bg-[var(--gold-light)] transition-colors shadow-lg disabled:opacity-70 disabled:cursor-wait"
          >
            {isSaving ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <Save size={16} />} 
            {isSaving ? "Saving..." : "Save Product"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-2">
          {[
            { id: "product", label: "Product Details" },
            ...(category === "books" ? [
              { id: "author", label: "Author Details" },
              { id: "book", label: "Book Details" }
            ] : []),
            { id: "pricing", label: "Pricing" },
            ...(category === "apparel" ? [] : [
              { id: "inventory", label: "Inventory" }
            ]),
            ...(category === "apparel" ? [
              { id: "sizes", label: "Variants" }
            ] : [])
          ].map((tab) => {
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-[var(--gold)]/10 text-[var(--gold)] border border-[var(--gold)]/20 shadow-[0_4px_20px_rgba(212,175,55,0.05)]"
                    : "text-white/70 hover:bg-white/5 hover:text-white border border-transparent"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Product Details */}
          <div className={activeTab === "product" ? "block" : "hidden"}>
            <DashboardCard title="Product Information">
              <div className="p-6 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Product Name *</label>
                  <input 
                    type="text" 
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="e.g. The Cosmic Journey" 
                    className="w-full bg-[#080e1a] border border-white/10 rounded-md px-4 py-2.5 text-white focus:outline-none focus:border-[var(--gold)]/50 transition-colors" 
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Short Description</label>
                  <textarea 
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                    placeholder="Brief summary of the product..." 
                    rows={2} 
                    className="w-full bg-[#080e1a] border border-white/10 rounded-md px-4 py-2.5 text-white focus:outline-none focus:border-[var(--gold)]/50 transition-colors resize-none" 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Full Description</label>
                  <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Detailed product description..." 
                    rows={6} 
                    className="w-full bg-[#080e1a] border border-white/10 rounded-md px-4 py-2.5 text-white focus:outline-none focus:border-[var(--gold)]/50 transition-colors resize-none" 
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-white/50 uppercase tracking-wider z-50">Category *</label>
                    <SelectDropdown
                      value={category}
                      onChange={setCategory}
                      placeholder="Select Category"
                      options={[
                        { value: "books", label: "Books", description: "Novels, poetry, and literature" },
                        { value: "apparel", label: "Apparel", description: "T-shirts, hoodies, caps" },
                        { value: "merchandise", label: "Merchandise", description: "Notebooks, cups, pens, and accessories" }
                      ]}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Product Status</label>
                    <SelectDropdown
                      value={status}
                      onChange={setStatus}
                      options={[
                        { value: "draft", label: "Draft (Hidden)", description: "Not visible to customers" },
                        { value: "active", label: "Active (Published)", description: "Visible on the store" },
                        { value: "archived", label: "Archived", description: "Hidden and cannot be purchased" }
                      ]}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">SKU (Stock Keeping Unit)</label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="e.g. BOOK-01"
                    className="w-full bg-[#080e1a] border border-white/10 rounded-md px-4 py-2.5 text-white focus:outline-none focus:border-[var(--gold)]/50 transition-colors font-mono text-sm"
                  />
                </div>
                
                {/* Images inline in Product Details */}
                <div className="pt-6 border-t border-white/5">
                  <h4 className="text-sm font-medium text-white mb-3">Product Images (Gallery)</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {galleryImages.map((img, idx) => (
                      <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-white/10 group">
                        <img src={img} alt="gallery" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setGalleryImages(galleryImages.filter((_, i) => i !== idx))}
                          className="absolute top-1 right-1 p-1 bg-black/70 rounded-full text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => pickImage((url) => setGalleryImages([...galleryImages, url]))}
                      className="aspect-square bg-white/5 border border-white/10 rounded-xl border-dashed hover:border-[var(--gold)]/50 hover:bg-white/10 transition-colors flex items-center justify-center cursor-pointer group"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Plus className="w-8 h-8 text-white/40 group-hover:text-[var(--gold)] transition-colors" />
                        <span className="text-xs text-white/40 group-hover:text-[var(--gold)]/80">Add Image</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </DashboardCard>
          </div>

          {/* Author Details */}
          <div className={activeTab === "author" && category === "books" ? "block" : "hidden"}>
            <DashboardCard title="Author Information">
              <div className="p-6 space-y-6">

                {/* Existing author selector */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Select Existing Author</label>
                  <p className="text-xs text-white/40">Pick an author you&apos;ve already added to link this book to them.</p>
                  <div className="relative">
                    <select
                      value={selectedExistingAuthorId}
                      onChange={(e) => {
                        setSelectedExistingAuthorId(e.target.value);
                        if (e.target.value) {
                          // Clear manual fields when existing author is chosen
                          setAuthorName("");
                          setAuthorShortBio("");
                          setAuthorAvatarUrl("");
                        }
                      }}
                      className="w-full bg-[#080e1a] border border-white/10 rounded-md px-4 py-2.5 text-white focus:outline-none focus:border-[var(--gold)]/50 transition-colors appearance-none pr-10"
                    >
                      <option value="">— Create a new author —</option>
                      {existingAuthors.map((a) => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
                  </div>
                </div>

                {/* If existing author selected, show a summary card */}
                {selectedExistingAuthorId ? (
                  <div className="flex items-center gap-4 p-4 bg-[var(--gold)]/5 border border-[var(--gold)]/20 rounded-xl">
                    {(() => {
                      const a = existingAuthors.find(x => x.id === selectedExistingAuthorId);
                      return a ? (
                        <>
                          {a.avatarUrl && (
                            <img src={a.avatarUrl} alt={a.name} className="w-12 h-12 rounded-full object-cover shrink-0" />
                          )}
                          <div>
                            <p className="text-sm font-semibold text-white">{a.name}</p>
                            <p className="text-xs text-white/50 mt-0.5 line-clamp-2">{a.shortBio || a.fullBio || "No bio added"}</p>
                          </div>
                          <button
                            onClick={() => setSelectedExistingAuthorId("")}
                            className="ml-auto text-white/30 hover:text-white transition-colors"
                            title="Clear selection"
                          >
                            <X size={16} />
                          </button>
                        </>
                      ) : null;
                    })()}
                  </div>
                ) : (
                  /* New author manual entry */
                  <>
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5" /></div>
                      <div className="relative flex justify-center">
                        <span className="bg-[#0d1525] px-3 text-xs text-white/30 uppercase tracking-wider">Or enter new author details</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Author Name *</label>
                      <input 
                        type="text" 
                        value={authorName}
                        onChange={(e) => setAuthorName(e.target.value)}
                        placeholder="e.g. Vinod Naraen" 
                        className="w-full bg-[#080e1a] border border-white/10 rounded-md px-4 py-2.5 text-white focus:outline-none focus:border-[var(--gold)]/50 transition-colors" 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Bio / Description</label>
                      <textarea 
                        value={authorShortBio}
                        onChange={(e) => setAuthorShortBio(e.target.value)}
                        placeholder="A brief introduction shown on the website below the author's photo..." 
                        rows={5} 
                        className="w-full bg-[#080e1a] border border-white/10 rounded-md px-4 py-2.5 text-white focus:outline-none focus:border-[var(--gold)]/50 transition-colors resize-none" 
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Status</label>
                      <select 
                        value={authorStatus}
                        onChange={(e) => setAuthorStatus(e.target.value)}
                        className="w-full bg-[#080e1a] border border-white/10 rounded-md px-4 py-2.5 text-white focus:outline-none focus:border-[var(--gold)]/50 transition-colors"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                    
                    <div className="pt-6 border-t border-white/5">
                      <h4 className="text-sm font-medium text-white mb-3">Author Photo</h4>
                      <button
                        type="button"
                        onClick={() => pickImage(setAuthorAvatarUrl)}
                        className="w-full border-2 border-dashed border-white/20 rounded-xl p-10 flex flex-col items-center justify-center text-center hover:border-[var(--gold)]/50 hover:bg-white/[0.02] transition-colors group"
                      >
                        {authorAvatarUrl ? (
                          <img src={authorAvatarUrl} alt="Author" className="w-24 h-24 rounded-full object-cover mb-3" />
                        ) : (
                          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:bg-[var(--gold)]/10 transition-colors">
                            <Upload size={28} className="text-white/40 group-hover:text-[var(--gold)] transition-colors" />
                          </div>
                        )}
                        <span className="text-base font-medium text-white mb-1">
                          {authorAvatarUrl ? "Click to change photo" : "Click to upload profile photo"}
                        </span>
                        <span className="text-sm text-white/40">Square image recommended (500x500px)</span>
                      </button>
                    </div>
                  </>
                )}

              </div>
            </DashboardCard>
          </div>

          {/* Book Details */}
          <div className={activeTab === "book" && category === "books" ? "block" : "hidden"}>
            <DashboardCard title="Book Specifics">
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Genre</label>
                    <input 
                      type="text" 
                      value={bookGenre}
                      onChange={(e) => setBookGenre(e.target.value)}
                      placeholder="e.g. Poetry, Sci-Fi" 
                      className="w-full bg-[#080e1a] border border-white/10 rounded-md px-4 py-2.5 text-white focus:outline-none focus:border-[var(--gold)]/50 transition-colors" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Publication Date</label>
                    <input 
                      type="date" 
                      value={bookPublicationDate}
                      onChange={(e) => setBookPublicationDate(e.target.value)}
                      className="w-full bg-[#080e1a] border border-white/10 rounded-md px-4 py-2.5 text-white focus:outline-none focus:border-[var(--gold)]/50 transition-colors" 
                    />
                  </div>
                </div>
                
                <div className="pt-6 border-t border-white/5">
                  <h4 className="text-sm font-medium text-white mb-3">Cover Image</h4>
                  <button
                    type="button"
                    onClick={() => pickImage(setCoverImageUrl)}
                    className="w-full border-2 border-dashed border-white/20 rounded-xl p-10 flex flex-col items-center justify-center text-center hover:border-[var(--gold)]/50 hover:bg-white/[0.02] transition-colors group"
                  >
                    {coverImageUrl ? (
                      <img src={coverImageUrl} alt="Cover" className="w-24 h-36 object-cover rounded-md mb-3" />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:bg-[var(--gold)]/10 transition-colors">
                        <Upload size={28} className="text-white/40 group-hover:text-[var(--gold)] transition-colors" />
                      </div>
                    )}
                    <span className="text-base font-medium text-white mb-1">
                      {coverImageUrl ? "Click to change cover" : "Click to upload book cover"}
                    </span>
                    <span className="text-sm text-white/40">Recommended ratio 2:3 (e.g. 1000x1500px)</span>
                  </button>
                </div>

                {/* QR Song Section embedded in Book Details */}
                <div className="pt-6 border-t border-white/5">
                  <h4 className="text-sm font-medium text-white mb-4">QR Song Management</h4>
                  <div className="flex items-center gap-3 p-4 bg-white/[0.02] border border-white/10 rounded-lg">
                    <input 
                      type="checkbox" 
                      id="enableQR" 
                      checked={enableQR}
                      onChange={(e) => setEnableQR(e.target.checked)}
                      className="rounded border-white/20 bg-black/20 text-[var(--gold)] focus:ring-[var(--gold)] w-5 h-5" 
                    />
                    <label htmlFor="enableQR" className="text-sm font-medium text-white cursor-pointer">Enable QR Song Feature for this book</label>
                  </div>

                  {enableQR && (
                    <div className="space-y-6 pt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Song Title</label>
                          <input 
                            type="text" 
                            value={qrSongTitle}
                            onChange={(e) => setQrSongTitle(e.target.value)}
                            placeholder="e.g. The Cosmic Theme" 
                            className="w-full bg-[#080e1a] border border-white/10 rounded-md px-4 py-2.5 text-white focus:outline-none focus:border-[var(--gold)]/50 transition-colors" 
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Audio / Music URL</label>
                          <input 
                            type="url" 
                            value={qrSongUrl}
                            onChange={(e) => setQrSongUrl(e.target.value)}
                            placeholder="https://soundcloud.com/... or Spotify link" 
                            className="w-full bg-[#080e1a] border border-white/10 rounded-md px-4 py-2.5 text-white focus:outline-none focus:border-[var(--gold)]/50 transition-colors" 
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-6 p-4 bg-white/[0.02] rounded-lg">
                        <div className="w-24 h-24 bg-white flex items-center justify-center rounded-lg p-2">
                          <div className="w-full h-full bg-[url('https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=example')] bg-cover opacity-20" />
                        </div>
                        <p className="text-sm text-white/50 max-w-xs">QR code will be automatically generated from the URL provided above once saved.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </DashboardCard>
          </div>

          {/* Pricing */}
          <div className={activeTab === "pricing" ? "block" : "hidden"}>
            <DashboardCard title="Pricing Details">
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Regular Price (₹) *</label>
                    <input 
                      type="number" 
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="0.00" 
                      className="w-full bg-[#080e1a] border border-white/10 rounded-md px-4 py-2.5 text-white focus:outline-none focus:border-[var(--gold)]/50 transition-colors font-mono" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Sale Price (₹)</label>
                    <input 
                      type="number" 
                      value={salePrice}
                      onChange={(e) => setSalePrice(e.target.value)}
                      placeholder="0.00" 
                      className="w-full bg-[#080e1a] border border-white/10 rounded-md px-4 py-2.5 text-white focus:outline-none focus:border-[var(--gold)]/50 transition-colors font-mono" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Tax Percentage</label>
                  <SelectDropdown
                    value={tax}
                    onChange={setTax}
                    options={[
                      { value: "0", label: "No Tax (0%)" },
                      { value: "5", label: "5% GST" },
                      { value: "12", label: "12% GST" },
                      { value: "18", label: "18% GST" },
                      { value: "28", label: "28% GST" }
                    ]}
                  />
                </div>
              </div>
            </DashboardCard>
          </div>

          {/* Inventory */}
          <div className={activeTab === "inventory" ? "block" : "hidden"}>
            <DashboardCard title="Inventory Management">
              <div className="p-6 space-y-6">
                
                <div className="flex items-center gap-3 p-4 bg-white/[0.02] border border-white/10 rounded-lg">
                  <input 
                    type="checkbox" 
                    id="trackStock" 
                    checked={trackStock}
                    onChange={(e) => setTrackStock(e.target.checked)}
                    className="rounded border-white/20 bg-black/20 text-[var(--gold)] focus:ring-[var(--gold)] w-5 h-5" 
                  />
                  <label htmlFor="trackStock" className="text-sm font-medium text-white cursor-pointer">Enable Stock Keeping</label>
                </div>

                {/* Current Stock — always visible for non-apparel */}
                {category !== "apparel" && (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Current Stock</label>
                    <input 
                      type="number" 
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      placeholder="0" 
                      className="w-full bg-[#080e1a] border border-white/10 rounded-md px-4 py-2.5 text-white focus:outline-none focus:border-[var(--gold)]/50 transition-colors font-mono" 
                    />
                  </div>
                )}

                {trackStock && (
                  <div className="space-y-6 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    {category === "apparel" ? (
                      <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400/80 text-sm">
                        Apparel products track stock individually per size. Please specify the stock and low stock thresholds for each size in the <b>Sizes</b> tab.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Low Stock Threshold</label>
                        <input 
                          type="number" 
                          value={lowStock}
                          onChange={(e) => setLowStock(e.target.value)}
                          placeholder="10" 
                          className="w-full bg-[#080e1a] border border-white/10 rounded-md px-4 py-2.5 text-white focus:outline-none focus:border-[var(--gold)]/50 transition-colors font-mono" 
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Out of Stock Behaviour</label>
                      <SelectDropdown
                        value={outOfStock}
                        onChange={setOutOfStock}
                        options={[
                          { value: "stop", label: "Stop Selling", description: "Show Out of Stock badge" },
                          { value: "continue", label: "Continue Selling", description: "Allow backorders" }
                        ]}
                      />
                    </div>
                  </div>
                )}

              </div>
            </DashboardCard>
          </div>

          {/* Sizes / Variants */}
          <div className={activeTab === "sizes" && category === "apparel" ? "block" : "hidden"}>
            <DashboardCard title="Product Variants">
              <div className="p-6 space-y-6">
                <VariantBuilder 
                  variants={variants} 
                  onChange={setVariants} 
                  trackStock={trackStock} 
                />
                {trackStock && (
                  <div className="space-y-2 pt-4 border-t border-white/5 mt-6">
                    <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Out of Stock Behaviour</label>
                    <SelectDropdown
                      value={outOfStock}
                      onChange={setOutOfStock}
                      options={[
                        { value: "stop", label: "Stop Selling", description: "Show Out of Stock badge" },
                        { value: "continue", label: "Continue Selling", description: "Allow backorders" }
                      ]}
                    />
                  </div>
                )}
              </div>
            </DashboardCard>
          </div>

        </div>
      </div>
    </div>
  );
}
