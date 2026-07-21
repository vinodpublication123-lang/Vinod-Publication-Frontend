"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Edit, User } from "lucide-react";
import { DashboardCard } from "@/components/admin/DashboardCard";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { authorsApi, ApiAuthor } from "@/lib/services";
import { toast } from "sonner";

export default function AuthorDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: authorId } = use(params);
  const [author, setAuthor] = useState<ApiAuthor | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    authorsApi.get(authorId)
      .then((data) => setAuthor(data))
      .catch((err) => {
        toast.error("Failed to load author details");
        console.error(err);
      })
      .finally(() => setIsLoading(false));
  }, [authorId]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20 text-white/50">
        <div className="w-8 h-8 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!author) {
    return <div className="text-white/50 py-20 text-center">Author not found</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/authors" className="p-2 rounded-full hover:bg-white/5 text-white/50 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-serif text-[var(--ivory)]">{author.name}</h2>
              <StatusBadge status={author.status === "ACTIVE" ? "Active" : "Inactive"} type={author.status === "ACTIVE" ? "success" : "neutral"} />
            </div>
            {author.createdAt && (
              <p className="text-sm text-white/50">
                Added {new Date(author.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            )}
          </div>
        </div>
        
        <Link href={`/admin/authors/${authorId}/edit`} className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-[var(--gold)]/10 text-[var(--gold)] border border-[var(--gold)]/30 rounded-md text-sm font-medium hover:bg-[var(--gold)]/20 transition-colors shrink-0">
          <Edit size={16} /> Edit Profile
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column */}
        <div className="space-y-6 lg:col-span-2">
          
          <DashboardCard title="Biography">
            <div className="p-6 space-y-6">
              <div>
                <div className="text-xs text-white/40 uppercase tracking-wider mb-2">Bio</div>
                <p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">
                  {author.shortBio || "No biography provided."}
                </p>
              </div>
            </div>
          </DashboardCard>

          <DashboardCard title={`Books Published (${author.books?.length || 0})`}>
            <div className="p-6">
              {!author.books || author.books.length === 0 ? (
                <div className="text-white/40 text-sm text-center py-4">No books published yet.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {author.books.map((book) => (
                    <div key={book.id} className="flex items-center gap-4 p-3 bg-white/[0.02] border border-white/5 rounded-lg hover:border-white/10 transition-colors">
                      <div className="w-10 h-14 bg-white/10 rounded flex-shrink-0 flex items-center justify-center text-xs text-white/20">Book</div>
                      <div>
                        <h4 className="text-sm font-medium text-white line-clamp-1">{book.title}</h4>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </DashboardCard>

        </div>

        {/* Right Column */}
        <div className="space-y-6 lg:col-span-1">
          
          <DashboardCard title="Author Photo" action={<User size={18} className="text-white/40" />}>
            <div className="p-6 flex flex-col items-center">
              <div className="aspect-square w-40 bg-white/5 border border-white/10 rounded-full overflow-hidden flex items-center justify-center relative shadow-xl">
                {author.avatarUrl ? (
                  <img src={author.avatarUrl} alt={author.name} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-16 h-16 text-white/20" />
                )}
              </div>
            </div>
          </DashboardCard>

        </div>
      </div>
    </div>
  );
}
