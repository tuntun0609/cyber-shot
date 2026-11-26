import { useRouter } from "@tanstack/react-router";
import type { ChangeEvent } from "react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import type { UploadedImage } from "@/components/admin/image-field";
import { ImageField } from "@/components/admin/image-field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createItem, updateItem } from "@/lib/admin/admin.functions";
import { createItemSchema, updateItemSchema } from "@/lib/admin/schema";
import type { Category, ItemView } from "@/lib/catalog/view";
import { GENDER_LABELS } from "@/lib/catalog/view";

const TAG_SPLIT = /[,，]/u;
const FIELD_LABELS: Record<string, string> = {
  gender: "性别",
  image: "图片",
  name: "名称",
  promptEn: "英文提示词",
  promptZh: "中文提示词",
  skeleton: "骨架图",
  tags: "标签",
};

function parseTags(text: string): string[] {
  return text
    .split(TAG_SPLIT)
    .map((tag) => tag.trim())
    .filter(Boolean);
}

type Gender = ItemView["gender"];

function TagSuggestion({
  onAdd,
  tag,
}: {
  onAdd: (tag: string) => void;
  tag: string;
}) {
  const handleClick = useCallback(() => onAdd(tag), [onAdd, tag]);
  return (
    <button onClick={handleClick} type="button">
      <Badge variant="outline">+ {tag}</Badge>
    </button>
  );
}

// initial 存在时为编辑模式（类别不可改），否则为新增
export function ItemForm({
  category,
  initial,
  tagSuggestions,
}: {
  category: Category;
  initial?: ItemView;
  tagSuggestions: string[];
}) {
  const router = useRouter();
  const [gender, setGender] = useState<Gender>(initial?.gender ?? "any");
  const [name, setName] = useState(initial?.name ?? "");
  const [promptZh, setPromptZh] = useState(initial?.promptZh ?? "");
  const [promptEn, setPromptEn] = useState(initial?.promptEn ?? "");
  const [tagsText, setTagsText] = useState(initial?.tags.join(", ") ?? "");
  const [image, setImage] = useState<UploadedImage>();
  // undefined 保留原骨架图，null 清除，字符串为新上传的 key
  const [skeleton, setSkeleton] = useState<string | null | undefined>();
  const [saving, setSaving] = useState(false);

  const tags = useMemo(() => parseTags(tagsText), [tagsText]);
  const addTag = useCallback(
    (tag: string) => {
      if (!tags.includes(tag)) {
        setTagsText([...tags, tag].join(", "));
      }
    },
    [tags]
  );
  const handleGender = useCallback((value: string | null) => {
    if (value) {
      setGender(value as Gender);
    }
  }, []);
  const handleName = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => setName(event.target.value),
    []
  );
  const handlePromptZh = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) =>
      setPromptZh(event.target.value),
    []
  );
  const handlePromptEn = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) =>
      setPromptEn(event.target.value),
    []
  );
  const handleTags = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => setTagsText(event.target.value),
    []
  );
  const handleSkeletonUploaded = useCallback(
    (uploaded: UploadedImage) => setSkeleton(uploaded.key),
    []
  );
  const clearSkeleton = useCallback(() => setSkeleton(null), []);
  const goBack = useCallback(
    () =>
      router.navigate({
        params: { category },
        search: {},
        to: "/admin/$category",
      }),
    [category, router]
  );

  const submit = useCallback(async () => {
    const base = { gender, name, promptEn, promptZh, tags };
    if (!(initial || image)) {
      toast.error("请上传图片");
      return;
    }
    const parsed = initial
      ? updateItemSchema.safeParse({ ...base, id: initial.id, image, skeleton })
      : createItemSchema.safeParse({
          ...base,
          category,
          image,
          skeleton: skeleton ?? undefined,
        });
    if (!parsed.success) {
      const field = String(parsed.error.issues[0]?.path[0] ?? "");
      toast.error(`请检查「${FIELD_LABELS[field] ?? "表单"}」`);
      return;
    }
    setSaving(true);
    try {
      await (initial
        ? updateItem({ data: parsed.data })
        : createItem({ data: parsed.data }));
      toast.success("已保存");
      await router.invalidate();
      await router.navigate({
        params: { category },
        search: {},
        to: "/admin/$category",
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "保存失败");
    } finally {
      setSaving(false);
    }
  }, [
    category,
    gender,
    image,
    initial,
    name,
    promptEn,
    promptZh,
    router,
    skeleton,
    tags,
  ]);

  const showSkeleton = category === "pose";
  return (
    <div className="grid max-w-2xl gap-5">
      <div className="grid gap-2">
        <Label htmlFor="name">名称</Label>
        <Input id="name" maxLength={50} onChange={handleName} value={name} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="gender">性别</Label>
        <Select
          items={GENDER_LABELS}
          onValueChange={handleGender}
          value={gender}
        >
          <SelectTrigger id="gender">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(GENDER_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="prompt-zh">中文提示词</Label>
        <Textarea
          id="prompt-zh"
          maxLength={1000}
          onChange={handlePromptZh}
          value={promptZh}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="prompt-en">英文提示词</Label>
        <Textarea
          id="prompt-en"
          maxLength={1000}
          onChange={handlePromptEn}
          value={promptEn}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="tags">标签（逗号分隔，最多 10 个）</Label>
        <Input id="tags" onChange={handleTags} value={tagsText} />
        <div className="flex flex-wrap gap-1">
          {tagSuggestions
            .filter((tag) => !tags.includes(tag))
            .map((tag) => (
              <TagSuggestion key={tag} onAdd={addTag} tag={tag} />
            ))}
        </div>
      </div>
      <ImageField
        currentSrc={initial?.imageSrc}
        id="image"
        label={initial ? "图片（不选则保留原图）" : "图片"}
        onUploaded={setImage}
      />
      {showSkeleton && (
        <div className="grid gap-2">
          <ImageField
            currentSrc={skeleton === null ? undefined : initial?.skeletonSrc}
            id="skeleton"
            label="骨架图（可选）"
            onUploaded={handleSkeletonUploaded}
          />
          {initial?.skeletonSrc && skeleton !== null && (
            <Button
              className="w-fit"
              onClick={clearSkeleton}
              size="sm"
              variant="outline"
            >
              清除骨架图
            </Button>
          )}
        </div>
      )}
      <div className="flex gap-2">
        <Button disabled={saving} onClick={submit}>
          {saving ? "保存中…" : "保存"}
        </Button>
        <Button onClick={goBack} variant="outline">
          取消
        </Button>
      </div>
    </div>
  );
}
