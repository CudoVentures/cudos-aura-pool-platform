import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import sequelize, { Op } from 'sequelize';
import { FarmStatus } from '../models/farm.model';
import { FarmFilters } from '../utils';

@Injectable()
export class ParseFarmQueryPipe implements PipeTransform {
    transform(value: FarmFilters, metadata: ArgumentMetadata) {
        const parsedQuery = {};

        Object.keys(value).forEach((key) => {
            switch (key) {
                case 'ids':
                    parsedQuery['id'] = value.ids.split(',')
                    break;
                case 'status':
                    parsedQuery['status'] = value.status
                    break;
                case 'search_string':
                    parsedQuery[Op.or] = [
                        sequelize.where(sequelize.fn('LOWER', sequelize.col('name')), { [Op.like]: `%${value.search_string.toLowerCase()}%` }),
                        sequelize.where(sequelize.fn('LOWER', sequelize.col('description')), { [Op.like]: `%${value.search_string.toLowerCase()}%` }),
                    ]
                    break;
                case 'limit':
                    parsedQuery['limit'] = Number(value.limit)
                    break;
                case 'offset':
                    parsedQuery['offset'] = Number(value.offset)
                    break;
                case 'creator_id':
                    parsedQuery['creator_id'] = Number(value.creator_id)
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
