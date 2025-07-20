"use client";

import { useMutation } from "@tanstack/react-query";
import React, { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useDeviceStore } from "@/store/device-store";
import { AuthRegisterType } from "@/types/auth-type";
import { authRequest } from "@/lib/api/auth-api";

import { Button } from "@/components/ui/button";
import { User, Mail, Lock, Eye, EyeOff } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  INPUT_STYLE,
  FORM_STYLE,
  ICON_STYLE,
  AUTH_HEADER_STYLE,
} from "@/constants/form-styling";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";

const RegisterSchema = z.object({
  full_name: z.string().nonempty({
    message: "Full name is required",
  }),

  user_name: z.string().nonempty({ message: "Username is required" }),

  email: z
    .string()
    .nonempty({ message: "Email is required." })
    .email({ message: "Please enter a valid email address." }),

  password: z
    .string()
    .nonempty({ message: "Password is required." })
    .min(4, { message: "Password must be at least 4 characters." }),
  // .refine((val) => /[A-Z]/.test(val), {
  //   message: "Password must contain at least one uppercase letter.",
  // }),
});

const RegisterForm = () => {
  const { AUTH_REGISTER } = authRequest();
  const [showPassword, setShowPassword] = useState(false);
  const { device, fetchDeviceInfo } = useDeviceStore();
  console.log(device);

  const router = useRouter();

  const form = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      full_name: "",
      user_name: "",
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    fetchDeviceInfo();
  }, [fetchDeviceInfo]);

  const { mutate, isPending } = useMutation({
    mutationKey: ["register"],
    mutationFn: (payload: AuthRegisterType) => AUTH_REGISTER(payload),
    onSuccess: (data) => {
      // redirect to profile page
      router.push("/profile");
      console.log(data, "===data===");
    },
    onError: (error) => {
      console.error("Registration failed:", error);
    },
  });

  // submit handler
  function onSubmit(data: z.infer<typeof RegisterSchema>) {
    mutate({
      ...data,
      device_name: device?.device_name,
      device_type: device?.device_type,
      os: device?.os,
      browser: device?.browser,
      // ip_address: device?.ip_address,
    });
  }

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 p-4">
      <div className="w-full max-w-md">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className={FORM_STYLE}>
            <div className="text-center mb-8">
              <h1 className={AUTH_HEADER_STYLE}>Create Account</h1>
              {/* <p className="text-gray-600 mt-2">
                Join us and get started today
              </p> */}
            </div>
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className={ICON_STYLE} />
                      <Input
                        placeholder="Enter your full name"
                        {...field}
                        className={INPUT_STYLE}
                        disabled={isPending}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="user_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className={ICON_STYLE} />
                      <Input
                        placeholder="Choose a username"
                        {...field}
                        className={INPUT_STYLE}
                        disabled={isPending}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className={ICON_STYLE} />
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        {...field}
                        className={INPUT_STYLE}
                        disabled={isPending}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className={ICON_STYLE} />
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a strong password"
                        {...field}
                        className={INPUT_STYLE}
                        disabled={isPending}
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        disabled={isPending}
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full mt-6"
              disabled={isPending}
              // onClick={onSubmit}
            >
              {isPending ? "Creating Account..." : "Create Account"}
            </Button>
            {/* <Button type="submit" onClick={onSubmit} className="w-full">
              Create Account
            </Button> */}

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-green-700 font-medium hover:text-green-800 hover:underline transition-colors"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default RegisterForm;
