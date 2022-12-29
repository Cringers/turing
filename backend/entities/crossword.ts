import { Column, Entity, PrimaryColumn } from 'typeorm';
import { Answers } from '../generated/graphql';

@Entity()
export class Crossword {
   @PrimaryColumn('varchar')
   name: string;

   @Column('simple-json')
   grid: Array<Array<string>>;

   @Column('simple-json')
   answers: Answers;

}
