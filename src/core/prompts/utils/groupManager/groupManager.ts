import type { ResultObj } from '#constants';
import _prompts from 'prompts';

interface GroupManagerOpts<T extends string, R extends T = T> {
  slug: string;
  prompts: {
    all: { [K in T]: _prompts.PromptObject<K> };
    required?: { [K in R]: _prompts.PromptObject<K> };
  };
  details?: { title?: string; icon?: string; desc?: string };
}

const createGroupManager = <T extends string, R extends T = T>({
  slug,
  prompts,
  details = {}
}: GroupManagerOpts<T, R>) => {
  const { title = `${slug} Group`, desc = ``, icon = '⚙️' } = details;
  const data = { id: `${slug}-group`, title, description: desc, icon } as const;
  const log = {
    header: (msg?: string) => {
      console.log(`${data.icon} ${data.title}`);
      if (data.description) console.log(data.description);
      if (msg) console.log(msg);
    },
    success: (promptName: string, msg = 'completed') => {
      console.log(`${data.title}\n[✅]: ${promptName} ${msg}!`);
    },
    cancelled: (promptName: string, msg = 'cancelled') => {
      console.log(`${data.title}\n[❗]: ${promptName} ${msg}!`);
    },
    error: (promptName: string, msg = 'failed') => {
      console.log(`${data.title}\n[❌]: ${promptName} ${msg}!`);
    },
    info: (promptName: string, info = 'info') => {
      console.log(`${data.title}\n[ℹ️]: ${promptName} ${info}`);
    },
    warn: (promptName: string, warning = 'warning') => {
      console.log(`${data.title}\n[⚠️]: ${promptName} ${warning}`);
    }
  } as const;
  const _executePrompts = async <P extends T>(
    promptArray: _prompts.PromptObject<P>[]
  ): Promise<ResultObj<_prompts.Answers<P>>> => {
    let currPromptName = '';
    try {
      const res = await _prompts(promptArray, {
        onCancel: ({ name }) => {
          currPromptName = String(name);
          log.cancelled(currPromptName);
          return process.exit(0);
        }
      });

      return { result: res };
    } catch (err) {
      log.error(currPromptName || 'prompts');
      return { result: null, error: 'Error occurred while executing prompts' };
    }
  };
  return {
    log,
    get id() {
      return data.id;
    },
    get title() {
      return data.title;
    },
    get description() {
      return data.description;
    },
    get icon() {
      return data.icon;
    },
    get objs() {
      return { all: prompts.all, required: prompts.required ?? {} };
    },
    get requiredArray() {
      return Object.entries(prompts.required ?? {}).map(([key, value]) => ({
        ...(value as object),
        name: key
      })) as _prompts.PromptObject<R>[];
    },
    get fullArray() {
      return Object.entries(prompts.all).map(([key, value]) => ({
        ...(value as object),
        name: key
      })) as _prompts.PromptObject<T>[];
    },
    async execAll(): Promise<ResultObj<_prompts.Answers<T>>> {
      log.header('Executing All Prompts');
      return await _executePrompts(this.fullArray);
    },
    async execRequired(): Promise<ResultObj<_prompts.Answers<R>>> {
      log.header('Executing Required Prompts');
      return await _executePrompts(this.requiredArray);
    },
    async execPrompts<P extends T>(
      promptNames: P[]
    ): Promise<ResultObj<_prompts.Answers<P>>> {
      log.header(`Executing Prompts: ${promptNames.join(', ')}`);
      return await _executePrompts(
        promptNames.map((name) => this.objs.all[name])
      );
    },
    async execPrompt<P extends T>(
      prompt: keyof typeof this.objs.all
    ): Promise<ResultObj<_prompts.Answers<P>>> {
      log.header(`Executing Prompt: ${prompt}`);
      return await _executePrompts([this.objs.all[prompt]]);
    }
  } as const;
};
export { type GroupManagerOpts, createGroupManager };
