import { Note } from './note';

export class Relation {
  id: number;
  presented: number;
  presentedby: number;
  lastmodified: number;
  lastmodifiedby: number;

  text: string;
  sourceid: number; // noteid
  targetid: number;

  // for display
  source: Note; 
  target: Note;
}