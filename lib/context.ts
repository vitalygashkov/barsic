export type ContextData = { [key: string]: any };

export const checkBounds = (ctx: ParsingContext, byteLength: number) => {
  if (ctx.offset + byteLength > ctx.dataView.byteLength) {
    throw new Error(
      `Not enough data: needed ${byteLength} bytes, only ${ctx.dataView.byteLength - ctx.offset} available`
    );
  }
};

function getContextStack(ctx: ParsingContext | BuildingContext): ContextData {
  return ctx.stack[ctx.stack.length - 1];
}

export class ParsingContext {
  public stack: ContextData[] = [{}];
  constructor(
    public dataView: DataView,
    public offset: number = 0,
    public debug: boolean = false,
    private logDepth: number = 0
  ) {}

  get bytesRemaining(): number {
    return this.dataView.byteLength - this.offset;
  }

  log(message: string) {
    if (this.debug) {
      console.log(`${'  '.repeat(this.logDepth)}${message}`);
    }
  }

  enter(name: string) {
    if (!this.debug) return;
    this.log(`=> ${name} at offset ${this.offset} (0x${this.offset.toString(16)})`);
    this.logDepth++;
  }

  leave(name: string, result?: any) {
    if (!this.debug) return;
    this.logDepth--;
    let resultStr = '';
    if (result !== undefined) {
      if (result instanceof Uint8Array) {
        const hex = Array.from(result.slice(0, 16), (byte) => byte.toString(16).padStart(2, '0')).join(' ');
        resultStr = `parsed: Uint8Array(len=${result.length}) [${hex}${result.length > 16 ? '...' : ''}]`;
      } else {
        resultStr = `parsed: ${JSON.stringify(result).slice(0, 64)}...`;
      }
    }
    this.log(`<= ${name} at new offset ${this.offset} (0x${this.offset.toString(16)}) ${resultStr}`);
  }

  get context(): ContextData {
    return getContextStack(this);
  }
}

export class BuildingContext {
  public stack: ContextData[] = [{}];
  public buffers: Uint8Array[] = [];

  constructor(public initialObj?: ContextData, public debug: boolean = false, private logDepth: number = 0) {
    if (initialObj) {
      this.stack = [initialObj];
    }
  }

  get context(): ContextData {
    return getContextStack(this);
  }

  log(message: string) {
    if (this.debug) {
      console.log(`${'  '.repeat(this.logDepth)}${message}`);
    }
  }

  enter(name: string, value?: any) {
    if (!this.debug) return;
    let valueStr = '';
    if (value !== undefined) {
      if (value instanceof Uint8Array) {
        valueStr = ` with value: Uint8Array(len=${value.length})`;
      } else {
        const json = JSON.stringify(value);
        // Truncate long JSON strings to keep logs clean
        valueStr = ` with value: ${json.length > 120 ? json.substring(0, 117) + '...' : json}`;
      }
    }
    this.log(`=> Building ${name}${valueStr}`);
    this.logDepth++;
  }

  leave(name: string, bytesWritten?: number) {
    if (!this.debug) return;
    this.logDepth--;
    const bytesStr = bytesWritten !== undefined ? ` (wrote ${bytesWritten} bytes)` : '';
    this.log(`<= Finished Building ${name}${bytesStr}`);
  }
}
