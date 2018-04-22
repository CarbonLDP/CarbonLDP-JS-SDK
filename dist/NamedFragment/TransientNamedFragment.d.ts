import { TransientFragment } from "../Fragment";
import { BaseNamedFragment } from "./BaseNamedFragment";
export interface TransientNamedFragment extends TransientFragment {
    slug: string;
}
export interface TransientNamedFragmentFactory {
    isDecorated(object: object): object is TransientNamedFragment;
    is(value: any): value is TransientNamedFragment;
    create<T extends BaseNamedFragment>(base: T): T & TransientNamedFragment;
    createFrom<T extends BaseNamedFragment>(object: T): T & TransientNamedFragment;
    decorate<T extends object>(object: T): T & TransientNamedFragment;
}
export declare const TransientNamedFragment: TransientNamedFragmentFactory;
