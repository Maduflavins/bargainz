import AWS from 'aws-sdk'


const dynamodb = new AWS.DynamoDB.DocumentClient()

export async function getEndedAuction(){
    const now = new Date()

    const params = {
        TableName: process.env.AUCTION_TABLE_NAME,
        IndexName: 'statusAndEndDate',
        KeyConditionExpression: '#status = :status AND endingAt <= :now',
        ExpressionAttributeValues:{
            'status': 'OPEN',
            ':now': now.toISOString(),
        },
        ExpressionAttributeNames:{
            '#status': 'status',
        }
    }

    const result = await dynamodb.query(params).promise()
    return result.Items;
}