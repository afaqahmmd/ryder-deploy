// connect shopify store modal

import React from "react";
import { SiShopify } from "react-icons/si";
import { MdInfo, MdStore, MdSecurity, MdClose } from "react-icons/md";
import step1 from "@/assets/images/storeSteps/step1.png";
import step2 from "@/assets/images/storeSteps/step2.png";
const ConnectStoreModal = ({ isOpen, onClose, onNavigateToStep }) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleConnectStore = () => {
    if (onNavigateToStep) {
      onNavigateToStep("stores");
    }
    onClose();
  };

  return (
    <div
      className="fixed min-w-[500px] inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Content */}
        <div className="p-6">
          <div className="text-center">
            <div className="bg-blue-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <SiShopify className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl flex items-center justify-center font-bold text-gray-900 mb-4">
              How to connect your{" "}
              <span className="text-green-600 mx-2">
                <SiShopify className="w-6 h-6" />
              </span>{" "}
              store
            </h3>

            {/* Why this step is important */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-start mb-2">
                <MdInfo className="w-5 h-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                <h4 className="font-semibold text-red-800 text-base sm:text-lg">
                  Why is this required?
                </h4>
              </div>
              <p className="text-red-700 text-sm leading-relaxed text-left">
                Connecting your Shopify store is the foundation of your AI
                salesperson. This allows us to access your product catalog,
                understand your brand, and provide accurate product
                recommendations to your customers. Without this connection, your
                AI salesperson won't be able to help customers find the right
                products.
              </p>
            </div>

            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              Your AI salesperson needs to know about your products to help
              customers. Let's connect your Shopify store to get started.
            </p>

            <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-gray-800 mb-4 text-base sm:text-lg flex items-center justify-center sm:justify-start">
                Steps to connect your store:
              </h4>
              <ol className="text-left text-gray-700 space-y-4 text-sm">
                <li className="flex items-start">
                  <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5 flex-shrink-0">
                    1
                  </span>
                  <div>
                    <span className="font-medium">
                      Navigate to Stores Section
                    </span>
                    <p className="text-gray-600 mt-1">
                      Click on the <strong>"Stores"</strong> option in the left
                      sidebar menu
                    </p>
                    <img
                      src={step1}
                      alt="stores"
                      className="w-[200px] h-auto"
                    />
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5 flex-shrink-0">
                    2
                  </span>
                  <div>
                    <span className="font-medium">Add Your Store</span>
                    <p className="text-gray-600 mt-1">
                      Click the <strong>"Add Store"</strong> button to begin the
                      connection process
                    </p>
                    <img src={step2} alt="stores2" className="w-full h-auto" />
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5 flex-shrink-0">
                    3
                  </span>
                  <div>
                    <span className="font-medium">Complete Connection</span>
                    <p className="text-gray-600 mt-1">
                      When you click on Add Store, follow step-by-step guide
                      there to obtain your Shopify API keys from your store
                      admin
                    </p>
                  </div>
                </li>
              </ol>

              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start">
                  <MdSecurity className="w-4 h-4 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                  <div className="text-yellow-800 text-xs">
                    <strong>Security Note:</strong> Your store credentials are
                    encrypted and stored securely. We only use them to access
                    your product data.
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full min-h-24 bg-red-200">
              <video className="w-full h-auto rounded-lg" controls>
                <source src="/videos/connect-store.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex flex-col sm:flex-row gap-3 p-6 pt-0">
          <button
            onClick={onClose}
            className="flex-1 sm:flex-none px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Close
          </button>
          <button
            onClick={handleConnectStore}
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center font-medium"
          >
            <SiShopify className="w-5 h-5 mr-2" />
            Take me to connection page
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConnectStoreModal;
