import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import sequelize, { Op } from 'sequelize';
import { CollectionFilters } from '../utils';

@Injectable()
export class ParseCollectionQueryPipe implements PipeTransform {
    transform(value: CollectionFilters, metadata: ArgumentMetadata) {
        const parsedQuery = {};

        Object.keys(value).forEach((key) => {
            switch (key) {
                case 'ids':
                    if (!value.ids) break;
                    parsedQuery['id'] = value.ids.split(',')
                    break;
                case 'status':
                    if (value.status === 'any') break;
                    parsedQuery['status'] = value.status
                    break;
                case 'limit':
                    parsedQuery['limit'] = Number(value.limit)
                    break;
                case 'offset':
                    parsedQuery['offset'] = Number(value.offset)
                    break;
                case 'creator_id':
                    if (Number(value.creator_id)) {
                        parsedQuery['creator_id'] = Number(value.creator_id)
                    }
                    break;
                case 'search_string':
                    parsedQuery[Op.or] = [
                        sequelize.where(sequelize.fn('LOWER', sequelize.col('name')), { [Op.like]: `%${value.search_string.toLowerCase()}%` }),
                        sequelize.where(sequelize.fn('LOWER', sequelize.col('description')), { [Op.like]: `%${value.search_string.toLowerCase()}%` }),
                    ]
                    break;
                case 'farm_id':
                    if (Number(value.farm_id) > 0) {
                        parsedQuery['farm_id'] = Number(value.farm_id)
                    }
                    break;
                case 'from_timestamp':
                    if (value.from_timestamp <= 0) break;
                    parsedQuery['createdAt'] = {
                        [Op.gt]: Number(value.from_timestamp),
                    }
                    break;
                case 'to_timestamp':
                    if (value.to_timestamp <= 0) break;
                    parsedQuery['createdAt'] = {
                        [Op.lt]: Number(value.to_timestamp),
                    }
                    break;
                case 'order_by':
                    parsedQuery['order_by'] = Number(value.order_by)
                    break;
                default:
                    break;
            }
        });

        return parsedQuery;
    }
}
