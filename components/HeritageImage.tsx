"use client";

import { useState, useEffect } from "react";

interface HeritageImageProps {
  imageUrl: string | null;
  nameEn: string;
  nameJa: string;
  category: string;
  className?: string;
}

export function HeritageImage({ imageUrl, nameEn, nameJa, category, className = "" }: HeritageImageProps) {
  const [src, setSrc] = useState<string | null>(imageUrl);
  const [loading, setLoading] = useState(!imageUrl);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (imageUrl || failed) return;

    let cancelled = false;

    async function fetchWikiImage() {
      try {
        const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&list=search&srsearch=${encodeURIComponent(nameEn)}&srlimit=1`;
        const searchRes = await fetch(searchUrl);
        const searchData = await searchRes.json();
        const results = searchData?.query?.search;
        if (!results?.length) { setFailed(true); setLoading(false); return; }

        const pageTitle = results[0].title;
        const imgUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&titles=${encodeURIComponent(pageTitle)}&prop=pageimages&pithumbsize=640`;
        const imgRes = await fetch(imgUrl);
        const imgData = await imgRes.json();
        const pages = imgData?.query?.pages;
        if (!pages) { setFailed(true); setLoading(false); return; }

        const page = Object.values(pages)[0] as { thumbnail?: { source: string } };
        if (!cancelled && page?.thumbnail?.source) {
          setSrc(page.thumbnail.source);
        } else {
          setFailed(true);
        }
      } catch {
        if (!cancelled) setFailed(true);
      }
      if (!cancelled) setLoading(false);
    }

    fetchWikiImage();
    return () => { cancelled = true; };
  }, [imageUrl, nameEn, failed]);

  if (loading) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ background: "linear-gradient(135deg, #dfe6e9, #b2bec3)" }}>
        <div className="animate-pulse text-4xl opacity-50">
          {category === "Natural" ? "🌿" : category === "Mixed" ? "🌍" : "🏛️"}
        </div>
      </div>
    );
  }

  if (!src || failed) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ background: "linear-gradient(135deg, #dfe6e9, #b2bec3)" }}>
        <div className="text-5xl">
          {category === "Natural" ? "🌿" : category === "Mixed" ? "🌍" : "🏛️"}
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={nameJa}
      className={`object-cover ${className}`}
      loading="lazy"
      onError={() => { setFailed(true); setSrc(null); }}
    />
  );
}
