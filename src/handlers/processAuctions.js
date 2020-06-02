import { getEndedAuctions } from '../lib/getEndedAuctions';
import { closeAuction } from '../lib/closeAuctions';
import createHttpError from 'http-errors';

async function processAuctions(event, context){

    try {
    const auctionsToClose = await getEndedAuctions
    const closedPromises = auctionsToClose.map(auction => closeAuction(auction));
    await Promise.all(closedPromises);

    return{closed: closedPromises.length}

    } catch (error) {
        console.error(error)
        throw new createHttpError.InternalServerError(error)
        
    }  

}

export const handler = processAuctions