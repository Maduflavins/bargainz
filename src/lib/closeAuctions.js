import AWS, { DynamoDB } from 'aws-sdk'

const dynamodb = new AWS.DynamoDB.DocumentClient()
const sqs = new AWS.SQS();
export async function closeAuction(auction){
    const params = {
        TableName: process.env.AUCTIONS_TABLE_NAME,
        Key: { id: auction.id},
        UpdateExpression:'set #status = :status',
        ExpressionAttributeValues:{
            ':status': 'CLOSED',
        },
        ExpressionAttributeNames: {
            '#status': 'status',
        },
    };

    await dynamodb.update(params).promise();

    const { title, seller, highestBid } = auction;
    const { amount, bidder } = highestBid;

    if(amount === 0){
        await sqs.sendMessage({
            QueueUrl: process.env.MAIL_QUEUE_URL,
            MessageBody: JSON.stringify({
                subject: 'No Bids on your auctionitem',
                receipient: seller,
                body: `Your item ${title} got no bidder`
            }),
            
        }).promise();
        return;
    }

    const notifySeller = sqs.sendMessage({
        QueueUrl: process.env.MAIL_QUEUE_URL,
        MessageBody: JSON.stringify({
            subject: 'Your item has been sold',
            receipient: 'seller',
            body: ` Wow Your item ${title} has been sold for NGN${amount}`,
        })
    }).promise();
    const notifyBidder = sqs.sendMessage({
        QueueUrl: process.env.MAIL_QUEUE_URL,
        MessageBody: JSON.stringify({
            subject: 'You won an auction',
            receipient: 'bidder',
            body: `Congratulations you just got yourself a ${title} for ${amount}`,
        })
    }).promise();

    return Promise.all([notifySeller, notifyBidder]);
    
}