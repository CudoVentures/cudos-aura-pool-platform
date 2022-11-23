// import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
// import sequelize, { Op } from 'sequelize';
// import NftFilterModel from '../dto/nft-filter.model';

// @Injectable()
// export class ParseNftQueryPipe implements PipeTransform {
//     transform(value: NftFilterModel, metadata: ArgumentMetadata) {
//         const parsedQuery = {};

//         Object.keys(value).forEach((key) => {
//             switch (key) {
//                 case 'ids':
//                     if (!value.ids) break;
//                     parsedQuery['id'] = value.ids.split(',');
//                     break
//                 case 'collection_ids':
//                     if (!value.collection_ids) break;
//                     parsedQuery['collection_id'] = value.collection_ids.split(',').map((id) => parseInt(id));
//                     break;
//                 case 'collectionStatus':
//                     parsedQuery['collectionStatus'] = value.collectionStatus;
//                     break;
//                 case 'search_string':
//                     parsedQuery[Op.or] = [
//                         sequelize.where(sequelize.fn('LOWER', sequelize.col('name')), { [Op.like]: `%${value.search_string.toLowerCase()}%` }),
//                     ]
//                     break;
//                 case 'order_by':
//                     parsedQuery['order_by'] = Number(value.order_by)
//                     break;
//                 default:
//                     break;
//             }
//         });

//         return parsedQuery;
//     }
// }
