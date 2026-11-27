import { useServerFn } from "@tanstack/react-start";
import { ImageIcon } from "lucide-react";
import type { ChangeEvent } from "react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { uploadImage } from "@/lib/admin/admin.functions";

export interface UploadedImage {
  aspectRatio: number;
  key: string;
  src: string;
}

function readAspectRatio(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img.naturalWidth / img.naturalHeight);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("无法读取图片"));
    };
    img.src = url;
  });
}

// 选择文件后立即上传到 R2，并在浏览器里读出原图宽高比
export function ImageField({
  aspectRatio: currentAspectRatio,
  currentSrc,
  id,
  label,
  onUploaded,
}: {
  aspectRatio?: number;
  currentSrc?: string;
  id: string;
  label: string;
  onUploaded: (image: UploadedImage) => void;
}) {
  const [preview, setPreview] = useState<string>();
  const [previewAspectRatio, setPreviewAspectRatio] = useState<
    number | undefined
  >();
  const [busy, setBusy] = useState(false);
  const upload = useServerFn(uploadImage);

  const handleFile = useCallback(
    async (file: File | undefined) => {
      if (!file) {
        return;
      }
      setBusy(true);
      try {
        const aspectRatio = await readAspectRatio(file);
        const body = new FormData();
        body.set("file", file);
        const uploaded = await upload({ data: body });
        if (!uploaded) {
          return;
        }
        const { key } = uploaded;
        const previewUrl = URL.createObjectURL(file);
        setPreview(previewUrl);
        setPreviewAspectRatio(aspectRatio);
        onUploaded({ aspectRatio, key, src: previewUrl });
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "上传失败");
      } finally {
        setBusy(false);
      }
    },
    [onUploaded, upload]
  );

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) =>
      handleFile(event.target.files?.[0]),
    [handleFile]
  );

  const src = preview || currentSrc;
  const displayAspectRatio = previewAspectRatio ?? currentAspectRatio;
  return (
    <div className="grid w-full max-w-80 gap-2">
      <Label htmlFor={id}>{label}</Label>
      <div
        className="bg-muted ring-foreground/8 dark:ring-foreground/10 flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl ring-1"
        style={{ aspectRatio: displayAspectRatio }}
      >
        {src ? (
          <img
            alt={label}
            className="size-full object-contain"
            height={192}
            src={src}
            width={192}
          />
        ) : (
          <div className="flex flex-col items-center gap-1">
            <ImageIcon className="text-muted-foreground size-6" />
            <span className="text-muted-foreground text-xs">暂无图片</span>
          </div>
        )}
      </div>
      <Input
        accept="image/png,image/jpeg,image/webp"
        disabled={busy}
        id={id}
        onChange={handleChange}
        type="file"
      />
      {busy ? <p className="text-muted-foreground text-xs">上传中…</p> : null}
    </div>
  );
}
