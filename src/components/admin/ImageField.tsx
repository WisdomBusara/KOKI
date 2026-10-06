"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { UploadCloud, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CloudinaryResult {
  event?: string;
  info?: { secure_url?: string };
}
interface CloudinaryWidget {
  open: () => void;
}
interface CloudinaryGlobal {
  createUploadWidget: (
    opts: Record<string, unknown>,
    cb: (error: unknown, result: CloudinaryResult) => void
  ) => CloudinaryWidget;
}
declare global {
  interface Window {
    cloudinary?: CloudinaryGlobal;
  }
}

const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
const SCRIPT = "https://upload-widget.cloudinary.com/global/all.js";

export default function ImageField({ defaultValue }: { defaultValue?: string | null }) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const widgetRef = useRef<CloudinaryWidget | null>(null);
  const enabled = Boolean(CLOUD && PRESET);

  function openWidget() {
    if (!window.cloudinary) return;
    if (!widgetRef.current) {
      widgetRef.current = window.cloudinary.createUploadWidget(
        { cloudName: CLOUD, uploadPreset: PRESET, sources: ["local", "url", "camera"], multiple: false, folder: "koki" },
        (error, result) => {
          if (!error && result?.event === "success" && result.info?.secure_url) {
            setUrl(result.info.secure_url);
          }
        }
      );
    }
    widgetRef.current.open();
  }

  function loadAndOpen() {
    if (window.cloudinary) return openWidget();
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT}"]`);
    if (existing) {
      existing.addEventListener("load", openWidget, { once: true });
      return;
    }
    const s = document.createElement("script");
    s.src = SCRIPT;
    s.onload = openWidget;
    document.body.appendChild(s);
  }

  return (
    <div className="space-y-2">
      <input type="hidden" name="imageUrl" value={url} />

      {url && (
        <div className="relative h-32 w-32 overflow-hidden rounded-lg border border-stone-200 bg-stone-100">
          {/* unoptimized: admin preview of an arbitrary host, skip the image optimizer */}
          <Image src={url} alt="" fill sizes="128px" unoptimized className="object-cover" />
          <button
            type="button"
            onClick={() => setUrl("")}
            aria-label="Remove image"
            className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      {enabled && (
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={loadAndOpen}>
            <UploadCloud className="h-4 w-4" /> Upload image
          </Button>
          <span className="text-xs text-stone-400">or paste a URL below</span>
        </div>
      )}

      <Input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://… image URL" />

      {!enabled && (
        <p className="text-xs text-stone-400">
          Tip: set <code>NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME</code> and <code>NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET</code> to upload images directly.
        </p>
      )}
    </div>
  );
}
