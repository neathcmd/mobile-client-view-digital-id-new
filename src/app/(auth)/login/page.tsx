"use client";

import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { User, Lock, Eye, EyeOff } from "lucide-react";
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
import { authRequest } from "@/lib/api/auth-api";
import { useMutation } from "@tanstack/react-query";
import { AuthLoginType } from "@/types/auth-type";

const LoginSchema = z.object({
  user_name: z.string().nonempty({ message: "Username is required" }),
  password: z.string().nonempty({ message: "Password is required." }),
});

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");

  const { AUTH_LOGIN } = authRequest();

  const router = useRouter();

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      user_name: "",
      password: "",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationKey: ["login"],
    mutationFn: (payload: AuthLoginType) => AUTH_LOGIN(payload),
    onSuccess: (data) => {
      router.push("/profile");
      console.log(data, "===data===");
    },
    onError: (error) => {
      console.log("Login failed", error);
    },
  });

  // submit login handler
  function onSubmit(data: z.infer<typeof LoginSchema>) {
    setServerError("");
    mutate({
      ...data,
      user_name: data.user_name.trim(),
      password: data.password.trim(),
    });
  }

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 p-4">
      <div className="w-full max-w-md">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className={FORM_STYLE}>
            <div className="text-center mb-8">
              <h1 className={AUTH_HEADER_STYLE}>Welcome back</h1>
            </div>

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
                        // disabled={isPending}
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        // disabled={isPending}
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

            {serverError && (
              <div className="text-red-500 text-sm">{serverError}</div>
            )}

            <Button type="submit" className="w-full mt-6" disabled={isPending}>
              {isPending ? "Login..." : "Login"}
            </Button>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link
                  href="/register"
                  className="text-green-700 font-medium hover:text-green-800 hover:underline transition-colors"
                >
                  Register here
                </Link>
              </p>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default LoginForm;
