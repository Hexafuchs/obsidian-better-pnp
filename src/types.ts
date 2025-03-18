import { DateTime, Duration } from 'luxon';

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export type Literal = boolean | number | string | DateTime | Duration | Array<Literal> | Function | null | HTMLElement;
