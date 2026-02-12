import { buildConfig } from 'payload'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'


const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const Users = {
    slug: 'users',
    auth: true,
    admin: {
        useAsTitle: 'email',
    },
    fields: [
        {
            name: 'name',
            type: 'text',
        },
        // 'email' and 'password' are provided by auth: true
    ],
}

const Incidents = {
    slug: 'incidents',
    admin: {
        useAsTitle: 'description',
    },
    fields: [
        {
            name: 'description',
            type: 'textarea',
            required: true,
        },
        {
            name: 'type',
            type: 'select',
            options: [
                { label: 'Emergency', value: 'emergency' },
                { label: 'Report', value: 'report' },
            ],
            defaultValue: 'report',
        },
        {
            name: 'status',
            type: 'select',
            options: [
                { label: 'Pending', value: 'pending' },
                { label: 'In Progress', value: 'in_progress' },
                { label: 'Resolved', value: 'resolved' },
            ],
            defaultValue: 'pending',
        },
        {
            name: 'location',
            type: 'point',
            label: 'Incident Location',
        },
        {
            name: 'media',
            type: 'upload',
            relationTo: 'media',
        },
    ],
}

const Media = {
    slug: 'media',
    upload: {
        staticDir: 'media',
        imageSizes: [
            {
                name: 'thumbnail',
                width: 400,
                height: 300,
                position: 'centre',
            },
        ],
        adminThumbnail: 'thumbnail',
        mimeTypes: ['image/*'],
    },
    fields: [
        {
            name: 'alt',
            type: 'text',
        },
    ],
}

const CCTVLocations = {
    slug: 'cctv_locations',
    admin: {
        useAsTitle: 'name',
    },
    fields: [
        {
            name: 'name',
            type: 'text',
            required: true,
        },
        {
            name: 'url',
            type: 'text',
            required: true,
            label: 'Stream URL',
        },
        {
            name: 'location',
            type: 'point',
            required: true,
        },
        {
            name: 'status',
            type: 'select',
            options: [
                { label: 'Online', value: 'online' },
                { label: 'Offline', value: 'offline' },
            ],
            defaultValue: 'online',
        },
    ],
}

export default buildConfig({
    admin: {
        user: Users.slug,
        importMap: {
            baseDir: path.resolve(dirname),
        },
    },
    collections: [
        {
            slug: 'users',
            auth: true,
            admin: {
                useAsTitle: 'email',
            },
            fields: [
                {
                    name: 'name',
                    type: 'text',
                },
            ],
        },
        {
            slug: 'incidents',
            admin: {
                useAsTitle: 'description',
            },
            fields: [
                {
                    name: 'description',
                    type: 'textarea',
                    required: true,
                },
                {
                    name: 'type',
                    type: 'select',
                    options: [
                        { label: 'Emergency', value: 'emergency' },
                        { label: 'Report', value: 'report' },
                    ],
                    defaultValue: 'report',
                },
                {
                    name: 'status',
                    type: 'select',
                    options: [
                        { label: 'Pending', value: 'pending' },
                        { label: 'In Progress', value: 'in_progress' },
                        { label: 'Resolved', value: 'resolved' },
                    ],
                    defaultValue: 'pending',
                },
                {
                    name: 'location',
                    type: 'point',
                    label: 'Incident Location',
                },
                {
                    name: 'media',
                    type: 'upload',
                    relationTo: 'media',
                },
            ],
        },
        {
            slug: 'cctv_locations',
            admin: {
                useAsTitle: 'name',
            },
            fields: [
                {
                    name: 'name',
                    type: 'text',
                    required: true,
                },
                {
                    name: 'url',
                    type: 'text',
                    required: true,
                    label: 'Stream URL',
                },
                {
                    name: 'location',
                    type: 'point',
                    required: true,
                },
                {
                    name: 'status',
                    type: 'select',
                    options: [
                        { label: 'Online', value: 'online' },
                        { label: 'Offline', value: 'offline' },
                    ],
                    defaultValue: 'online',
                },
            ],
        },
        {
            slug: 'media',
            upload: {
                staticDir: 'media',
                imageSizes: [
                    {
                        name: 'thumbnail',
                        width: 400,
                        height: 300,
                        position: 'centre',
                    },
                ],
                adminThumbnail: 'thumbnail',
                mimeTypes: ['image/*'],
            },
            fields: [
                {
                    name: 'alt',
                    type: 'text',
                },
            ],
        },
    ],
    editor: lexicalEditor({}),
    secret: process.env.PAYLOAD_SECRET || 'YOUR_SECRET_HERE',
    typescript: {
        outputFile: path.resolve(dirname, 'payload-types.ts'),
    },
    db: sqliteAdapter({
        client: {
            url: process.env.DATABASE_URI || 'file:./payload-db.sqlite',
        },
    }),
    async onInit(payload) {
        const existingUsers = await payload.find({
            collection: 'users',
            limit: 1,
        });

        if (existingUsers.totalDocs === 0) {
            await payload.create({
                collection: 'users',
                data: {
                    email: 'oikkoboddhobangladesh.online@gmail.com',
                    password: 'Bangladesh@2026',
                    name: 'Super Admin',
                },
            });
        }
    },
})
