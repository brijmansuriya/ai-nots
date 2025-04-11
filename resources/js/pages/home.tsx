import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Home() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <h1>test</h1>
        </>
    );
}
