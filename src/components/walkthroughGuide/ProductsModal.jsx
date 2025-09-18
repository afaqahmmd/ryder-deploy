// connect shopify store modal

import React from "react";
import { SiShopify } from "react-icons/si";
import {
  MdInfo,
  MdStore,
  MdSecurity,
  MdClose,
  MdInventory,
  MdSpeed,
} from "react-icons/md";
import step1 from "@/assets/images/storeSteps/step1.png";
import step2 from "@/assets/images/storeSteps/step2.png";
const SyncProductsModal = ({ isOpen, onClose, onNavigateToStep }) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed min-w-[500px] inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      
      {/* modal content */}
      <div className="p-6"> 

        <div className="bg-green-100 p-3 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
          <MdInventory className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          'Step 2: Sync Your Product Catalog'
        </h3>

        {/* Why this step is important */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <div className="flex items-start mb-2">
            <MdInfo className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
            <h4 className="font-semibold text-green-800 text-lg">
              Why is this important?
            </h4>
          </div>
          <p className="text-green-700 text-sm leading-relaxed">
            Your AI salesperson needs to know about every product you sell to
            provide accurate recommendations. This step ensures all your
            products, including their descriptions, prices, images, and
            availability, are properly synced from your Shopify store to our
            system. This data will be used to create a smart product database in
            the next step.
          </p>
        </div>

        <p className="text-sm text-gray-600 mb-4 max-w-3xl mx-auto leading-relaxed">
          Now we need to sync all your products from your Shopify store to our
          system. This ensures your AI salesperson has the most up-to-date
          information about your inventory.
        </p>

        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 flex-1">
          <h4 className="font-semibold text-gray-800 mb-3 text-lg flex items-center">
            <MdInventory className="w-5 h-5 mr-2 text-green-600" />
            How to sync your products:
          </h4>
          <ol className="text-left text-gray-700 space-y-3 text-sm">
            <li className="flex items-start">
              <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5 flex-shrink-0">
                1
              </span>
              <div>
                <span className="font-medium">Access Products Section</span>
                <p className="text-gray-600 mt-1">
                  Go to the <strong>"Products"</strong> section in the left
                  sidebar menu
                </p>
              </div>
            </li>
            <li className="flex items-start">
              <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5 flex-shrink-0">
                2
              </span>
              <div>
                <span className="font-medium">Wait for Initial Load</span>
                <p className="text-gray-600 mt-1">
                  The system will automatically start syncing your products -
                  this may take a few moments
                </p>
              </div>
            </li>
            <li className="flex items-start">
              <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5 flex-shrink-0">
                3
              </span>
              <div>
                <span className="font-medium">Verify Product Count</span>
                <p className="text-gray-600 mt-1">
                  Check that the total number of products matches what you see
                  in your Shopify admin
                </p>
              </div>
            </li>
            <li className="flex items-start">
              <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5 flex-shrink-0">
                4
              </span>
              <div>
                <span className="font-medium">Refresh if Needed</span>
                <p className="text-gray-600 mt-1">
                  If products are missing, click the refresh button to force a
                  new sync from your store
                </p>
              </div>
            </li>
          </ol>

          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start">
              <MdSpeed className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
              <div className="text-blue-800 text-xs">
                <strong>Sync Information:</strong> We sync product titles,
                descriptions, prices, images, variants, and availability. The
                sync happens automatically and updates when you make changes in
                Shopify.
              </div>
            </div>
          </div>
        </div>
      </div>

        <div className="mt-4">
          <button
            onClick={() => onNavigateToStep && onNavigateToStep("products")}
            className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center mx-auto font-medium"
          >
            <MdInventory className="w-5 h-5 mr-2" />
            Sync Products
          </button>
        </div>
      </div>
    </div>
  );
};

export default SyncProductsModal;
