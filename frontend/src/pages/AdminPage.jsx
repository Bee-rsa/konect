import { BarChart, PlusCircle, ShoppingBasket, Package } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import AnalyticsTab from "../components/AnalyticsTab";
import ProductsList from "../components/ProductsList";
import OrdersTab from "../components/OrdersTab";
import { useProductStore } from "../stores/useProductStore";
import DesignProductForm from "../forms/DesignProductForm"; // Import DesignProductForm
import PrintProductForm from "../forms/printProductForm"; // Import PrintProductForm
import SignsProductForm from "../forms/signsProductForm"; // Import SignsProductForm
import BrandingProductForm from "../forms/BrandingProductForm"; // Import BrandingProductForm
import PaintProductForm from "../forms/paintProductForm"; // Import PaintProductForm

// Main Tabs
const mainTabs = [
  { id: "create", label: "Create Product", icon: PlusCircle },
  { id: "products", label: "Products", icon: ShoppingBasket },
  { id: "orders", label: "Orders", icon: Package },
  { id: "analytics", label: "Analytics", icon: BarChart },
];

// Sub-tabs for Create Product
const createProductSubTabs = [
  { id: "design", label: "Design Category", colorClass: "bg-blue-800" },
  { id: "print", label: "Print Category", colorClass: "bg-pink-700" },
  { id: "signs", label: "Signs Category", colorClass: "bg-yellow-500" },
  { id: "branding", label: "Branding Category", colorClass: "bg-red-700" },
  { id: "paint", label: "Paint Category", colorClass: "bg-lime-400" },
];

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState("create");
  const [activeSubTab, setActiveSubTab] = useState("design"); // State for active sub-tab
  const { fetchAllProducts, products } = useProductStore();

  useEffect(() => {
    fetchAllProducts();
  }, [fetchAllProducts]);

  return (
    <div className=' mt-8 relative overflow-hidden bg-black'>
      <div className='relative z-10 container mx-auto px-4 py-16'>
        <motion.h1
          className='text-4xl font-bold mb-8 text-emerald-400 text-center'
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Admin Dashboard
        </motion.h1>

        {/* Main Tabs */}
        <div className='flex justify-center mb-8'>
          {mainTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-2 mx-2 rounded-md transition-colors duration-200 ${
                activeTab === tab.id
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              } ${
                // Hide "Create Product" and "Products" tabs on mobile
                (tab.id === "create" || tab.id === "products") && "hidden md:flex"
              }`}
            >
              <tab.icon className='mr-2 h-5 w-5' />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Sections */}
        {activeTab === "create" && (
          <motion.div
            className='bg-black backdrop-blur-lg rounded-xl p-8 shadow-2xl'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Sub-tabs for Create Product */}
            <div className='justify-center mb-6 hidden md:flex'> {/* Hide on mobile */}
              {createProductSubTabs.map((subTab) => (
                <button
                  key={subTab.id}
                  onClick={() => setActiveSubTab(subTab.id)}
                  className={`flex items-center px-4 py-2 mx-2 rounded-md transition-colors duration-200 ${
                    activeSubTab === subTab.id
                      ? `${subTab.colorClass} text-white`
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  {subTab.label}
                </button>
              ))}
            </div>

            {/* Sub-tab Content with the respective product form */}
            <div className="hidden md:block"> {/* Hide all product forms on mobile */}
              {activeSubTab === "design" && <DesignProductForm />}
              {activeSubTab === "print" && <PrintProductForm />}
              {activeSubTab === "signs" && <SignsProductForm />}
              {activeSubTab === "branding" && <BrandingProductForm />}
              {activeSubTab === "paint" && <PaintProductForm />}
            </div>
          </motion.div>
        )}

        {/* Products Tab */}
        {activeTab === "products" && (
          <motion.div
            className='bg-black backdrop-blur-lg rounded-xl p-8 shadow-2xl hidden md:block' // Hide on mobile
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ProductsList products={products} />
          </motion.div>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <motion.div
            className='bg-black backdrop-blur-lg rounded-xl p-8 shadow-2xl'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <OrdersTab />
          </motion.div>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && <AnalyticsTab />}
      </div>
    </div>
  );
};

export default AdminPage;