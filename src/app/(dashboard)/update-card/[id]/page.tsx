"use client";
import { useRouter } from "next/navigation";
import React, { useState, use, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Trash2, Plus } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";

import { cardRequest } from "@/lib/api/card-api";
import { CreateCardType, SocialLink } from "@/types/card-type";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
const formSchema = z.object({
  gender: z.enum(["male", "female"], { required_error: "Gender is required" }),
  nationality: z.string().min(1),
  dob: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
  address: z.string().min(1),
  phone: z.string().min(1),
  bio: z.string().min(1),
  web_site: z.string(),
  job: z.string(),
  company: z.string(),
  card_type: z.enum(["Modern", "Minimal", "Corporate"]),
  social: z.array(
    z.object({
      id: z.string().optional(),
      platform: z.string().min(1),
      icon: z.string().optional(),
      url: z.string().url(),
    })
  ),
});

type ProfileFormType = z.infer<typeof formSchema>;

export default function ProfileForm({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const { GET_CARD, UPDATE_CARD } = cardRequest();
  const {
    data: cardData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["card"],
    queryFn: async () => GET_CARD(id),
    enabled: !!id,
  });

  const updateCardMutation = useMutation({
    mutationKey: ["update_card"],
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: CreateCardType;
    }) => UPDATE_CARD(id, payload),
    onSuccess: () => {
      router.push("/profile");
    },
  });

  const form = useForm<ProfileFormType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      gender: "male",
      nationality: "CAMBODIAN",
      dob: "",
      address: "",
      phone: "",
      card_type: "Minimal",
      bio: "",
      job: "",
      web_site: "",
      company: "",
      social: [{ platform: "", icon: "", url: "" }],
    },
  });

  const { control, handleSubmit } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "social",
  });

  const [socialIcons, setSocialIcons] = useState<Record<number, File | null>>(
    {}
  );
  const [iconPreviews, setIconPreviews] = useState<Record<number, string>>({});

  const isValidImage = (file: File) => {
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    const maxSize = 2 * 1024 * 1024;
    return allowedTypes.includes(file.type) && file.size <= maxSize;
  };

  useEffect(() => {
    if (cardData) {
      form.reset({
        gender: cardData?.card.gender,
        job: cardData?.card.job,
        web_site: cardData?.card?.web_site,
        bio: cardData?.card?.bio,
        nationality: cardData?.card.nationality || "USA",
        dob: cardData?.card.dob || "",
        address: cardData?.card.address || "",
        phone: cardData?.card.phone || "",
        card_type: cardData?.card.card_type || "Minimal",
        company: cardData?.card?.company,
        social:
          cardData?.card.socialLinks?.length > 0
            ? cardData?.card.socialLinks.map((item: SocialLink) => ({
                id: item.id,
                platform: item.platform,
                icon: item.icon,
                url: item.url,
              }))
            : [{ platform: "", icon: "", url: "" }],
      });

      //   if (cardData?.card.avatar) {
      //     setAvatarPreview(cardData?.card.avatar);
      //   }

      const previews: Record<number, string> = {};
      cardData?.card.socialLinks?.forEach((item: SocialLink, index: number) => {
        if (item.icon) previews[index] = item.icon;
      });
      setIconPreviews(previews);
    }
  }, [cardData, form]);
  if (isLoading) {
    return "loading";
  } else if (isError) {
    return "error";
  }

  const onSubmit = async (values: ProfileFormType) => {
    // Upload new icons only if new files selected
    const updatedSocial = await Promise.all(
      values.social.map(async (item, index) => {
        const file = socialIcons[index];
        if (file) {
          const formData = new FormData();
          formData.append("image", file);
          const res = await fetch(
            "http://localhost:8000/api/v1/upload/upload-image",
            {
              method: "POST",
              body: formData,
            }
          );
          const data = await res.json();
          return { ...item, icon: data.url };
        }

        // 🧠 Keep existing icon preview if no new file
        return {
          ...item,
          icon: iconPreviews[index] || "",
        };
      })
    );

    const finalPayload = {
      ...values,
      social: updatedSocial,
    };
    updateCardMutation.mutate({ id, payload: finalPayload });

    console.log("Final Payload:", finalPayload);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br  p-4">
      <div className="max-w-sm mx-auto space-y-4">
        <Form {...form}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6 max-w-2xl mx-auto"
          >
            {/* Form Inputs */}
            <FormField
              control={control}
              name="card_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Card Type</FormLabel>
                  <Select
                    value={field.value} // ✅ bind controlled value
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Card Type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Modern">Modern</SelectItem>
                      <SelectItem value="Minimal">Minimal</SelectItem>
                      <SelectItem value="Corporate">Corporate</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="nationality"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nationality</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Nationality" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="dob"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Birth</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Address" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Bio" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Company" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="job"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Job" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="web_site"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Website" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Phone" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Dynamic Social Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Social Media Links</h3>
              {fields.map((fieldItem, index) => (
                <div
                  key={fieldItem.id}
                  className="border p-4 rounded-md space-y-3 relative"
                >
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>

                  {/* Icon Upload */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Icon</label>
                    <div className="flex items-center space-x-4">
                      <label
                        htmlFor={`icon-upload-${index}`}
                        className="cursor-pointer relative group"
                      >
                        <div className="w-12 h-12 rounded-md border bg-gray-100 overflow-hidden flex items-center justify-center">
                          {iconPreviews[index] ? (
                            <Avatar>
                              <AvatarImage
                                src={iconPreviews[index]}
                                alt="@evilrabbit"
                              />
                              <AvatarFallback>ER</AvatarFallback>
                            </Avatar>
                          ) : (
                            <Avatar>
                              <AvatarImage
                                src="https://github.com/evilrabbit.png"
                                alt="@evilrabbit"
                              />
                              <AvatarFallback>ER</AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                        {iconPreviews[index] && (
                          <button
                            type="button"
                            onClick={() => {
                              setSocialIcons((prev) => ({
                                ...prev,
                                [index]: null,
                              }));
                              setIconPreviews((prev) => {
                                const updated = { ...prev };
                                delete updated[index];
                                return updated;
                              });
                            }}
                            className="absolute -top-1 -right-1 bg-white text-red-500 rounded-full w-5 h-5 flex items-center justify-center text-xs shadow"
                          >
                            ✕
                          </button>
                        )}
                      </label>

                      <input
                        id={`icon-upload-${index}`}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file && isValidImage(file)) {
                            setSocialIcons((prev) => ({
                              ...prev,
                              [index]: file,
                            }));
                            setIconPreviews((prev) => ({
                              ...prev,
                              [index]: URL.createObjectURL(file),
                            }));
                          } else {
                            alert("Icon must be an image under 2MB");
                          }
                        }}
                      />
                    </div>
                  </div>

                  {/* Platform */}
                  <FormField
                    control={control}
                    name={`social.${index}.platform` as const}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Platform</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="facebook, instagram..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* URL */}
                  <FormField
                    control={control}
                    name={`social.${index}.url` as const}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Platform Url</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="https://..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => append({ platform: "", icon: "", url: "" })}
              >
                <Plus className="w-4 h-4 mr-2" /> Add Social Link
              </Button>
            </div>

            <Button type="submit" className="w-full">
              Submit
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
