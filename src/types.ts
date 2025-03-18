import { DateTime, Duration } from "luxon";


export type Literal =
    | boolean
    | number
    | string
    | DateTime
    | Duration
    | Array<Literal>
    | Function
    | null
    | HTMLElement;

export interface BPSettings {
	initializer: string;
}