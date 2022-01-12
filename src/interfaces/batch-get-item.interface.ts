interface BatchGetItemInterface {
  tableName: string;
  keys: Array<KeysInterface>;
  projectionExpression?: string;
  expressionAttributeNames?: any;
}
