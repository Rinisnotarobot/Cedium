"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { authClient } from "#/lib/auth-client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "#/components/ui/dialog";
import { Input } from "#/components/ui/input";
import { Textarea } from "#/components/ui/textarea";
import { Button } from "#/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "#/components/ui/avatar";
import { FileInput } from "#/components/ui/file-input";
import { cn } from "#/lib/utils";
import { Loader2 } from "lucide-react";

interface ExtendedUser {
  name: string;
  email: string;
  image?: string | null;
  emailVerified?: boolean;
  id?: string;
  pronouns?: string;
  bio?: string;
}

interface ProfileEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileEditDialog({ open, onOpenChange }: ProfileEditDialogProps) {
  const { data: session, refetch } = authClient.useSession();
  const user = session?.user as ExtendedUser | undefined;

  const [name, setName] = useState(user?.name ?? "");
  const [image, setImage] = useState(user?.image ?? "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const nameLength = name.length;
  const nameLimit = 50;
  const nameError = name.length > 0 && name.length < 2;

  const handleFileUpload = useCallback(async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload/avatar", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!result.success) {
        toast.error(result.error || "上传失败");
        return;
      }

      setImage(result.url);
    } catch {
      toast.error("上传失败，请稍后重试");
    } finally {
      setUploading(false);
    }
  }, []);

  const handleSave = useCallback(async () => {
    if (nameError) return;

    setSaving(true);
    try {
      const { data, error } = await authClient.updateUser({
        name: name.trim(),
        image: image || undefined,
      });

      if (error) {
        toast.error(error.message ?? "更新失败，请稍后重试");
        return;
      }

      if (data) {
        toast.success("个人资料已更新");
        refetch();
        onOpenChange(false);
      }
    } catch {
      toast.error("更新失败，请稍后重试");
    } finally {
      setSaving(false);
    }
  }, [name, nameError, image, refetch, onOpenChange]);

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset to current session values
      setName(user?.name ?? "");
      setImage(user?.image ?? "");
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="sm:text-left">
          <DialogTitle>个人资料</DialogTitle>
          <DialogDescription>编辑头像、昵称、简介等个人信息</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Photo */}
          <div className="flex items-start gap-4">
            <div className="relative">
              <Avatar size="lg" className="size-16">
                <AvatarImage src={image || undefined} alt={name || user?.name || "User"} />
                <AvatarFallback className="text-lg">
                  {name?.charAt(0).toUpperCase() ?? user?.name?.charAt(0).toUpperCase() ?? "U"}
                </AvatarFallback>
              </Avatar>
              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
                  <Loader2 className="size-4 animate-spin text-white" />
                </div>
              )}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <FileInput onFileSelect={handleFileUpload} onError={(e) => toast.error(e)} disabled={uploading}>
                  <Button type="button" variant="link" size="sm" className="h-auto p-0" disabled={uploading}>
                    更换头像
                  </Button>
                </FileInput>
                {image && (
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-destructive hover:text-destructive/80"
                    onClick={() => setImage("")}
                  >
                    移除
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                推荐：正方形 JPG、PNG 或 GIF，每边至少 1000 像素
              </p>
            </div>
          </div>

          {/* Name */}
          <div className="space-y-1">
            <label htmlFor="profile-name" className="text-sm font-medium">
              姓名<span className="text-destructive ml-0.5">*</span>
            </label>
            <Input
              id="profile-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={nameLimit}
              className={cn(nameError && "border-destructive")}
            />
            <div className={cn("text-xs text-right", nameError ? "text-destructive" : "text-muted-foreground")}>
              {nameLength}/{nameLimit}
            </div>
            {nameError && <p className="text-xs text-destructive">姓名至少需要2个字符</p>}
          </div>

          {/* Pronouns */}
          <div className="space-y-1">
            <label htmlFor="profile-pronouns" className="text-sm font-medium">
              代称
            </label>
            <Input
              id="profile-pronouns"
              value={user?.pronouns ?? ""}
              maxLength={4}
              disabled
              className="bg-muted/50"
              placeholder="添加..."
            />
            <p className="text-xs text-right text-muted-foreground">
              {(user?.pronouns?.length ?? 0)}/4
            </p>
          </div>

          {/* Bio */}
          <div className="space-y-1">
            <label htmlFor="profile-bio" className="text-sm font-medium">
              简介
            </label>
            <Textarea
              id="profile-bio"
              value={user?.bio ?? ""}
              maxLength={160}
              disabled
              className="bg-muted/50 min-h-[80px]"
              placeholder="介绍一下自己..."
            />
            <p className="text-xs text-right text-muted-foreground">
              {(user?.bio?.length ?? 0)}/160
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleSave}
            disabled={saving || nameError || name.trim().length === 0}
            className={cn(
              "transition-[transform,opacity] duration-150 ease-out",
              "active:scale-[0.97]",
            )}
          >
            {saving && <Loader2 className="size-4 animate-spin" />}
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
