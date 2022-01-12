# Single Table Design Query Builder

## Installation and Basic Usage

Install the DynamoDB Toolbox with npm:

```
npm i std-dynamo-query-builder
```

Require or import `Table` and `Entity` from `std-dynamo-query-builder`:

Build create item query

```ts
const params: GetItemInterface = {
  pk,
  sk,
  tableName: TABLE_NAME,
};
const payload = queryHelper.get(params);
```

Build delete item query

```ts
const params: DeleteItemInterface = {
  pk,
  sk,
  tableName: TABLE_NAME,
};
const payload = queryHelper.deleteItem(params);
```

Build soft delete item query

```ts
const params: DeleteItemInterface = {
  pk,
  sk,
  tableName: TABLE_NAME,
};
const payload = queryHelper.softDelete(params);
```

Build get item query

```ts
const params: GetItemInterface = {
  tableName: string,
  pk: string,
  sk: string,
  projectionExpression: string,
  expressionAttributeNames: any,
};
const payload = queryHelper.get(params);
```

Build query items query

```ts

const payload = queryHelper.query(params);

```
