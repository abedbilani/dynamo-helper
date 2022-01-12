interface GetItemInterface {
  tableName: string;
  pk: string;
  sk?: string;
  projectionExpression?: string;
  expressionAttributeNames?: any;
}
