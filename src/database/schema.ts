import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const mySchema = appSchema({
  version: 2,
  tables: [
    tableSchema({
      name: 'tasks',
      columns: [
        { name: 'remote_id', type: 'string' },
        { name: 'todo', type: 'string' },
        { name: 'completed', type: 'boolean' },
        { name: 'user_id', type: 'number' },
        { name: 'attachment_uri', type: 'string', isOptional: true },
      ],
    }),
  ],
});