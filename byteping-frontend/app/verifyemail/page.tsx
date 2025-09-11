"use client";
import Image from "next/image";
import { ModeToggle } from "@/components/ui/ModeToggle";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useState, useEffect } from "react";
import {
  motion,
  AnimatePresence,
  useAnimation,
  easeOut,
  easeIn,
} from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sent = searchParams.get("sent");

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [emailSent, setEmailSent] = useState(sent === "1");

  useEffect(() => {
    if (sent === "1") {
      setMessage("Email verification link has been sent to your inbox!");
      setEmailSent(true);
    } else if (sent === "0") {
      setMessage("");
      setEmailSent(false);
    }
  }, [sent]);

  const refreshAccessToken = async (): Promise<string | null> => {
    try {
      const refreshToken = localStorage.getItem("refresh_token");

      if (!refreshToken) return null;

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_B_URL}/api/token/refresh/`,
        { refresh: refreshToken },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const newAccessToken = response.data.access;
      localStorage.setItem("access_token", newAccessToken);
      return newAccessToken;
    } catch (err) {
      console.error("Failed to refresh access token", err);
      return null;
    }
  };
  const handleResendEmail = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setMessage("");

    const sendRequest = async (token: string) => {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_B_URL}/api/auth/email/verification-notification/`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          validateStatus: (status) => status >= 200 && status < 600,
        }
      );
    };

    try {
      let token = localStorage.getItem("refresh_token");

      if (!token) {
        setError("Please login first to verify your email.");
        router.push("/login");
        return;
      }

      let response = await sendRequest(token);

      if (response.status === 401) {
        // Try to refresh token and retry
        const newToken = await refreshAccessToken();

        if (!newToken) {
          setError("Session expired. Please log in again.");
          router.push("/login");
          return;
        }

        token = newToken;
        response = await sendRequest(token);
      }

      if (response.status === 200) {
        setMessage(
          response.data.message ||
            "Email verification link has been sent to your inbox!"
        );
        setEmailSent(true);
        router.replace("/verifyemail?sent=1");
      } else if (response.status === 400) {
        setError(response.data.message || "Email is already verified");
        setEmailSent(false);
        router.replace("/verifyemail?sent=0");
      } else {
        setError(
          response.data.message ||
            "Failed to send verification email. Please try again."
        );
        setEmailSent(false);
        router.replace("/verifyemail?sent=0");
      }
    } catch (error: any) {
      console.error("Email verification error:", error);

      if (error.response?.status === 429) {
        setError(
          "Too many requests. Please wait a moment before trying again."
        );
      } else if (error.response?.status >= 500) {
        setError("Server error. Please try again later.");
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.15,
        ease: easeOut,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        ease: easeOut,
      },
    },
  };

  const iconVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        duration: 0.5,
        ease: easeOut,
      },
    },
  };

  const messageVariants = {
    hidden: { opacity: 0, scale: 0.95, y: -10 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: easeOut,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: -10,
      transition: {
        duration: 0.3,
        ease: easeIn,
      },
    },
  };

  return (
    <div className="min-h-screen">
      <main className="relative flex flex-col p-4 md:p-6 min-h-screen">
        {/* Mode Toggle in top-right corner */}
        <motion.div
          className="absolute top-4 right-4"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            delay: 0.2,
            ease: easeOut,
          }}
        >
          <ModeToggle />
        </motion.div>

        {/* Centered Content */}
        <div className="flex-grow flex items-center justify-center">
          <motion.div
            className="w-full max-w-md p-6 md:p-8 rounded-lg shadow-md border border-border space-y-6 text-center"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Email Icon */}
            <motion.div className="flex justify-center" variants={iconVariants}>
              <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <Mail className="w-10 h-10 text-blue-600 dark:text-blue-400" />
              </div>
            </motion.div>

            {/* Title */}
            <motion.h1
              className="text-2xl font-semibold"
              variants={itemVariants}
            >
              Please verify your email
            </motion.h1>

            {/* Description */}
            <motion.p
              className="text-muted-foreground text-sm"
              variants={itemVariants}
            >
              {emailSent
                ? "We've sent a verification link to your email address. Click the link to verify your account."
                : "Click the button below to receive a verification link in your email."}
            </motion.p>

            {/* Success Message */}
            <AnimatePresence>
              {message && (
                <motion.div
                  className="flex items-center justify-center gap-2 p-3 rounded-md bg-green-100 border border-green-400 text-green-700 text-sm"
                  variants={messageVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <CheckCircle className="w-4 h-4" />
                  {message}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  className="flex items-center justify-center gap-2 p-3 rounded-md bg-red-100 border border-red-400 text-red-700 text-sm"
                  variants={messageVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Resend Button */}
            <motion.form onSubmit={handleResendEmail} variants={itemVariants}>
              <Button
                type="submit"
                className="w-full max-w-xs"
                disabled={isLoading}
              >
                <motion.span
                  className="flex items-center justify-center gap-2"
                  animate={
                    isLoading ? { opacity: [1, 0.5, 1] } : { opacity: 1 }
                  }
                  transition={
                    isLoading ? { repeat: Infinity, duration: 1.5 } : {}
                  }
                >
                  {isLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
                  {isLoading
                    ? "Sending..."
                    : emailSent
                    ? "Resend Verification Link"
                    : "Send Verification Link"}
                </motion.span>
              </Button>
            </motion.form>

            {/* Additional Actions */}
            <motion.div
              className="space-y-2 text-sm text-muted-foreground"
              variants={itemVariants}
            >
              <p>Didn't receive the email? Check your spam folder.</p>
              <div className="flex justify-center gap-4">
                <motion.button
                  onClick={() => router.push("/login")}
                  className="underline hover:text-primary transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ ease: easeOut }}
                >
                  Back to Login
                </motion.button>
                <motion.button
                  onClick={() => router.push("/dashboard")}
                  className="underline hover:text-primary transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ ease: easeOut }}
                >
                  Go to Dashboard
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
