import React from 'react';
import AddressInput from '../app/_components/AddressInput';

export default function Page() {
    return (
        <main className="flex justify-center items-center h-screen p-4">
            <div className="w-full max-w-full text-center">
                <h1 className="text-5xl font-bold mb-16">Welcome to the Address App</h1>
                <AddressInput />
            </div>
        </main>
    );
}
