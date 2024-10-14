import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../trpc';
import { AddressLinkedList } from './LInkedList';


interface Address {
    display_name: string;
    lat: string;
    lon: string;
    address: Record<string, unknown>;
    timestamp: number;
}

//  linked list
let addressList = new AddressLinkedList();

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
            const newAddress: Address = {
                ...input,
                timestamp: Date.now(),
            };

            //  new address to the linked list
            addressList.addAddress(newAddress);

            return { success: true };
        }),

    getAddresses: publicProcedure.query(() => {
        //addresses from the linked list
        return addressList.getAddresses();
    }),
});
