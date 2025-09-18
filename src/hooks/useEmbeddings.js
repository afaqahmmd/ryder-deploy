import { useState, useCallback } from "react";
import { apiService, handleApiError, extractApiData } from "../services/api";
import { toast } from "react-toastify";

export const useEmbeddings = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [embeddingStats, setEmbeddingStats] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [isCreatingEmbeddings, setIsCreatingEmbeddings] = useState(false);
  const [isSearching, setIsSearching] = useState(false);



  // Create embeddings for a store
  const createEmbeddings = useCallback(async (storeId) => {
    setLoading(true);
    setIsCreatingEmbeddings(true);
    setError(null);
    console.log("creating embedingggg databaseeeeeeeeeeeee");
    try {
      const response = await apiService.embeddings.create(storeId);
      console.log("response after creating embedinggggggg:", response.data);
      const data = extractApiData(response);
      console.log("response after fetch products list", data);
      toast.success(data.message);

      // Update stats after creating embeddings
      // await getEmbeddingStats(storeId);

      return data;
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      setLoading(false);

      throw new Error(errorMessage);
    } finally {
      setLoading(false);

      setIsCreatingEmbeddings(false);
    }
  }, []);

  // Search embeddings
  const searchEmbeddings = useCallback(
    async (query, storeId = null, limit = 10) => {
      setIsSearching(true);
      setError(null);

      try {
        const response = await apiService.embeddings.search(
          query,
          storeId,
          limit
        );
        const data = extractApiData(response);
        setSearchResults(data.results || []);
        return data.results || [];
      } catch (err) {
        const errorMessage = handleApiError(err);
        setError(errorMessage);
        setSearchResults([]);
        throw new Error(errorMessage);
      } finally {
        setIsSearching(false);
      }
    },
    []
  );

  // Get embedding statistics
  const getEmbeddingStats = useCallback(
    async (storeId = null, collectionName = null) => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiService.embeddings.getStats(
          storeId,
          collectionName
        );
        const data = extractApiData(response);
        setEmbeddingStats(data);
        return data;
      } catch (err) {
        const errorMessage = handleApiError(err);
        setError(errorMessage);
        setEmbeddingStats(null);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    []
  );



  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Clear search results
  const clearSearchResults = useCallback(() => {
    setSearchResults([]);
  }, []);

  return {
    // State
    loading,
    error,
    embeddingStats,
    searchResults,
    isCreatingEmbeddings,
    isSearching,

    // Actions
    createEmbeddings,
    searchEmbeddings,
    getEmbeddingStats,
    clearError,
    clearSearchResults,
  };
};
