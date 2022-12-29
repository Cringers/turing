import { Crossword } from '@crossword/backend/entities/crossword';
import * as fs from 'fs';
import * as path from 'path';

const yaml = require('js-yaml');

interface Parser {
   name: string;
   (crossword: string): Crossword;
}

const crosswordParser: Parser = (crosswordName: string) => {
   const crosswordString: string = fs.readFileSync(path.resolve(__dirname, `../../backend/crosswords/${crosswordName}.yml`)).toString();
   const crosswordEntity: Crossword = new Crossword();
   const crossword: any = yaml.load(crosswordString);
   crosswordEntity.grid = crossword.rows.map((str) => str.split(''));
   crosswordEntity.name = crosswordName;
   crosswordEntity.answers = crossword.answers;
   return crosswordEntity;
};

export { crosswordParser };
