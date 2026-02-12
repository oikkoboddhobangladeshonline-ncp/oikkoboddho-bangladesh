import { RootPage } from '@payloadcms/next/views';
import config from '../../../../payload.config';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface Args {
    params: Promise<{ segments?: string[] }>;
    searchParams: Promise<{ [key: string]: string | string[] }>;
}

const Page = async ({ params, searchParams }: Args) => {
    const resolvedParams = await params;
    return <RootPage
        config={Promise.resolve(config)}
        importMap={{}}
        params={Promise.resolve({ segments: resolvedParams.segments || [] })}
        searchParams={searchParams}
    />;
};

export default Page;
