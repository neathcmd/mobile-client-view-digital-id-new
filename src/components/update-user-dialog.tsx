"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";

import { UserData } from "@/types/user-type";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { _envCons } from "@/constants";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userRequest } from "@/lib/api/get-me-api";

const formSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email"),
  user_name: z.string().min(1, "Username is required"),
  avatar: z.string().optional(), // Changed from required to optional
});

export type FormValues = z.infer<typeof formSchema>;

type Props = {
  user: UserData;
  onSave: (data: FormValues) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  //   refetchUser: () => void;
};

export default function UpdateUserDialog({
  user,
  onSave,
  open,
  setOpen,
}: //   refetchUser,
Props) {
  const queryClient = useQueryClient();
  const { UPDATE_USER } = userRequest();
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: user?.full_name || "",
      email: user?.email || "",
      user_name: user?.user_name || "",
      avatar: user?.avatar || "",
    },
  });

  // Reset form on user change
  useEffect(() => {
    const defaultValues = {
      full_name: user?.full_name || "",
      email: user?.email || "",
      user_name: user?.user_name || "",
      avatar: user?.avatar || "",
    };

    form.reset(defaultValues);
    setAvatarFile(null);
    setAvatarPreview(user?.avatar || null);

    // Set the avatar field value in the form
    form.setValue("avatar", user?.avatar || "");

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const onSubmit = async (data: FormValues) => {
    let avatarUrl = data.avatar || ""; // Use form data avatar as fallback

    // Upload new avatar only if new file is selected
    if (avatarFile) {
      try {
        setIsSubmitting(true);
        const formData = new FormData();
        formData.append("image", avatarFile);
        const res = await fetch(`${_envCons.baseUrl}/upload/upload-image`, {
          method: "POST",
          body: formData,
        });
        const uploadData = await res.json();
        avatarUrl = uploadData.url;
      } catch (error) {
        console.error("Error uploading avatar:", error);
        // Continue with existing avatar if upload fails
        avatarUrl = avatarPreview || data.avatar || "";
      }
    } else if (avatarPreview) {
      // If no new file but preview exists, use it
      avatarUrl = avatarPreview;
    }

    const finalPayload = {
      ...data,
      avatar: avatarUrl,
    };

    console.log("Final payload:", finalPayload);
    onSave(finalPayload);

    updateUserProfileMutation.mutate(finalPayload);
  };

  const updateUserProfileMutation = useMutation({
    mutationKey: ["update-user-profile", "me"],
    mutationFn: (payload: FormValues) => UPDATE_USER(payload),
    onSuccess: () => {
      form.reset();
      setAvatarFile(null);
      setAvatarPreview(null);
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["me"] });
      //   refetchUser();
    },
  });

  const isValidImage = (file: File) => {
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    const maxSize = 2 * 1024 * 1024;
    return allowedTypes.includes(file.type) && file.size <= maxSize;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && isValidImage(file)) {
      setAvatarFile(file);
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
      // Update form value
      form.setValue("avatar", previewUrl);
    } else if (file) {
      alert("Avatar must be an image under 2MB");
      // Reset the input
      e.target.value = "";
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    // Update form value
    form.setValue("avatar", "");
    // Reset file input
    const fileInput = document.getElementById(
      "avatarUpload"
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Profile</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 pt-4"
          >
            {/* Avatar Upload */}
            <div className="flex flex-col items-center space-y-2">
              <label
                htmlFor="avatarUpload"
                className="cursor-pointer relative group"
              >
                <div className="w-24 h-24 rounded-full border overflow-hidden bg-gray-100">
                  {avatarPreview ? (
                    <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                      <AvatarImage src={avatarPreview} alt={avatarPreview} />
                      <AvatarFallback className="text-2xl font-semibold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                        {avatarPreview}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      + Avatar
                    </div>
                  )}
                </div>
                {avatarPreview && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="absolute -top-2 -right-2 bg-white text-red-500 rounded-full w-5 h-5 flex items-center justify-center text-xs shadow border"
                  >
                    ✕
                  </button>
                )}
              </label>
              <Input
                id="avatarUpload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <Label
                className="text-sm font-medium cursor-pointer text-gray-600"
                htmlFor="avatarUpload"
              >
                Click to change avatar
              </Label>
            </div>

            {/* Avatar Form Field - This ensures avatar is part of the form */}
            <FormField
              control={form.control}
              name="avatar"
              render={({ field }) => (
                <FormItem className="hidden">
                  <FormControl>
                    <Input type="hidden" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Full Name */}
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Username */}
            <FormField
              control={form.control}
              name="user_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="johndoe123" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="john@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || updateUserProfileMutation.isPending}
              >
                {isSubmitting || updateUserProfileMutation.isPending
                  ? "Creating..."
                  : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
