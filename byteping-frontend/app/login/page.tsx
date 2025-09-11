"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "@/app/ui/global.css";
import { ModeToggle } from "@/components/ui/ModeToggle";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  SquareActivity,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence, easeOut, easeIn } from "framer-motion";

// Add animation variants
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

const errorVariants = {
  hidden: { opacity: 0, height: 0, marginTop: 0 },
  visible: {
    opacity: 1,
    height: "auto",
    marginTop: 8,
    transition: {
      duration: 0.3,
      ease: easeOut,
    },
  },
  exit: {
    opacity: 0,
    height: 0,
    marginTop: 0,
    transition: {
      duration: 0.2,
      ease: easeIn,
    },
  },
};

export default function Page() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const redirectToDashboard = () => {
    const refersh_token = localStorage.getItem("refresh_token");
    const access_token = localStorage.getItem("access_token");

    if (access_token && refersh_token) {
      return router.push("/dashboard");
    }
    return;
  };

  useEffect(() => {
    redirectToDashboard();
  });
  const handleInputChange = (e: { target: { name: any; value: any } }) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_B_URL}/api/auth/login/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (data.success) {
        // Store tokens in localStorage
        localStorage.setItem("access_token", data.token.access);
        localStorage.setItem("refresh_token", data.token.refresh);

        // Show success animation
        setShowSuccess(true);

        // Redirect after animation
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      } else {
        // Handle validation errors
        if (data.error) {
          const errorMessages = Object.values(data.error).flat();
          setError(errorMessages.join(", "));
        } else {
          setError("Login failed. Please try again.");
        }
      }
    } catch (err) {
      setError("Network error. Please check your connection and try again.");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  const togglePassword = () => setShowPassword(!showPassword);

  return (
    <div className="min-h-screen">
      <main className="relative flex flex-col p-4 md:p-6 min-h-screen">
        <motion.div
          className="flex justify-between w-full"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Link href="/">
            <SquareActivity className="h-6 w-6 text-primary m-1" />
          </Link>
          <ModeToggle />
        </motion.div>

        <div className="h-[80vh] w-full flex justify-center items-center">
          <motion.div
            className="w-full max-w-md p-6 md:p-8 rounded-lg shadow-md border border-border space-y-4 relative overflow-hidden"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Success Animation Overlay */}
            <AnimatePresence>
              {showSuccess && (
                <motion.div
                  className="absolute inset-0 bg-background/95 backdrop-blur-sm flex items-center justify-center z-50"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="text-center space-y-4">
                    <motion.div
                      className="relative"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        delay: 0.2,
                        type: "spring",
                        stiffness: 200,
                      }}
                    >
                      <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                      <Sparkles className="h-6 w-6 text-yellow-500 absolute -top-2 -right-2 animate-pulse" />
                    </motion.div>
                    <motion.div
                      className="space-y-2"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      <h3 className="text-lg font-semibold text-foreground">
                        Login Successful!
                      </h3>
                      <p className="text-sm text-foreground">
                        Redirecting to dashboard...
                      </p>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.h1
              className="text-foreground text-center font-bold text-xl mb-6"
              variants={itemVariants}
            >
              Login to BytePing
            </motion.h1>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md"
                  variants={errorVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <p className="text-destructive text-sm">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-4 shadow-custom">
              <motion.div variants={itemVariants}>
                <Input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="input-enhanced shadow-custom"
                  required
                  disabled={loading}
                />
              </motion.div>

              <motion.div className="relative" variants={itemVariants}>
                <Input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="input-enhanced pr-10"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={togglePassword}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors"
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Button
                  type="submit"
                  className="w-full btn-primary text-primary-foreground"
                  disabled={loading || showSuccess}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                  ) : showSuccess ? (
                    "Success!"
                  ) : (
                    "Login"
                  )}
                </Button>
              </motion.div>
            </form>

            <motion.div
              className="flex justify-between text-sm text-muted-foreground mt-6"
              variants={itemVariants}
            >
              <Link
                href="/signup"
                className="hover:underline hover:text-primary transition-colors"
              >
                Don't have an account?
              </Link>
              <Link
                href="/forgotpassword"
                className="hover:underline hover:text-primary transition-colors"
              >
                Forgot password?
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
