
import { Relation } from './relation';

export class Note {
  id: number;
  presented: number; // neo4j timestamp
  presentedby: number; // userid
  lastmodified: number; 
  lastmodifiedby: number;
  //published: number;

  text: string;
  user_x: number;
  user_y: number;

  // for display
  x:number;
  y:number;
  width: number;
  height: number;

  fixed: boolean;
  flagged: boolean;
  //tags: string;
  
  //in_edges: Edge[];
  //out_edges: Edge[];

/*
  supernote_id: number;
  subnote_ids;
  subnote_edges: Edge[];
*/

  //supernoteids;

  //causenoteids;
  //effectnoteids;

  //presentationid;
  constructor() {}
}