
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
            {/* Search Form */}
            <form className="w-full mx-auto">
                <label
                    htmlFor="default-search"
                    className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white"
                >
                    Search
                </label>
                <div className="relative w-3/4 mx-auto">
                    <div className="absolute inset-y-0 start-0 flex items-center pl-3 pointer-events-none">
                        <svg
                            className="w-4 h-4 text-gray-500 dark:text-gray-400"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 20 20"
                        >
                            <path
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                            />
                        </svg>
                    </div>
                    <input
                        type="search"
                        id="default-search"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setIsButtonDisabled(true);
                            setSelectedAddress(null);
                        }}
                        className="block w-full p-4 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-white focus:ring-black focus:border-black"
                        placeholder="Enter an address"
                        required
                    />
                    <button
                        type="submit"
                        className="text-white absolute right-2.5 bottom-2.5 bg-black hover:bg-gray-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2"
                    >
                        Search
                    </button>
                </div>
            </form>


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
                    isButtonDisabled
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-black hover:bg-gray-900'
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
                            <li
                                key={address.display_name}
                                className="p-2 border border-gray-300 rounded"
                            >
                                <p>{address.display_name}</p>
                                <p className="text-sm text-gray-500">
                                    Saved at:{" "}
                                    {new Date(
                                        address.timestamp
                                    ).toLocaleString()}
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
