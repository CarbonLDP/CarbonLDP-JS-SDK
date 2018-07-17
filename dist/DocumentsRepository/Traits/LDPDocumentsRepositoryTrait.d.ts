import { DocumentsContext } from "../../Context/DocumentsContext";
import { Document } from "../../Document/Document";
import { GETOptions, RequestOptions } from "../../HTTP/Request";
import { Response } from "../../HTTP/Response";
import { ModelDecorator } from "../../Model/ModelDecorator";
import { ModelPrototype } from "../../Model/ModelPrototype";
import { Pointer } from "../../Pointer/Pointer";
import { BaseDocumentsRepository } from "../BaseDocumentsRepository";
import { HTTPRepositoryTrait } from "./HTTPRepositoryTrait";
export interface LDPDocumentsRepositoryTrait extends HTTPRepositoryTrait<Document> {
    $context: DocumentsContext;
    $get<T extends object>(uri: string, requestOptions?: GETOptions): Promise<T & Document>;
    $resolve<T extends object>(document: Document, requestOptions?: GETOptions): Promise<T & Document>;
    create<T extends object>(uri: string, children: T[], requestOptions?: RequestOptions): Promise<(T & Document)[]>;
    create<T extends object>(uri: string, children: T[], slugs?: string[], requestOptions?: RequestOptions): Promise<(T & Document)[]>;
    create<T extends object>(uri: string, child: T, requestOptions?: RequestOptions): Promise<T & Document>;
    create<T extends object>(uri: string, child: T, slug?: string, requestOptions?: RequestOptions): Promise<T & Document>;
    createAndRetrieve<T extends object>(uri: string, children: T[], requestOptions?: RequestOptions): Promise<(T & Document)[]>;
    createAndRetrieve<T extends object>(uri: string, children: T[], slugs?: string[], requestOptions?: RequestOptions): Promise<(T & Document)[]>;
    createAndRetrieve<T extends object>(uri: string, child: T, requestOptions?: RequestOptions): Promise<T & Document>;
    createAndRetrieve<T extends object>(uri: string, child: T, slug?: string, requestOptions?: RequestOptions): Promise<T & Document>;
    $refresh<T extends object>(document: Document, requestOptions?: RequestOptions): Promise<T & Document>;
    $save<T extends object>(document: Document, requestOptions?: RequestOptions): Promise<T & Document>;
    $saveAndRefresh<T extends object>(document: Document, requestOptions?: RequestOptions): Promise<T & Document>;
    $delete(uri: string, requestOptions?: RequestOptions): Promise<void>;
    addMember(uri: string, member: (string | Pointer), requestOptions?: RequestOptions): Promise<void>;
    addMembers(uri: string, members: (string | Pointer)[], requestOptions?: RequestOptions): Promise<void>;
    removeMember(uri: string, member: (string | Pointer), requestOptions?: RequestOptions): Promise<void>;
    removeMembers(uri: string, members?: (string | Pointer)[], requestOptions?: RequestOptions): Promise<void>;
    removeMembers(uri: string, requestOptions?: RequestOptions): Promise<void>;
    _parseResponseData<T extends object>(response: Response, id: string): Promise<T & Document>;
}
export declare type OverriddenMembers = "$get" | "$refresh" | "$exists" | "$save" | "$saveAndRefresh" | "$delete" | "_parseResponseData";
export declare type LDPDocumentsRepositoryTraitFactory = ModelPrototype<LDPDocumentsRepositoryTrait, HTTPRepositoryTrait, OverriddenMembers> & ModelDecorator<LDPDocumentsRepositoryTrait, BaseDocumentsRepository>;
export declare const LDPDocumentsRepositoryTrait: LDPDocumentsRepositoryTraitFactory;
