// App.jsx
import { Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ProtectedRoute } from './components/ProtectedRoute';

// Components
import { Navbar } from "./components/Navbar";
import { SearchBar } from "./components/SearchBar";
import { Footer } from "./components/Footer";
import { MobileAddToCartFAB } from "./components/MobileAddToCartFAB";

// Pages
import { Home } from "./pages/Home";
import { About } from "./pages/About";
import { Collection } from "./pages/Collection";
import { Contact } from "./pages/Contact";
import { Product } from "./pages/Product";
import { Orders } from "./pages/Orders";
import { Login } from "./pages/Login";
import Register from './pages/Register'; 
import { PlaceOrder } from "./pages/PlaceOrder";
import { Cart } from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsConditions from "./pages/TermsConditions";
import NotFound from "./pages/NotFound";


// ============================================================
// ScrollToTop Component (for smooth navigation)
// ============================================================
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);

  return null;
};

// ============================================================
// Main App Component
// ============================================================
export const App = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Navbar */}
      <Navbar />
      
      {/* Search Bar */}
      <SearchBar />
      
      {/* Toast Notifications */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        className="z-50"
      />
      
      {/* Scroll to Top on Route Change */}
      <ScrollToTop />
      
      {/* Main Content */}
      <main className="flex-1 py-5 px-4 sm:px-[5vw] md:px-[6vw] lg:px-[7vw]">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/collection" element={<Collection />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/product/:productId" element={<Product />} />
          
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Routes (User must be logged in) */}
         <Route 
            path="/orders" 
            element={
               <ProtectedRoute>
                  <Orders />
               </ProtectedRoute>
            } 
            />
            <Route 
            path="/cart" 
            element={
               <ProtectedRoute>
                  <Cart />
               </ProtectedRoute>
            } 
            />
            <Route 
            path="/wishlist" 
            element={
               <ProtectedRoute>
                  <Wishlist />
               </ProtectedRoute>
            } 
            />
            <Route 
            path="/place-order" 
            element={
               <ProtectedRoute>
                  <PlaceOrder />
               </ProtectedRoute>
            } 
            />
          
          {/* Legal Pages */}
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsConditions />} />
          
          {/* 404 - Not Found */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      
      {/* Footer */}
      <Footer />
      
      {/* Mobile Floating Action Button for Cart */}
      <MobileAddToCartFAB />
    </div>
  );
};

export default App;