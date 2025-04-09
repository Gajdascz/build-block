import fs from 'fs';

import type { FileContentResolver, ResultObj } from '../basic/basic.js';
import { type FindFileOpts, findFile } from '../find/find.js';

interface ParseJsonOpts<TParsed, TResolved = TParsed>
  extends Omit<FindFileOpts, 'extension'> {
  resolverFn?: FileContentResolver<TParsed, TResolved>;
}

const parseJson = async <TParsed, TResolved = TParsed>(
  filePath: string,
  { fileName, resolverFn }: ParseJsonOpts<TParsed, TResolved> = {}
): Promise<ResultObj<TResolved>> => {
  const { result, error: findFileError } = findFile(filePath, {
    fileName,
    extension: 'json'
  });
  let err: unknown;
  if (result !== null) {
    try {
      const content = await fs.promises.readFile(result, 'utf-8');
      let parsed: TParsed | TResolved | null = JSON.parse(content) as TParsed;
      if (resolverFn) parsed = resolverFn(parsed);
      // Error is caught and message is added to return result object
      if (parsed === null) throw new Error(`Resolver function returned null`);
      return { result: parsed as TResolved };
    } catch (e) {
      err = e;
    }
  }
  let errMsg = `Failed to parse JSON config from ${filePath}`;
  if (findFileError) errMsg += `\nfindFileError: ${findFileError}`;
  if (err instanceof Error) errMsg += `\nError: ${err.message}`;
  return { result: null, error: errMsg };
};

export { parseJson };
