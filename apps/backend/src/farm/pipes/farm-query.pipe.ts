import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { FarmStatus } from '../farm.model';
import { FarmFilters } from '../utils';

const statusMap = [FarmStatus.APPROVED, FarmStatus.QUEUED, FarmStatus.REJECTED]

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
                    parsedQuery['status'] = statusMap[Number(value.status) - 1]
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
                default:
                    break;
            }
        });

        return parsedQuery;
    }
}
