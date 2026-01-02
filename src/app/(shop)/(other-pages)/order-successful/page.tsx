'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import ButtonPrimary from '@/shared/Button/ButtonPrimary';
import { useEffect } from 'react';
import { useCart } from '@/components/useCartStore';

const OrderSuccessfulPage = () => {
    const searchParams = useSearchParams();
    const txnid = searchParams.get('txnid');
    const { removeAll } = useCart();

    useEffect(() => {
        removeAll();
    }, [removeAll]);

    return (
        <main className="container py-16 lg:pt-20 lg:pb-28">
            <div className="text-center">
                <h1 className="text-3xl font-semibold text-green-600">Order Successful!</h1>
                <p className="mt-4 text-lg">Thank you for your purchase.</p>

                {txnid && (
                    <div className="mt-8">
                        <h3 className="text-lg font-semibold">Your Transaction ID is:</h3>
                        <p className="text-xl font-mono bg-neutral-100 dark:bg-neutral-800 inline-block px-4 py-2 rounded-md mt-2">
                            {txnid}
                        </p>
                    </div>
                )}

                <div className="mt-10">
                    <Link href="/">
                        <ButtonPrimary>Continue Shopping</ButtonPrimary>
                    </Link>
                </div>
            </div>
        </main>
    );
};

export default OrderSuccessfulPage;