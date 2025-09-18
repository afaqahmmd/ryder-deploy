import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../utils/axios";
import { toast } from "react-toastify";
import { getCookie } from "cookies-next";
import { encryptData } from "../../utils/encryption";

export const connectShopifyStore = createAsyncThunk(
  "shopify/connectStore",
  async ({ clientId, clientSecret, shopDomain, storefrontToken, storeType, storeDescription }, thunkAPI) => {
    try {
      if (!clientId || !clientSecret || !shopDomain || !storefrontToken) {
        toast.error("Please fill in all required fields");
        return thunkAPI.rejectWithValue({ message: "Please fill in all required fields" });
      }

      const cleanShopDomain = shopDomain.replace('.myshopify.com', '');
      
      const SHOP_QUERY = `
        query getShop {
          shop {
            name
            description
            primaryDomain {
              url
            }
            paymentSettings {
              currencyCode
            }
          }
        }
      `;
      
      const shopifyResponse = await fetch(
        `https://${cleanShopDomain}.myshopify.com/api/2023-10/graphql.json`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Storefront-Access-Token': storefrontToken
          },
          body: JSON.stringify({
            query: SHOP_QUERY
          })
        }
      );

      if (!shopifyResponse.ok) {
        if (shopifyResponse.status === 401) {
          toast.error('Invalid Storefront access token. Please check your token.');
          return thunkAPI.rejectWithValue({ message: 'Invalid Storefront access token. Please check your token.' });
        }
        toast.error(`Shopify API Error: ${shopifyResponse.status} ${shopifyResponse.statusText}`);
        return thunkAPI.rejectWithValue({ message: `API Error: ${shopifyResponse.status} ${shopifyResponse.statusText}` });
      }

      const shopifyData = await shopifyResponse.json();
      
      if (shopifyData.errors) {
        toast.error(`GraphQL Error: ${shopifyData.errors[0].message}`);
        return thunkAPI.rejectWithValue({ message: `GraphQL Error: ${shopifyData.errors[0].message}` });
      }

      const payload = {
        store_name: shopifyData.data.shop.name,
        client_id: clientId,
        client_secret: clientSecret,
        domain: `${cleanShopDomain}.myshopify.com`,
        access_token: storefrontToken,
        status: "Active",
        store_type: storeType || null,
        store_description: storeDescription || null
      };


      const token = getCookie("token");
      
      if (!token) {
        toast.error("Authentication required. Please login again.");
        return thunkAPI.rejectWithValue({ message: "Authentication required. Please login again." });
      }

      const encryptedData = encryptData(payload);

      const backendResponse = await axiosInstance.post('/api/stores/', {
        encryptedData
      });

      if (!backendResponse.data || !backendResponse.data.details) {
        toast.error('Failed to save store data to backend');
        return thunkAPI.rejectWithValue({ message: 'Failed to save store data to backend' });
      }

      const connectionData = {
        shop: {
          name: shopifyData.data.shop.name,
          domain: `${cleanShopDomain}.myshopify.com`,
          description: shopifyData.data.shop.description,
          url: shopifyData.data.shop.primaryDomain.url,
          currency: shopifyData.data.shop.paymentSettings.currencyCode
        },
        credentials: {
          clientId: clientId,
          clientSecret: clientSecret,
          shopDomain: cleanShopDomain,
          storefrontToken: storefrontToken
        },
        backend: {
          id: backendResponse.data.details.data.id,
          message: backendResponse.data.details.message,
          status: backendResponse.data.details.data.status
        },
        connected_at: new Date().toISOString(),
        connection_type: 'storefront_api'
      };

      localStorage.setItem('shopify_session', JSON.stringify(connectionData));

      toast.success("Shopify store connected successfully!");
      
      return connectionData;
    } catch (error) {
      console.log(error,"its full error");
      const errorMessage = error.response?.data?.detail || error.message || "Shopify connection failed";
      toast.error(errorMessage);
      return thunkAPI.rejectWithValue({ message: errorMessage });
    }
  }
); 