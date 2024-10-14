interface Address {
    display_name: string;
    lat: string;
    lon: string;
    address: Record<string, unknown>;
    timestamp: number;
}

// Node of the linked list
class AddressNode {
    data: Address;
    next: AddressNode | null;

    constructor(data: Address) {
        this.data = data;
        this.next = null;
    }
}

// Linked list class
class AddressLinkedList {
    head: AddressNode | null;
    size: number;

    constructor() {
        this.head = null;
        this.size = 0;
    }

    addAddress(address: Address) {
        const newNode = new AddressNode(address);
        newNode.next = this.head;
        this.head = newNode;
        this.size++;

        // Keep only the latest 50 addresses
        if (this.size > 50) {
            this.removeLast();
        }
    }

    removeLast() {
        if (!this.head) return;

        let current = this.head;
        let previous = null;

        // Traverse to the last node
        while (current.next) {
            previous = current;
            current = current.next;
        }

        // Remove the last node
        if (previous) {
            previous.next = null;
        } else {
            this.head = null;
        }

        this.size--;
    }

    getAddresses(): Address[] {
        const addresses: Address[] = [];
        let current = this.head;

        while (current) {
            addresses.push(current.data);
            current = current.next;
        }

        return addresses;
    }
}

export { AddressLinkedList };