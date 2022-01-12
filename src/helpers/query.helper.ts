import Utils from './utils';
import { STATUS_DELETED } from '../constants/variables';

class QueryHelper {

  update(params: UpdateItemInterface, attributes?: any, addAttributes?: any, appendAttributes?: any, removeAttributes?: any) {
    const {
      pk,
      sk,
      tableName,
      returnValues,
    } = params;

    let UpdateExpression = 'set #UpdatedAt = :updatedAt  ';
    const ExpressionAttributeNames = {
      '#UpdatedAt': 'UpdatedAt',
    };
    const ExpressionAttributeValues = {
      ':updatedAt': Utils.getTimeStamp(),
    };
    if (attributes) {
      Object.entries(attributes).map(([attribute, value]) => {
        if (attribute !== 'pk' && attribute !== 'sk' && value !== undefined) {
          const nestedAttributes = attribute.split('.');
          if (nestedAttributes.length > 1) {
            Object.entries(nestedAttributes).map(([nestedAttribute, i]) => {
              // @ts-ignore
              if (i === 0) {
                const attributeName = nestedAttribute.charAt(0)
                  .toUpperCase() + nestedAttribute.slice(1);
                UpdateExpression += `, #${attributeName}.`;
                // @ts-ignore
                ExpressionAttributeNames[`#${attributeName}`] = attributeName;
              } else {
                UpdateExpression += `#${nestedAttribute}.`;
                // @ts-ignore
                ExpressionAttributeNames[`#${nestedAttribute}`] = nestedAttribute;
              }
              // @ts-ignore
              if ((nestedAttributes.length - 1) === i) {
                UpdateExpression = UpdateExpression.slice(0, -1);
                UpdateExpression += ` = :${nestedAttribute} `;
                // @ts-ignore
                ExpressionAttributeValues[`:${nestedAttribute}`] = value;
              }
            });
          } else {
            const attributeName = attribute.charAt(0)
              .toUpperCase() + attribute.slice(1);
            UpdateExpression += `, #${attributeName} = :${attribute} `;
            // @ts-ignore
            ExpressionAttributeNames[`#${attributeName}`] = attributeName;
            // @ts-ignore
            ExpressionAttributeValues[`:${attribute}`] = value;
          }
        }
      });
      UpdateExpression = UpdateExpression.slice(0, -1);
    }

    if (addAttributes) {
      UpdateExpression += ' add ';
      Object.entries(attributes).map(([attribute, value]) => {
        const attributeName = attribute.charAt(0)
          .toUpperCase() + attribute.slice(1);
        UpdateExpression += ` #${attributeName} :${attribute} ,`;
        // @ts-ignore
        ExpressionAttributeNames[`#${attributeName}`] = attributeName;
        // @ts-ignore
        ExpressionAttributeValues[`:${attribute}`] = value;
      });
      UpdateExpression = UpdateExpression.slice(0, -1);
    }

    if (appendAttributes) {
      Object.entries(attributes).map(([attribute, value]) => {
        const attributeName = attribute.charAt(0)
          .toUpperCase() + attribute.slice(1);
        UpdateExpression += ` , ${attributeName} = list_append( #${attributeName}, :${attribute}) `;
        // @ts-ignore
        ExpressionAttributeNames[`#${attributeName}`] = attributeName;
        // @ts-ignore
        ExpressionAttributeValues[`:${attribute}`] = [value];
      });
      UpdateExpression = UpdateExpression.slice(0, -1);
    }

    if (removeAttributes) {
      UpdateExpression += ' remove ';
      Object.entries(removeAttributes).map(([attribute, value]) => {
        UpdateExpression += ` #${value} ,`;
        // @ts-ignore
        ExpressionAttributeNames[`#${value}`] = value;
      });
      UpdateExpression = UpdateExpression.slice(0, -1);
    }

    return {
      TableName: tableName,
      Key: {
        PK: pk,
        SK: sk,
      },
      UpdateExpression,
      ExpressionAttributeNames,
      ExpressionAttributeValues,
      ReturnValues: returnValues,
    };
  }

  create(params: CreateItemInterface, attributes: any) {
    const {
      tableName,
      pk,
      sk,
      recordType,
    } = params;

    const item = {
      PK: pk,
      SK: sk,
      RecordType: recordType,
      CreatedAt: Utils.getTimeStamp(),
    };
    Object.entries(attributes).map(([attribute, value]) => {
      if (attribute !== 'pk' && attribute !== 'sk' && value !== undefined) {
        const attributeName = attribute.charAt(0)
          .toUpperCase() + attribute.slice(1);
        // @ts-ignore
        item[attributeName] = value;
      }
    });
    return {
      Item: item,
      TableName: tableName,
    };
  }

