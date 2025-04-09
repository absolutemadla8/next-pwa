'use client';
import React, { useState, useEffect, useRef } from 'react';
import { api } from '@/app/lib/axios';
import DealCard from './DealCard';

interface Deal {
  id: string;
  imageUrl: string;
  isFlashDeal: boolean;
  timeLeft?: string;
  location: string;
  title: string;
  originalPrice: number;
  discountedPrice: number;
  discountPercentage: number;
  unit: string;
  taxIncluded: boolean;
  amenities: string[];
  itineraries: Array<{
    name: string;
    property_rating: string;
  }>;
}

interface DealsListSectionProps {
  country?: string;
  stayPackages?: boolean;
  labels?: string[];
}

const DealsListSection: React.FC<DealsListSectionProps> = ({ 
  country, 
  stayPackages = true,
  labels = []
}) => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Use ref to track whether we've already attempted a fetch
  const fetchAttemptedRef = useRef(false);
  // Use ref to store an abort controller for cancelling in-flight requests
  const abortControllerRef = useRef<AbortController | null>(null);

  // Track props changes with refs to prevent unnecessary re-renders
  const propsRef = useRef({
    country,
    stayPackages,
    labels: labels.join(',')
  });

  useEffect(() => {
    // Update props ref when props change
    propsRef.current = {
      country,
      stayPackages,
      labels: labels.join(',')
    };
    
    // Reset fetch state when props change
    fetchAttemptedRef.current = false;
    setLoading(true);
    setError(null);
    
    // Cancel any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();
    
    const fetchDeals = async () => {
      // Prevent duplicate fetches
      if (fetchAttemptedRef.current) return;
      fetchAttemptedRef.current = true;
      
      try {
        // Construct query parameters based on props
        const params: Record<string, any> = {};
        if (country) params.country = country;
        if (stayPackages !== undefined) params.stayPackages = stayPackages;
        if (labels && labels.length > 0) params.labels = labels.join(',');
        
        // Use the abort controller signal for this request
        const response = await api.get('/deals', { 
          params, 
          signal: abortControllerRef.current?.signal 
        });
        //@ts-ignore mlmr
        if (response?.data?.deals) {
          //@ts-ignore mlmr
          setDeals(response.data.deals);
        } else {
          // Empty data from API
          setDeals([]);
        }
      } catch (err: any) {
        // Don't set error state if the request was aborted
        if (err.name === 'AbortError') {
          console.log('Request was cancelled');
          return;
        }
        
        console.error('Error fetching deals:', err);
        setError(err.message || 'Failed to fetch deals');
        setDeals([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDeals();
    
    // Cleanup function to abort any pending requests when component unmounts
    // or when the dependencies change
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [country, stayPackages, labels.join(',')]);

  const handleFavoritePress = (dealId: string) => {
    console.log('Favorite pressed for deal:', dealId);
    // Implement favorite logic here
  };

  const handleRetry = () => {
    // Reset state for a fresh fetch
    fetchAttemptedRef.current = false;
    setLoading(true);
    setError(null);
    
    // Cancel any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new abort controller
    abortControllerRef.current = new AbortController();
    
    // Fetch deals again
    const fetchDeals = async () => {
      try {
        // Construct query parameters based on current props
        const params: Record<string, any> = {};
        if (propsRef.current.country) params.country = propsRef.current.country;
        if (propsRef.current.stayPackages !== undefined) params.stayPackages = propsRef.current.stayPackages;
        if (propsRef.current.labels) params.labels = propsRef.current.labels;
        
        const response = await api.get('/deals', { 
          params,
          signal: abortControllerRef.current?.signal 
        });
        //@ts-ignore mlmr
        if (response?.data?.deals) {
          //@ts-ignore mlmr
          setDeals(response.data.deals);
        } else {
          setDeals([]);
        }
      } catch (err: any) {
        if (err.name === 'AbortError') {
          console.log('Request was cancelled');
          return;
        }
        
        console.error('Error fetching deals:', err);
        setError(err.message || 'Failed to fetch deals');
        setDeals([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDeals();
  };

  // Skeleton loader
  const SkeletonLoader = () => (
    <div className="w-full p-4 bg-white">
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col gap-4">
            <div className="h-64 bg-gray-200 rounded-xl"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="flex gap-2">
              <div className="h-4 bg-gray-200 rounded w-20"></div>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return <SkeletonLoader />;
  }

  if (deals.length === 0) {
    return (
      <div className="w-full p-4 bg-white text-center">
        <p className="text-gray-500">No deals available at this time.</p>
        <button 
          className="mt-2 text-blue-600 underline" 
          onClick={handleRetry}
        >
          Check again
        </button>
      </div>
    );
  }

  return (
    <div className="w-full px-4">
      <div className="flex flex-row items-start justify-between w-full pb-4">
        <h2 style={{ fontFamily: 'var(--font-nohemi)' }} className="text-primary font-normal text-lg">
          {country ? `Deals in ${country}` : 'Featured Deals'}
        </h2>
        {deals.length > 5 && (
          <button className="text-blue-600 text-sm font-medium">
            View All
          </button>
        )}
      </div>
      
      <div className="space-y-4">
        {deals.map((deal) => (
          <DealCard
            key={deal.id} 
            deal={deal} 
            onFavoritePress={handleFavoritePress} 
          />
        ))}
        <div className='h-16' />
      </div>
    </div>
  );
};

export default DealsListSection;