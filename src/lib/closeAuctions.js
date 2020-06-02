import AWS, { DynamoDB } from 'aws-sdk'

const dynamodb = new AWS.DynamoDB.DocumentClient()
export async function closeAuction(auction){
    const params = {
        TableName: process.env.AUCTIONS_TABLE_NAME,
        key: { id: auction.id},
        UpdateExpression:'set #status = :status',
        ExpressionAttributeValues:{
            ':status': 'CLOSED',
        },
        ExpressionAttributeNames: {
            '#status': 'status',
        },
    };

    const result = await dynamodb.update(params).promise();
    return result;
}