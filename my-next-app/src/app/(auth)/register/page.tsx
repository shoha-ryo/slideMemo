"use client";

import {
  AuthProvider,
  createUserWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { auth, googleProvider, githubProvider } from "@/lib/firebase";
import { db } from "../../../../dexie/dexie";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";

import { showToast } from "@/components/ui/CustomToaster";

import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { Eye, EyeOff, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { FlowLogo } from "../../../../public/FLOW";
import { FirebaseError } from "firebase/app";

const registerSchema = z
  .object({
    email: z.string().email("有効なメールアドレスを入力してください"),
    password: z
      .string()
      .min(8, "パスワードは8文字以上で入力してください")
      .regex(/[A-Z]/, "パスワードには大文字を1文字以上含めてください")
      .regex(/[a-z]/, "パスワードには小文字を1文字以上含めてください")
      .regex(/[0-9]/, "パスワードには数字を1文字以上含めてください"),
    confirmPassword: z.string().min(1, "確認用パスワードを入力してください"),
    agreeToTerms: z.boolean().refine((val) => val === true, {
      message: "利用規約とプライバシーポリシーに同意してください",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "パスワードが一致しません",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

function calculatePasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  let score = 0;

  if (password.length >= 8) score += 25;
  if (password.length >= 12) score += 25;
  if (/[a-z]/.test(password)) score += 15;
  if (/[A-Z]/.test(password)) score += 15;
  if (/[0-9]/.test(password)) score += 10;
  if (/[^a-zA-Z0-9]/.test(password)) score += 10;

  if (score <= 40) return { score, label: "弱", color: "bg-red-500" };
  if (score <= 70) return { score, label: "中", color: "bg-yellow-500" };
  return { score, label: "強", color: "bg-green-500" };
}

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    label: "",
    color: "",
  });
  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      agreeToTerms: false,
    },
  });
  const password = form.watch("password");
  const { isValid } = form.formState;

  useEffect(() => {
    if (password) {
      setPasswordStrength(calculatePasswordStrength(password));
    } else {
      setPasswordStrength({ score: 0, label: "", color: "" });
    }
  }, [password]);

  // Password requirements
  const requirements = [
    { label: "8文字以上", met: password.length >= 8 },
    { label: "大文字を含む", met: /[A-Z]/.test(password) },
    { label: "小文字を含む", met: /[a-z]/.test(password) },
    { label: "数字を含む", met: /[0-9]/.test(password) },
  ];

  async function onSubmit(values: RegisterFormData) {
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        values.email,
        values.password,
      );
      const user = userCredential.user;
      // ここでDexieに保存
      await db.userMeta.put({
        id: "current",
        uid: user.uid,
        email: user.email,
        name: user.displayName,
        photoURL: user.photoURL,
        updatedAt: Date.now(),
      });
      router.push("/home");
    } catch (error) {
      if (
        error instanceof FirebaseError &&
        error.code === "auth/email-already-in-use"
      ) {
        showToast("error", "このメールアドレスは既に登録されています");
      } else {
        showToast(
          "error",
          "登録に失敗しました。時間をおいて再度お試しください",
        );
      }
    } finally {
      setIsLoading(false);
    }
  }

  // ソーシャルログイン用の関数
  const handleSocialLogin = async (provider: AuthProvider) => {
    setIsLoading(true);
    try {
      await signInWithPopup(auth, provider);
      router.push("/home");
    } catch (error) {
      console.error("ソーシャルログインエラー:", error);
      showToast("error", "登録に失敗しました。時間をおいて再度お試しください");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto mb-2 flex items-center justify-center rounded-xl">
            <FlowLogo className="w-25" />
          </div>
          <CardTitle className="text-2xl">新規登録</CardTitle>
          <CardDescription>
            Flowアカウントを作成してタスク管理を始めましょう
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>メールアドレス</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="example@taskflow.com"
                        {...field}
                      />
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
                    <FormLabel>パスワード</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder=""
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            setPasswordStrength(
                              calculatePasswordStrength(e.target.value),
                            );
                          }}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="absolute right-1 top-1/2 -translate-y-1/2"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className="sr-only">
                            パスワードを{showPassword ? "非表示" : "表示"}
                          </span>
                        </Button>
                      </div>
                    </FormControl>

                    {password && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Progress
                            value={passwordStrength.score}
                            className={`h-1.5 ${passwordStrength.color}`}
                          />
                          <span className="text-xs text-muted-foreground">
                            {passwordStrength.label}
                          </span>
                        </div>

                        <div className="rounded-md border border-border bg-muted/30 p-3">
                          <p className="mb-2 text-xs font-medium text-foreground">
                            パスワードの要件:
                          </p>
                          <ul className="space-y-1">
                            {requirements.map((req, index) => (
                              <li
                                key={index}
                                className="flex items-center gap-2 text-xs"
                              >
                                {req.met ? (
                                  <Check className="h-3 w-3 text-green-600" />
                                ) : (
                                  <X className="h-3 w-3 text-muted-foreground" />
                                )}
                                <span
                                  className={
                                    req.met
                                      ? "text-foreground"
                                      : "text-muted-foreground"
                                  }
                                >
                                  {req.label}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>パスワード(確認)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder=""
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="absolute right-1 top-1/2 -translate-y-1/2"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className="sr-only">
                            パスワードを
                            {showConfirmPassword ? "非表示" : "表示"}
                          </span>
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="agreeToTerms"
                render={({ field }) => (
                  <FormItem className="space-y-0">
                    <div className="flex items-start gap-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          id="agreeToTerms"
                          className="mt-0.5"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-tight">
                        <FormLabel
                          htmlFor="agreeToTerms"
                          className="cursor-pointer text-sm font-normal"
                        >
                          <Link
                            href="/terms"
                            className="text-primary hover:underline"
                          >
                            利用規約
                          </Link>
                          および
                          <Link
                            href="/privacy"
                            className="text-primary hover:underline"
                          >
                            プライバシーポリシー
                          </Link>
                          に同意します
                        </FormLabel>
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !isValid}
              >
                {isLoading ? "登録中..." : "アカウントを作成"}
              </Button>
            </form>
          </Form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">または</span>
            </div>
          </div>

          <div className="space-y-2">
            <Button
              type="button"
              variant="outline"
              className="w-full bg-transparent"
              disabled={isLoading}
              onClick={() => handleSocialLogin(googleProvider)}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Googleで登録
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full bg-transparent"
              disabled={isLoading}
              onClick={() => handleSocialLogin(githubProvider)}
            >
              <svg
                className="mr-2 h-4 w-4"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              GitHubで登録
            </Button>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <div className="text-center text-sm text-muted-foreground">
            すでにアカウントをお持ちですか？{" "}
            <Link
              href="/login"
              className="font-medium text-primary hover:underline"
            >
              ログイン
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
