import { useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { PlusIcon } from "lucide-react";
import type { ChangeEvent } from "react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import type { UploadedImage } from "@/components/admin/image-field";
import { ImageField } from "@/components/admin/image-field";
import { ItemCardPreview } from "@/components/admin/item-card-preview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { CATEGORY_LABELS, GENDER_LABELS } from "@/lib/catalog/view";

const TAG_SPLIT = /[,，]/u;
const TAG_SUGGESTION_LIMIT = 10;
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
    <Badge
      className="hover:bg-muted cursor-pointer"
      render={<button onClick={handleClick} type="button" />}
      variant="outline"
    >
      <PlusIcon />
      {tag}
    </Badge>
  );
}

function getSkeletonStatus({
  category,
  initial,
  skeleton,
}: {
  category: Category;
  initial?: ItemView;
  skeleton: string | null | undefined;
}): string {
  if (category !== "pose") {
    return "不适用";
  }
  if (skeleton === null) {
    return "将清除";
  }
  if (typeof skeleton === "string") {
    return "待保存";
  }
  return initial?.skeletonSrc ? "已设置" : "无";
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
  const create = useServerFn(createItem);
  const update = useServerFn(updateItem);
  const [gender, setGender] = useState<Gender>(initial?.gender ?? "any");
  const [name, setName] = useState(initial?.name ?? "");
  const [promptZh, setPromptZh] = useState(initial?.promptZh ?? "");
  const [promptEn, setPromptEn] = useState(initial?.promptEn ?? "");
  const [tagsText, setTagsText] = useState(initial?.tags.join(", ") ?? "");
  const [image, setImage] = useState<UploadedImage | undefined>();
  // undefined 保留原骨架图，null 清除，字符串为新上传的 key
  const [skeleton, setSkeleton] = useState<string | null | undefined>();
  const [saving, setSaving] = useState(false);
  const [showAllSuggestions, setShowAllSuggestions] = useState(false);

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
  const toggleSuggestions = useCallback(
    () => setShowAllSuggestions((current) => !current),
    []
  );
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
      const saved = await (initial
        ? update({ data: parsed.data })
        : create({ data: parsed.data }));
      if (!saved) {
        return;
      }
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
    create,
    gender,
    image,
    initial,
    name,
    promptEn,
    promptZh,
    router,
    skeleton,
    tags,
    update,
  ]);

  const showSkeleton = category === "pose";
  const suggestions = tagSuggestions.filter((tag) => !tags.includes(tag));
  const visibleSuggestions = showAllSuggestions
    ? suggestions
    : suggestions.slice(0, TAG_SUGGESTION_LIMIT);
  const hiddenSuggestionCount = Math.max(
    suggestions.length - TAG_SUGGESTION_LIMIT,
    0
  );
  const skeletonStatus = getSkeletonStatus({ category, initial, skeleton });
  const cardPreviewSrc = image?.src ?? initial?.thumbSrc;
  const cardPreviewAspectRatio =
    image?.aspectRatio ??
    initial?.thumbAspectRatio ??
    initial?.imageAspectRatio;

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
      <div className="grid min-w-0 gap-5">
        <Card>
          <CardHeader>
            <CardTitle>基本信息</CardTitle>
            <CardDescription>名称、性别与标签</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="name">名称</Label>
                <Input
                  id="name"
                  maxLength={50}
                  onChange={handleName}
                  value={name}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="gender">性别</Label>
                <Select
                  items={GENDER_LABELS}
                  onValueChange={handleGender}
                  value={gender}
                >
                  <SelectTrigger className="w-full" id="gender">
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
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tags">标签</Label>
              <Input id="tags" onChange={handleTags} value={tagsText} />
              <p className="text-muted-foreground text-xs">
                逗号分隔，最多 10 个
              </p>
              {suggestions.length > 0 ? (
                <div className="grid gap-1.5">
                  <span className="text-muted-foreground text-xs">
                    常用标签
                  </span>
                  <div className="flex flex-wrap items-center gap-1">
                    {visibleSuggestions.map((tag) => (
                      <TagSuggestion key={tag} onAdd={addTag} tag={tag} />
                    ))}
                    {hiddenSuggestionCount > 0 && (
                      <Button
                        aria-expanded={showAllSuggestions}
                        className="text-muted-foreground"
                        onClick={toggleSuggestions}
                        size="xs"
                        variant="ghost"
                      >
                        {showAllSuggestions
                          ? "收起标签"
                          : `展开其余 ${hiddenSuggestionCount} 个`}
                      </Button>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>提示词</CardTitle>
            <CardDescription>中英文并排，便于对照</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            <div className="grid content-start gap-2">
              <Label htmlFor="prompt-zh">中文提示词</Label>
              <Textarea
                className="min-h-28"
                id="prompt-zh"
                maxLength={1000}
                onChange={handlePromptZh}
                value={promptZh}
              />
            </div>
            <div className="grid content-start gap-2">
              <Label htmlFor="prompt-en">英文提示词</Label>
              <Textarea
                className="min-h-28"
                id="prompt-en"
                maxLength={1000}
                onChange={handlePromptEn}
                value={promptEn}
              />
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="grid min-w-0 gap-5 xl:sticky xl:top-6 xl:max-h-[calc(100svh-3rem)] xl:self-start xl:overflow-y-auto xl:overscroll-contain xl:pr-1">
        <Card>
          <CardHeader>
            <CardTitle>素材图片</CardTitle>
            <CardDescription>
              {initial ? "不上传则保留原图" : "支持 PNG、JPG、WebP"}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5">
            <ImageField
              aspectRatio={initial?.imageAspectRatio}
              currentSrc={initial?.imageSrc}
              id="image"
              label="图片"
              onUploaded={setImage}
            />
            <div className="grid gap-2 border-t pt-4">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-xs font-medium">列表卡片预览</span>
                <span className="text-muted-foreground text-xs">
                  保存后生效
                </span>
              </div>
              <ItemCardPreview
                category={category}
                gender={gender}
                imageSrc={cardPreviewSrc}
                name={name}
                tags={tags}
                thumbAspectRatio={cardPreviewAspectRatio}
              />
            </div>
            {showSkeleton && (
              <div className="grid content-start gap-2 border-t pt-5">
                <ImageField
                  currentSrc={
                    skeleton === null ? undefined : initial?.skeletonSrc
                  }
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
            <div className="grid grid-cols-3 gap-2 border-t pt-3 text-xs">
              <div className="grid gap-0.5">
                <span className="text-muted-foreground">类别</span>
                <span>{CATEGORY_LABELS[category]}</span>
              </div>
              <div className="grid gap-0.5">
                <span className="text-muted-foreground">ID</span>
                <span className="tabular-nums">
                  {initial ? `#${initial.id}` : "保存后生成"}
                </span>
              </div>
              <div className="grid gap-0.5">
                <span className="text-muted-foreground">骨架图</span>
                <span>{skeletonStatus}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="bg-background/90 ring-foreground/8 dark:ring-foreground/10 sticky bottom-4 z-10 flex flex-wrap items-center justify-end gap-2 rounded-2xl p-3 ring-1 backdrop-blur-md xl:col-span-2">
        {cardPreviewSrc ? (
          <img
            alt="当前素材图片"
            className="ring-foreground/8 dark:ring-foreground/10 size-8 shrink-0 rounded-lg object-cover ring-1"
            height={32}
            src={cardPreviewSrc}
            width={32}
          />
        ) : null}
        <p className="text-muted-foreground mr-auto text-xs">
          保存后返回{CATEGORY_LABELS[category]}列表
        </p>
        <Button onClick={goBack} variant="outline">
          取消
        </Button>
        <Button disabled={saving} onClick={submit}>
          {saving ? "保存中…" : "保存"}
        </Button>
      </div>
    </div>
  );
}
