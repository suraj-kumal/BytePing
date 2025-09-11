"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { SquareActivity } from "lucide-react";
import { ModeToggle } from "@/components/ui/ModeToggle";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Globe,
  Bell,
  Shield,
  LayoutDashboard,
  Lock,
  UserPlus,
  Zap,
  Eye,
  AlertTriangle,
  Clock,
  CheckCircle,
  Mail,
} from "lucide-react";

export default function Home() {
  const router = useRouter();
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const howItWorksRef = useRef(null);
  const ctaRef = useRef(null);

  // Fix hydration mismatch by using state for auth token
  const [hasAuthToken, setHasAuthToken] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const token = localStorage.getItem("refresh_token");
    setHasAuthToken(!!token);
  }, []);

  const heroInView = useInView(heroRef, { once: true, margin: "-100px" });
  const featuresInView = useInView(featuresRef, {
    once: true,
    margin: "-100px",
  });
  const howItWorksInView = useInView(howItWorksRef, {
    once: true,
    margin: "-100px",
  });
  const ctaInView = useInView(ctaRef, { once: true, margin: "-100px" });

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Animated background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5 pointer-events-none" />

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/30 backdrop-blur-md border-b border-border/50 supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex justify-between items-center">
          <Link href="/">
            <div className="flex items-center space-x-2 cursor-pointer">
              <motion.div
                initial={{ rotate: -180, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
                whileHover={{ rotate: 15, scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <SquareActivity className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </motion.div>
              <span className="text-lg sm:text-xl font-bold text-primary">
                Byte Ping
              </span>
            </div>
          </Link>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <ModeToggle />
            {hasAuthToken ? (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg text-sm sm:text-base px-3 sm:px-4 py-2 cursor-pointer"
                  onClick={() => router.push("/dashboard")}
                >
                  <span className="hidden xs:inline">Go to Dashboard</span>
                  <span className="xs:hidden">Dashboard</span>
                  <LayoutDashboard className="ml-1 sm:ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </motion.div>
            ) : (
              <>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="ghost"
                    className="text-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer text-sm sm:text-base px-3 sm:px-4 py-2"
                    onClick={() => router.push("/login")}
                  >
                    Login
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg cursor-pointer text-sm sm:text-base px-3 sm:px-4 py-2"
                    onClick={() => router.push("/signup")}
                  >
                    Sign Up
                  </Button>
                </motion.div>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="min-h-screen flex items-center justify-center pt-20 relative overflow-hidden"
      >
        {/* Hero background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 pointer-events-none" />
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, 50, 0],
            scale: [1.2, 1, 1.2],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        <div className="text-center max-w-4xl mx-auto px-4 relative z-10">
          <motion.h1
            className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 50 }}
            animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Monitor Your Services{" "}
            <motion.span
              className="text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={heroInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              24/7
            </motion.span>
          </motion.h1>
          <motion.p
            className="text-xl md:text-2xl mb-8 text-muted-foreground max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Keep your web services running smoothly with real-time monitoring,
            instant alerts, and comprehensive uptime analytics. Never miss a
            downtime again.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              size="lg"
              onClick={() => router.push("/signup")}
              className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer"
            >
              Start Monitoring Free <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-20 relative">
        <div className="absolute inset-0 bg-accent/5 backdrop-blur-sm" />
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <motion.h2
            className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 30 }}
            animate={
              featuresInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }
            }
            transition={{ duration: 0.6 }}
          >
            Powerful Monitoring Features
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Globe className="h-8 w-8 text-primary" />,
                title: "Web Service Monitoring",
                description:
                  "Add and monitor unlimited web services. Track uptime, response times, and service health in real-time.",
              },
              {
                icon: <Bell className="h-8 w-8 text-primary" />,
                title: "Instant Email Alerts",
                description:
                  "Get notified immediately when services go down. Configure custom alert thresholds and notification preferences.",
              },
              {
                icon: <Eye className="h-8 w-8 text-primary" />,
                title: "Monitoring Dashboard",
                description:
                  "Monitor all your services from a centralized dashboard. View status, metrics, and performance at a glance.",
              },
              {
                icon: <Clock className="h-8 w-8 text-primary" />,
                title: "Uptime Analytics",
                description:
                  "Track uptime percentages, response time trends, and historical performance data with detailed reports.",
              },
              {
                icon: <Shield className="h-8 w-8 text-primary" />,
                title: "Secure Authentication",
                description:
                  "Full login, signup, email verification, password reset, and multi-user support with enterprise-grade security.",
              },
              {
                icon: <Zap className="h-8 w-8 text-primary" />,
                title: "Lightning Fast Checks",
                description:
                  "Monitor services every interval with sub-second response times. Get accurate status updates instantly.",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={
                  featuresInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }
                }
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="h-full"
              >
                <Card className="bg-card/50 backdrop-blur-md border border-border/50 hover:bg-card/70 transition-all duration-300 hover:shadow-xl supports-[backdrop-filter]:bg-card/30 h-full cursor-pointer">
                  <CardHeader>
                    <motion.div
                      className="mb-2"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      {feature.icon}
                    </motion.div>
                    <CardTitle className="text-foreground">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-muted-foreground">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section ref={howItWorksRef} className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4">
          <motion.h2
            className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 30 }}
            animate={
              howItWorksInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }
            }
            transition={{ duration: 0.6 }}
          >
            How Byte Ping Works
          </motion.h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                icon: <UserPlus className="h-6 w-6 text-primary" />,
                title: "1. Sign Up & Verify",
                description:
                  "Create your account with secure email verification and password protection.",
              },
              {
                icon: <Globe className="h-6 w-6 text-primary" />,
                title: "2. Add Your Services",
                description:
                  "Simply enter your website URLs and configure monitoring settings for each service.",
              },
              {
                icon: <Eye className="h-6 w-6 text-primary" />,
                title: "3. Monitor in Real-time",
                description:
                  "Watch your services on the dashboard with live status updates and performance metrics.",
              },
              {
                icon: <Mail className="h-6 w-6 text-primary" />,
                title: "4. Get Instant Alerts",
                description:
                  "Receive email notifications the moment any service goes down or experiences issues.",
              },
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={
                  howItWorksInView
                    ? { opacity: 1, y: 0 }
                    : { opacity: 0, y: 30 }
                }
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="bg-card/50 backdrop-blur-md border border-border/50 rounded-lg p-6 hover:bg-card/70 transition-all duration-300 hover:shadow-xl supports-[backdrop-filter]:bg-card/30 cursor-pointer"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <motion.div
                    className="p-2 bg-primary/10 rounded-lg"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    {step.icon}
                  </motion.div>
                  <h3 className="text-xl font-semibold text-foreground">
                    {step.title}
                  </h3>
                </div>
                <p className="text-muted-foreground">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-accent/5 backdrop-blur-sm" />
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <motion.h2
            className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 30 }}
            animate={
              howItWorksInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }
            }
            transition={{ duration: 0.6 }}
          >
            Why Choose Byte Ping?
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <CheckCircle className="h-8 w-8 text-green-500" />,
                title: "99.9% Uptime Guarantee",
                description:
                  "Our monitoring infrastructure ensures reliable tracking with minimal false positives.",
              },
              {
                icon: <Zap className="h-8 w-8 text-yellow-500" />,
                title: "Lightning Fast Detection",
                description:
                  "Detect downtime in within seconds with our global monitoring network.",
              },
              {
                icon: <Lock className="h-8 w-8 text-blue-500" />,
                title: "Enterprise Security",
                description:
                  "Bank-level encryption and security measures to protect your monitoring data.",
              },
            ].map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={
                  howItWorksInView
                    ? { opacity: 1, y: 0 }
                    : { opacity: 0, y: 30 }
                }
                transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <Card className="bg-card/50 backdrop-blur-md border border-border/50 hover:bg-card/70 transition-all duration-300 hover:shadow-xl supports-[backdrop-filter]:bg-card/30 h-full cursor-pointer text-center">
                  <CardHeader>
                    <motion.div
                      className="mx-auto mb-2"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      {benefit.icon}
                    </motion.div>
                    <CardTitle className="text-foreground">
                      {benefit.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-muted-foreground">
                      {benefit.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section ref={ctaRef} className="py-20 text-center relative">
        <div className="absolute inset-0 bg-accent/5 backdrop-blur-sm" />
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <motion.h2
            className="text-4xl font-bold mb-6 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 30 }}
            animate={ctaInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6 }}
          >
            Never Miss Another Downtime
          </motion.h2>
          <motion.p
            className="text-xl mb-8 text-muted-foreground"
            initial={{ opacity: 0, y: 30 }}
            animate={ctaInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Join thousands of developers and businesses who trust Byte Ping to
            keep their services running smoothly.
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 30 }}
            animate={ctaInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                size="lg"
                onClick={() => router.push("/signup")}
                className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer"
              >
                Start Monitoring Now <UserPlus className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                size="lg"
                variant="outline"
                onClick={() => router.push("/login")}
                className="border-primary/50 text-primary hover:bg-primary/10 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
              >
                Already have an account? Login
              </Button>
            </motion.div>
          </motion.div>

          {/* Stats Section */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={ctaInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            {[
              { number: "99.9%", label: "Uptime SLA" },
              { number: "<60s", label: "Detection Time" },
              { number: "24/7", label: "Monitoring" },
              { number: "Global", label: "Coverage" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                className="text-center"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <div className="text-2xl md:text-3xl font-bold text-primary">
                  {stat.number}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 text-center text-muted-foreground border-t border-border/50 bg-card/20 backdrop-blur-sm">
        <p>&copy; 2025 Byte Ping. All rights reserved.</p>
      </footer>
    </div>
  );
}
