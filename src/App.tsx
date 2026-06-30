import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Services } from "@/components/Services";
import { About } from "@/components/About";
import { Branches } from "@/components/Branches";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";
import { Products } from "@/pages/Products";
import { ProductDetail } from "@/pages/ProductDetail";
import { AdminLogin } from "@/pages/admin/AdminLogin";
import { AdminDashboard } from "@/pages/admin/AdminDashboard";
import { AdminProducts } from "@/pages/admin/AdminProducts";
import { AdminProductForm } from "@/pages/admin/AdminProductForm";
import { AdminCategories } from "@/pages/admin/AdminCategories";
import { AdminStaff } from "@/pages/admin/AdminStaff";
import { AdminRatings } from "@/pages/admin/AdminRatings";
import { AdminForgotPassword } from "@/pages/admin/AdminForgotPassword";
import { AdminResetPassword } from "@/pages/admin/AdminResetPassword";
import { AdminSettings } from "@/pages/admin/AdminSettings";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { SpeedInsights } from "@vercel/speed-insights/react";

const queryClient = new QueryClient();

function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-accent selection:text-white">
      <Navbar />
      <main>
        <Hero />
        <Services />
        <About />
        <Branches />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-4xl font-black text-primary mb-4">404</h1>
        <p className="text-muted-foreground mb-6">الصفحة غير موجودة</p>
        <a href="/" className="text-accent underline">العودة للرئيسية</a>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      {/* Admin routes */}
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/forgot-password" component={AdminForgotPassword} />
      <Route path="/admin/reset-password" component={AdminResetPassword} />
      <Route path="/admin/settings" component={AdminSettings} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/products/new" component={AdminProductForm} />
      <Route path="/admin/products/:id" component={AdminProductForm} />
      <Route path="/admin/products" component={AdminProducts} />
      <Route path="/admin/categories" component={AdminCategories} />
      <Route path="/admin/staff" component={AdminStaff} />
      <Route path="/admin/ratings" component={AdminRatings} />
      <Route path="/admin">
        {() => { window.location.replace("/admin/login"); return null; }}
      </Route>

      {/* Public routes */}
      <Route path="/products/:id" component={ProductDetail} />
      <Route path="/products" component={Products} />
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
          <WhatsAppFloat />
        </WouterRouter>
        <Toaster />
        <SpeedInsights />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
