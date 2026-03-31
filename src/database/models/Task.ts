import { Model } from '@nozbe/watermelondb';
import { field } from '@nozbe/watermelondb/decorators';

export default class TaskModel extends Model {
  static table = 'tasks';

  @field('remote_id') remoteId!: string;
  @field('todo') todo!: string;
  @field('completed') completed!: boolean;
  @field('user_id') userId!: number;
  @field('attachment_uri') attachmentUri!: string;
}