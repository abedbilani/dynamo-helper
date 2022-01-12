interface QueryItemInterface {
  tableName: string;
  pk: string;
  sk?: string;
  projectionExpression?: string;
  indexName?: string;
  pkName: string;
  skName?: string;
  condition?: string;
  filterExpression?: string;
  expressionAttributeNames?: any;
  expressionAttributeValues?: any;
  limit?: number;
  scanIndexForward?: boolean;
  conditionFrom?: any,
  conditionTo?: any,
  exclusiveStartKey?: any;
  excludeDeleted?: boolean;
}
