import { Route, Routes } from "react-router-dom"
import { Home } from "./pages/Home"
import { Navbar } from "./components/Navbar"
import { About } from "./pages/About"
import { Collection } from "./pages/Collection"
import { Contact } from "./pages/Contact"
import { Product } from "./pages/Product"
import { Orders } from "./pages/Orders"
import { Login } from "./pages/Login"
import { PlaceOrder } from "./pages/PlaceOrder"
import { Cart } from "./pages/Cart"
import { SearchBar } from "./components/SearchBar"
import { Footer } from "./components/Footer"
import { ToastContainer } from "react-toastify"
import Wishlist from "./pages/Wishlist"
import PrivacyPolicy from "./pages/PrivacyPolicy"
import TermsConditions from "./pages/TermsConditions"

export const App = () =>{


   return(

    <div className="py-5 px-4 sm:px-[5vw] md:px-[6vw] lg:px-[7vw]">
      <Navbar/>
      <SearchBar/>
      <ToastContainer/>
       <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/about" element={<About/>}/>
        <Route path="/collection" element={<Collection/>}/>
        <Route path="/contact" element={<Contact/>}/>
        <Route path="/product/:productId" element={<Product/>}/>
        <Route path="/orders" element={<Orders/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="/place-order" element={<PlaceOrder/>}/>
        <Route path="cart" element={<Cart/>}/>
        <Route path="wishlist" element={<Wishlist/>}/>
        <Route path="privacy" element={<PrivacyPolicy/>}/>
        <Route path="terms" element={<TermsConditions/>}/>
       </Routes>
       <Footer/>
    </div>
   )
}

export default App;