  query(params: QueryItemInterface) {
    const {
      tableName,
      indexName,
      pk,
      sk,
      pkName,
      skName,
      condition,
      expressionAttributeNames,
      expressionAttributeValues,
      filterExpression,
      projectionExpression,
      scanIndexForward,
      conditionFrom,
      conditionTo,
      exclusiveStartKey,
      limit,
      excludeDeleted,
    } = params;

    const partitionKey = pkName.charAt(0)
      .toUpperCase() + pkName.slice(1);
    const sortKey = skName ? skName.charAt(0)
      .toUpperCase() + skName.slice(1) : undefined;

    let KeyConditionExpression = `#${partitionKey} = :${pkName}`;
    let FilterExpression = '';
    let ExclusiveStartKey;
    let ExpressionAttributeNames: any = expressionAttributeValues || {};
    const ExpressionAttributeValues: any = expressionAttributeValues || {};

    ExpressionAttributeNames[`#${partitionKey}`] = partitionKey;
    ExpressionAttributeValues[`:${pkName}`] = pk;

    if (excludeDeleted) {
      ExpressionAttributeNames = {
        '#DeletedAt': 'DeletedAt',
      };
      FilterExpression += 'attribute_not_exists(#DeletedAt)';
    }

    if (expressionAttributeNames) {
      ExpressionAttributeNames = { ...ExpressionAttributeNames, ...expressionAttributeNames };
    }

    if (sortKey) {
      ExpressionAttributeNames[`#${sortKey}`] = sortKey;
      ExpressionAttributeValues[`:${skName}`] = sk;
      KeyConditionExpression += ` and #${sortKey} = :${skName}`;
    }

    if (condition && condition === 'begins_with') {
      KeyConditionExpression = `#${partitionKey} = :${pkName} and begins_with(#${sortKey}, :${skName}) `;
    }

    if (condition && condition === 'greater') {
      KeyConditionExpression = `#${partitionKey} = :${pkName} and #${sortKey} > :${skName} `;
    }

    if (condition && condition === 'between') {
      ExpressionAttributeValues[':conditionFrom'] = conditionFrom;
      ExpressionAttributeValues[':conditionTo'] = conditionTo;
      KeyConditionExpression = `#${partitionKey} = :${pkName} and #${sortKey} BETWEEN :conditionFrom AND :conditionTo `;
      delete ExpressionAttributeValues[`:${sortKey}`];
    }

    if (exclusiveStartKey) {
      ExclusiveStartKey = JSON.parse(Buffer.from(exclusiveStartKey, 'base64')
        .toString('utf-8'));
    }

    if (filterExpression) {
      FilterExpression += ` and ${filterExpression} `;
    }

    return {
      TableName: tableName,
      KeyConditionExpression,
      ExpressionAttributeNames,
      ExpressionAttributeValues,
      FilterExpression,
      IndexName: indexName,
      ScanIndexForward: scanIndexForward === undefined ? false : scanIndexForward,
      ProjectionExpression: projectionExpression,
      ExclusiveStartKey,
      Limit: limit,
    };
  }

  get(params: GetItemInterface) {
    const {
      pk,
      sk,
      tableName,
      projectionExpression,
      expressionAttributeNames,
    } = params;

    const Key: any = {
      PK: pk,
    };
    if (sk) {
      Key.SK = sk;
    }

    return {
      TableName: tableName,
      Key,
      ProjectionExpression: projectionExpression,
      ExpressionAttributeNames: expressionAttributeNames,
    };
  }

  deleteItem(params: DeleteItemInterface) {
    const {
      pk,
      sk,
      tableName,
    } = params;

    return {
      TableName: tableName,
      Key: {
        PK: pk,
        SK: sk,
      },
    };
  }

  softDelete(params: DeleteItemInterface) {
    const {
      pk,
      sk,
      tableName,
    } = params;

    const UpdateExpression = 'set #DeletedAt = :deletedAt , #Status = :status  ';

    const ExpressionAttributeNames = {
      '#DeletedAt': 'DeletedAt',
      '#Status': 'Status',
    };
    const ExpressionAttributeValues = {
      ':deletedAt': Utils.getTimeStamp(),
      ':status': STATUS_DELETED,
    };
    return {
      TableName: tableName,
      Key: {
        PK: pk,
        SK: sk,
      },
      UpdateExpression,
      ExpressionAttributeNames,
      ExpressionAttributeValues,
    };
  }

  batchCreate(params: CreateBatchItemInterface, items: Array<any>) {
    const {
      tableName,
      recordType,
    } = params;
    const requestItems: Array<any> = [];
    items.map((item: any) => {
      const {
        pk,
        sk,
        attributes,
      } = item;

      const batchItem = {
        PK: pk,
        SK: sk,
        RecordType: recordType,
        CreatedAt: Utils.getTimeStamp(),
      };

      Object.entries(attributes).map(([attribute, value]) => {
        if (attribute !== 'pk' && attribute !== 'sk') {
          const attributeName = attribute.charAt(0)
            .toUpperCase() + attribute.slice(1);
          // @ts-ignore
          batchItem[attributeName] = value;
        }
      });
      requestItems.push({
        PutRequest: {
          Item: batchItem,
        },
      });
    });

    return {
      RequestItems: {
        [tableName]: requestItems,
      },
    };
  }

  batchGet(params: BatchGetItemInterface) {
    const {
      tableName,
      keys,
    } = params;
    const Keys: Array<any> = [];
    Keys.map((key: any) => {
      const {
        pk,
        sk,
      } = key;
      Keys.push({
        PK: pk,
        SK: sk,
      });
    });

    return {
      RequestItems: {
        [tableName]: {
          Keys,
        },
      },
    };
  }
}

export default QueryHelper;
