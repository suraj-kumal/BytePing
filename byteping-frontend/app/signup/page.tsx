"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  SquareActivity,
  CheckCircle,
  Sparkles,
  EyeOff,
  Eye,
} from "lucide-react";
import { ModeToggle } from "@/components/ui/ModeToggle";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, easeOut, easeIn } from "framer-motion";

const SignupPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    password_confirm: "",
  });

  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordC, setShowPasswordC] = useState(false);
  const togglePassword = () => setShowPassword(!showPassword);
  const togglePasswordC = () => setShowPasswordC(!showPasswordC);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear specific field error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: [],
      }));
    }
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    setSuccessMessage("");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_B_URL}/api/auth/signup/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(
          data.Message ||
            "Registration successful! Redirecting for email verification..."
        );

        // Store tokens if needed
        if (data.token) {
          localStorage.setItem("access_token", data.token.access);
          localStorage.setItem("refresh_token", data.token.refresh);
        }

        // Show success animation
        setShowSuccess(true);

        // Reset form
        setFormData({
          first_name: "",
          last_name: "",
          email: "",
          password: "",
          password_confirm: "",
        });

        // Redirect after animation
        setTimeout(() => {
          router.push("/verifyemail?sent=1");
        }, 1500);
      } else {
        // Handle validation errors
        if (data.non_field_errors) {
          setErrors({ general: data.non_field_errors[0] });
        } else {
          setErrors(data);
        }
      }
    } catch (error) {
      console.error("Signup error:", error);
      setErrors({ general: ["An error occurred. Please try again."] });
    } finally {
      setIsLoading(false);
    }
  };

  // Animation variants (same as your provided code)
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

  const successVariants = {
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

        {/* Centered Form */}
        <div className="flex-grow flex items-center justify-center">
          <motion.form
            onSubmit={handleSubmit}
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
                        Account Created!
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Redirecting to email verification...
                      </p>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.h1
              className="text-center text-2xl font-semibold mb-6"
              variants={itemVariants}
            >
              Create an account
            </motion.h1>

            {/* Success Message */}
            <AnimatePresence>
              {successMessage && !showSuccess && (
                <motion.div
                  className="p-3 rounded-md bg-green-100 border border-green-400 text-green-700 text-sm dark:bg-green-900/20 dark:border-green-800 dark:text-green-400"
                  variants={successVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  {successMessage}
                </motion.div>
              )}
            </AnimatePresence>

            {/* General Error Message */}
            <AnimatePresence>
              {errors.general && (
                <motion.div
                  className="p-3 rounded-md bg-red-100 border border-red-400 text-red-700 text-sm dark:bg-red-900/20 dark:border-red-800 dark:text-red-400"
                  variants={successVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  {errors.general}
                </motion.div>
              )}
            </AnimatePresence>

            {/* First Name */}
            <motion.div className="space-y-2" variants={itemVariants}>
              <Input
                type="text"
                placeholder="First Name"
                required
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                className={errors.first_name ? "border-destructive" : ""}
              />
              <AnimatePresence>
                {errors.first_name && (
                  <motion.p
                    className="text-sm text-destructive"
                    variants={errorVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    {errors.first_name[0]}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Last Name */}
            <motion.div className="space-y-2" variants={itemVariants}>
              <Input
                type="text"
                placeholder="Last Name"
                required
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                className={errors.last_name ? "border-destructive" : ""}
              />
              <AnimatePresence>
                {errors.last_name && (
                  <motion.p
                    className="text-sm text-destructive"
                    variants={errorVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    {errors.last_name[0]}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Email */}
            <motion.div className="space-y-2" variants={itemVariants}>
              <Input
                type="email"
                placeholder="Email"
                required
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={errors.email ? "border-destructive" : ""}
              />
              <AnimatePresence>
                {errors.email && (
                  <motion.p
                    className="text-sm text-destructive"
                    variants={errorVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    {errors.email[0]}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Password */}
            <motion.div className="relative" variants={itemVariants}>
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                required
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={errors.password ? "border-destructive" : ""}
              />
              <button
                type="button"
                onClick={togglePassword}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
              <AnimatePresence>
                {errors.password && (
                  <motion.p
                    className="text-sm text-destructive"
                    variants={errorVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    {errors.password[0]}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Confirm Password */}
            <motion.div className="relative" variants={itemVariants}>
              <Input
                type={showPasswordC ? "text" : "password"}
                placeholder="Confirm Password"
                required
                name="password_confirm"
                value={formData.password_confirm}
                onChange={handleInputChange}
                className={errors.password_confirm ? "border-destructive" : ""}
              />
              <button
                type="button"
                onClick={togglePasswordC}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPasswordC ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
              <AnimatePresence>
                {errors.password_confirm && (
                  <motion.p
                    className="text-sm text-destructive"
                    variants={errorVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    {errors.password_confirm[0]}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Button
                type="submit"
                className="w-full cursor-pointer"
                disabled={isLoading || showSuccess}
              >
                <motion.span
                  animate={
                    isLoading ? { opacity: [1, 0.5, 1] } : { opacity: 1 }
                  }
                  transition={
                    isLoading ? { repeat: Infinity, duration: 1.5 } : {}
                  }
                >
                  {isLoading
                    ? "Signing Up..."
                    : showSuccess
                    ? "Account Created!"
                    : "Sign Up"}
                </motion.span>
              </Button>
            </motion.div>

            <motion.div
              className="flex justify-between text-sm text-muted-foreground"
              variants={itemVariants}
            >
              <p className="text-sm text-center text-muted-foreground">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="underline hover:text-primary transition-colors"
                >
                  Login
                </Link>
              </p>
            </motion.div>
          </motion.form>
        </div>

        <footer className="py-6 text-center text-muted-foreground border-t border-border/50 bg-card/20 backdrop-blur-sm">
          <p>&copy; 2024 BytePing. All rights reserved.</p>
        </footer>
      </main>
    </div>
  );
};

export default SignupPage;
