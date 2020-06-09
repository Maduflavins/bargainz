import { getAuctionById} from './getAuction';
import { uploadPictureToS3 } from '../lib/uploadPictureToS3';
import middy from '@middy/core'
import validator from '@middy/validator';
import httpErrorHandler from '@middy/http-error-handler'
import createError from 'http-errors'
import { setAuctionPictureUrl } from '../lib/setAuctionPictureUrl'
import uploadAuctionPictureSchema from '../lib/schemas/uploadAuctionPictureSchema'
import cors from '@middy/http-cors'

export async function uploadAuctionPicture(event){

    const { id } = event.pathParameters
    const { email } =  event.requestContext.authorizer
    const auction = await getAuctionById(id);
    const base64 = event.body.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64, 'base64');

    let updatedAuction;

    //validate seller
    if(auction.seller !== email){
        throw new createError.Forbidden(`You are not the seller of this item`)
    }
    

    try{
        const pictureUrl = await uploadPictureToS3(auction.id + '.jpg', buffer);
        updatedAuction = await setAuctionPictureUrl(auction.id, pictureUrl);
        console.log(updatedAuction)

    }catch(error){
        console.error(error)
        throw new createError.InternalServerError(error)
    }

    

    return{
        statusCode: 200,
        headers:{
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true

        },
        body: JSON.stringify(updatedAuction)
    }

}
export const handler = middy(uploadAuctionPicture)
    .use(httpErrorHandler())
    .use(validator({ inputSchema: uploadAuctionPictureSchema}))
    .use(cors());