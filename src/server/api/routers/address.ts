
import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../trpc';

// Define the Address interface (optional but recommended)
type AddressComponent = Record<string, never>;

interface Address {
    display_name: string;
    lat: string;
    lon: string;
    address: AddressComponent;
    timestamp: number;
}

let addresses: Address[] = [];

export const addressRouter = createTRPCRouter({
    addAddress: publicProcedure
        .input(
            z.object({
                display_name: z.string(),
                lat: z.string(),
                lon: z.string(),
                address: z.object({}).passthrough(),
            })
        )
        .mutation(({ input }) => {
            const newAddress: unknown = {
                ...input,
                timestamp: Date.now(),
            };

            addresses.unshift((newAddress as Address));

            if (addresses.length > 50) {
                addresses = addresses.slice(0, 50);
            }

            return { success: true };
        }),

    getAddresses: publicProcedure.query(() => {
        return addresses;
    }),
});
