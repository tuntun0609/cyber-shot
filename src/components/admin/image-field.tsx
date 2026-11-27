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
  currentSrc,
  id,
  label,
  onUploaded,
}: {
  currentSrc?: string;
  id: string;
  label: string;
  onUploaded: (image: UploadedImage) => void;
}) {
  const [preview, setPreview] = useState<string>();
  const [busy, setBusy] = useState(false);

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
        const { key } = await uploadImage({ data: body });
        setPreview(URL.createObjectURL(file));
        onUploaded({ aspectRatio, key });
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "上传失败");
      } finally {
        setBusy(false);
      }
    },
    [onUploaded]
  );

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) =>
      handleFile(event.target.files?.[0]),
    [handleFile]
  );

  const src = preview || currentSrc;
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="bg-muted ring-foreground/8 dark:ring-foreground/10 flex aspect-square w-full max-w-48 items-center justify-center overflow-hidden rounded-2xl ring-1">
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
