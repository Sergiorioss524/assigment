// src/app/components/AddressInput.tsx

'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { api } from "~/trpc/react";// Adjust the import path based on your project structure

type AddressComponent = Record<string, never>;

interface AddressSuggestion {
    place_id: string;
    display_name: string;
    lat: string;
    lon: string;
    address: AddressComponent;
}

interface SavedAddress {
    display_name: string;
    lat: string;
    lon: string;
    address: Record<string, unknown>;
    timestamp: number;
}

const AddressInput: React.FC = () => {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
    const [selectedAddress, setSelectedAddress] = useState<AddressSuggestion | null>(null);
    const [isButtonDisabled, setIsButtonDisabled] = useState(true);

    // tRPC mutation to save address
    const saveAddressMutation = api.address.addAddress.useMutation({
        onSuccess: async () => {
            await addressesQuery.refetch();
        },
    });

    // tRPC query to fetch saved addresses
    const addressesQuery = api.address.getAddresses.useQuery();

    const fetchSuggestions = async (input: string) => {
        try {
            const response = await axios.get<AddressSuggestion[]>(
                'https://nominatim.openstreetmap.org/search',
                {
                    params: {
                        q: input,
                        format: 'json',
                        addressdetails: '1',
                        limit: '5',
                    },
                    headers: {
                        'Accept-Language': 'en',
                        'User-Agent': 'assigment riosgenuziosergio@gmail.com', // Replace with your app name and email
                    },
                }
            );
            setSuggestions(response.data);
        } catch (error) {
            console.error('Error fetching suggestions', error);
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            const fetchData = async () => {
                if (query.length > 2) {
                    await fetchSuggestions(query);
                } else {
                    setSuggestions([]);
                }
            };
            fetchData().catch((error) => {
                console.error('Error in fetchData:', error);
            });
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    const handleSelectAddress = (address: AddressSuggestion) => {
        setSelectedAddress(address);
        setQuery(address.display_name);
        setSuggestions([]);
        setIsButtonDisabled(false);
    };

    const handleSaveAddress = async () => {
        if (!selectedAddress) return;

        try {
            await saveAddressMutation.mutateAsync({
                display_name: selectedAddress.display_name,
                lat: selectedAddress.lat,
                lon: selectedAddress.lon,
                address: selectedAddress.address,
            });

            // Reset the form
            setSelectedAddress(null);
            setQuery('');
            setIsButtonDisabled(true);
        } catch (error) {
            console.error('Error saving address:', error);
        }
    };

    return (
        <div className="relative">
            {/* Address Input Field */}
            <input
                type="text"
                value={query}
                onChange={(e) => {
                    setQuery(e.target.value);
                    setIsButtonDisabled(true);
                    setSelectedAddress(null);
                }}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Enter an address"
            />

            {/* Suggestions List */}
            {suggestions.length > 0 && (
                <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded mt-1 max-h-60 overflow-y-auto">
                    {suggestions.map((suggestion) => (
                        <li
                            key={suggestion.place_id}
                            onClick={() => handleSelectAddress(suggestion)}
                            className="p-2 cursor-pointer hover:bg-gray-100"
                        >
                            {suggestion.display_name}
                        </li>
                    ))}
                </ul>
            )}

            {/* Save Address Button */}
            <button
                onClick={handleSaveAddress}
                disabled={isButtonDisabled}
                className={`mt-4 px-4 py-2 text-white rounded ${
                    isButtonDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
                }`}
            >
                Save Address
            </button>

            {/* Saved Addresses List */}
            <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">Saved Addresses</h2>
                {addressesQuery.isLoading ? (
                    <p>Loading...</p>
                ) : addressesQuery.data && addressesQuery.data.length > 0 ? (
                    <ul className="space-y-2">
                        {addressesQuery.data.map((address) => (
                            <li key={address.display_name} className="p-2 border border-gray-300 rounded">
                                <p>{address.display_name}</p>
                                <p className="text-sm text-gray-500">
                                    Saved at: {new Date(address.timestamp).toLocaleString()}
                                </p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No addresses saved yet.</p>
                )}
            </div>
        </div>
    );
};

export default AddressInput;
