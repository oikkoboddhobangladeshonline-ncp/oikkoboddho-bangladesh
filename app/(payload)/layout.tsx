import { RootLayout } from '@payloadcms/next/layouts';
/* This is the root layout for Payload. It wraps all Payload pages. */
import React from 'react';
import { handleServerFunctions } from '@payloadcms/next/layouts';
import config from '../../payload.config';
import '@payloadcms/next/css';

const serverFunction: any = async (args: any) => { // Using any to bypass strict type checking for now due to complex generic inference issues
    'use server'
    return handleServerFunctions({
        ...args,
        config,
        importMap: {},
    })
}

const Layout = ({ children }: { children: React.ReactNode }) => (
    <RootLayout config={config} importMap={{}} serverFunction={serverFunction}>{children}</RootLayout>
);

export default Layout;
