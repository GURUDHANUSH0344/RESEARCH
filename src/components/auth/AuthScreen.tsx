import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Compass,
  ShieldCheck,
  Sparkles,
  BookOpen,
  FlaskConical,
  FileCheck,
  AlertCircle,
  Loader2,
  Lock,
  Mail,
  User,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

interface AuthScreenProps {
  onAuthSuccess?: () => void;
}

export function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleGoogleAuth = async () => {
    try {
      setIsLoading(true);
      setErrorMsg("");
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
        },
      });
      if (error) throw error;
    } catch (err: unknown) {
      let msg = err instanceof Error ? err.message : "Google authentication failed";
      if (msg.includes("Unsupported provider") || msg.includes("provider is not enabled")) {
        msg =
          "Google provider is not enabled in your Supabase dashboard yet. Please enable Google in Supabase Auth Providers.";
      }
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }

    try {
      setIsLoading(true);
      setErrorMsg("");

      if (isSignUp) {
        const { error, data } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName || email.split("@")[0] },
          },
        });
        if (error) throw error;
        toast.success(
          data?.session
            ? "Account created successfully! Welcome to Research Compass."
            : "Account created! Please check your email for confirmation."
        );
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success("Signed in successfully!");
      }

      onAuthSuccess?.();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Authentication failed";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-[#F5F7FB] text-[#0F172A] flex flex-col md:flex-row overflow-y-auto selection:bg-blue-100 selection:text-blue-900">
      {/* Left Column: Scientific Product Showcase (Hidden on small screens) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#1D3154] via-[#243B64] to-[#172033] text-white p-12 flex-col justify-between relative overflow-hidden">
        {/* Subtle decorative geometric overlay */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full border border-white/20" />
          <div className="absolute top-1/2 -right-32 w-80 h-80 rounded-full border border-white/10" />
          <div className="absolute bottom-10 left-1/3 w-64 h-64 rounded-full border border-white/15" />
        </div>

        {/* Brand Header */}
        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/10 backdrop-blur-xs border border-white/15 flex items-center justify-center text-white shadow-md">
              <Compass className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-white">
                  Research Compass
                </span>
                <span className="px-2 py-0.5 rounded-full bg-white/10 text-white/80 text-[10px] font-semibold border border-white/15">
                  v2.0
                </span>
              </div>
              <p className="text-xs text-white/70 font-normal">
                Autonomous Scientific Discovery Engine
              </p>
            </div>
          </div>
        </div>

        {/* Central Scientific Value Proposition */}
        <div className="relative z-10 space-y-8 my-auto py-12">
          <div className="space-y-4 max-w-lg">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5 text-blue-300" />
              <span>Evidence-Driven Academic Workflow</span>
            </div>
            <h2 className="text-3xl xl:text-4xl font-extrabold tracking-tight text-white leading-tight">
              From Research Idea to Publication-Ready Paper
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Accelerate your scientific discoveries with automated multi-paper evidence synthesis,
              novelty gap identification, reproducible experimental protocols, and AI co-pilots.
            </p>
          </div>

          {/* Core Pipeline Stage Highlights */}
          <div className="grid grid-cols-2 gap-3 max-w-lg">
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs space-y-1.5">
              <div className="flex items-center gap-2 text-blue-300">
                <BookOpen className="w-4 h-4" />
                <span className="text-xs font-semibold text-white">Literature Search</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-snug">
                Normalized retrieval from OpenAlex with cross-paper comparison.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs space-y-1.5">
              <div className="flex items-center gap-2 text-teal-300">
                <Sparkles className="w-4 h-4" />
                <span className="text-xs font-semibold text-white">Evidence Matrix</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-snug">
                Detect research gaps and contradictions with verified confidence.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs space-y-1.5">
              <div className="flex items-center gap-2 text-indigo-300">
                <FlaskConical className="w-4 h-4" />
                <span className="text-xs font-semibold text-white">Protocol Designer</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-snug">
                Formulate testable hypotheses and step-by-step experimental plans.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-300">
                <FileCheck className="w-4 h-4" />
                <span className="text-xs font-semibold text-white">Paper Generator</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-snug">
                Draft academic manuscripts with APA, IEEE, and Chicago citations.
              </p>
            </div>
          </div>
        </div>

        {/* Security & Multi-User Guarantee Footer */}
        <div className="relative z-10 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-2 text-emerald-400 font-medium">
            <ShieldCheck className="w-4 h-4" />
            <span>Strict User Data Isolation & PostgreSQL RLS</span>
          </div>
          <span className="text-slate-400 text-[11px]">Personal Cloud Workspaces</span>
        </div>
      </div>

      {/* Right Column: Sign In / Sign Up Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 md:p-16">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile Logo Branding (Shown on mobile only) */}
          <div className="lg:hidden flex items-center justify-center gap-2.5 pb-2">
            <div className="w-10 h-10 rounded-xl bg-[#243B64] flex items-center justify-center text-white shadow-md">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-base text-[#172033] leading-tight">
                Research Compass
              </h1>
              <p className="text-[11px] text-[#64748B]">
                From Research Idea to Final Paper
              </p>
            </div>
          </div>

          {/* Form Header Card */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-[#172033]">
              {isSignUp ? "Create Researcher Account" : "Sign In to Your Workspace"}
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B]">
              {isSignUp
                ? "Join Research Compass to begin your isolated scientific workspace."
                : "Sign in to access your private research projects, papers, and findings."}
            </p>
          </div>

          {/* Error Message Box */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <div className="space-y-1">
                <span className="font-semibold">Authentication Error</span>
                <p className="text-[11px] leading-relaxed text-rose-600">{errorMsg}</p>
              </div>
            </div>
          )}

          {/* Main Auth Form Container */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E2E8F0] shadow-sm space-y-5">
            {/* Primary Action: Continue with Google */}
            <div className="space-y-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleAuth}
                disabled={isLoading}
                className="w-full h-11 border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] text-[#1E293B] text-xs sm:text-sm font-semibold flex items-center justify-center gap-3 rounded-xl shadow-xs transition-all cursor-pointer hover:border-[#94A3B8]"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#536DFE]" />
                ) : (
                  <svg className="w-4.5 h-4.5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                )}
                <span>Continue with Google</span>
              </Button>
              <p className="text-[11px] text-center text-[#94A3B8]">
                One-click sign in with your Google research identity
              </p>
            </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center">
              <div className="border-t border-[#E2E8F0] w-full" />
              <span className="bg-white px-3 text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider">
                Or with email
              </span>
            </div>

            {/* Email & Password Form */}
            <form onSubmit={handleEmailAuth} className="space-y-4">
              {isSignUp && (
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#172033]">
                    Full Name
                  </Label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Dr. Elena Rostova"
                      disabled={isLoading}
                      className="pl-9 h-10 border-[#CBD5E1] rounded-lg text-xs"
                      required={isSignUp}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#172033]">
                  Academic / Research Email
                </Label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="researcher@university.edu"
                    disabled={isLoading}
                    className="pl-9 h-10 border-[#CBD5E1] rounded-lg text-xs"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-[#172033]">
                    Password
                  </Label>
                  {!isSignUp && (
                    <span className="text-[11px] text-[#536DFE] hover:underline cursor-pointer">
                      Forgot?
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={isLoading}
                    className="pl-9 h-10 border-[#CBD5E1] rounded-lg text-xs"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-10 bg-[#243B64] hover:bg-[#1D3154] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>{isSignUp ? "Create Personal Account" : "Sign In with Email"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </Button>
            </form>

            {/* Toggle Sign Up / Sign In Mode */}
            <div className="pt-1 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setErrorMsg("");
                }}
                className="text-xs text-[#64748B] hover:text-[#243B64] font-medium transition-colors cursor-pointer"
              >
                {isSignUp ? (
                  <span>
                    Already have a research account?{" "}
                    <strong className="text-[#536DFE]">Sign In</strong>
                  </span>
                ) : (
                  <span>
                    New to Research Compass?{" "}
                    <strong className="text-[#536DFE]">Create an account</strong>
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Privacy & Isolation Note */}
          <div className="p-3 rounded-xl bg-white border border-[#E2E8F0] flex items-center justify-center gap-2 text-center text-[11px] text-[#64748B]">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Your data is isolated and secured with Supabase Row Level Security (RLS).
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
