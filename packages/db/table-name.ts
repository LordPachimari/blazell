import type { TableName } from "./src";
import {
	carts,
	collections,
	jsonTable,
	lineItems,
	prices,
	productOptions,
	productOptionValues,
	productOptionValuesToVariants,
	products,
	productsToTags,
	stores,
	tags,
	users,
	variants,
	addresses,
	orders,
	clientErrors,
	notifications,
	customers,
} from "./schema";

type UserTable = typeof users;

type ProductTable = typeof products;

type VariantTable = typeof variants;

type ProductOptionTable = typeof productOptions;

type ProductOptionValueTable = typeof productOptionValues;

type ProductCollectionTable = typeof collections;

type PriceTable = typeof prices;

type StoreTable = typeof stores;

type TagTable = typeof tags;

type ProductToTagTable = typeof productsToTags;

type ProductOptionValuesToVariantsTable = typeof productOptionValuesToVariants;

type CartTable = typeof carts;

type AddressTable = typeof addresses;

type LineItemTable = typeof lineItems;

type OrderTable = typeof orders;

type ClientErrorTable = typeof clientErrors;

type CustomerTable = typeof customers;

type NotificationTable = typeof notifications;
export type JsonTable = typeof jsonTable;
export type Table =
	| UserTable
	| ProductTable
	| VariantTable
	| ProductOptionTable
	| ProductOptionValueTable
	| ProductCollectionTable
	| PriceTable
	| StoreTable
	| TagTable
	| ProductToTagTable
	| ProductOptionValuesToVariantsTable
	| JsonTable
	| CartTable
	| LineItemTable
	| AddressTable
	| OrderTable
	| ClientErrorTable
	| NotificationTable
	| CustomerTable;
export const tableNameToTableMap: Record<TableName, Table> = {
	users,
	products,
	variants,
	productOptions,
	productOptionValues,
	stores,
	collections,
	prices,
	tags,
	productsToTags,
	productOptionValuesToVariants,
	json: jsonTable,
	carts,
	lineItems,
	addresses,
	orders,
	clientErrors,
	notifications,
	customers,
};
export type TableNameToTableMap = typeof tableNameToTableMap;
