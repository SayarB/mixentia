"use client"
import { SessionProvider, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React from 'react';

type AuthValidatorProps = {
    children: React.ReactNode;
}

const Validator: React.FC<AuthValidatorProps> = ({ children }) => {
    return <SessionProvider><AuthValidator>{children}</AuthValidator></SessionProvider>
};

const AuthValidator: React.FC<AuthValidatorProps> = ({ children }) => {
    const { status } = useSession()
    const router = useRouter()
    if (status === 'unauthenticated') {
        router.push('/api/auth/signin')
        return <></>
    }
    if (status === 'loading') {
        return <>Loading..</>
    }
    return <>{children}</>
}

export default Validator;