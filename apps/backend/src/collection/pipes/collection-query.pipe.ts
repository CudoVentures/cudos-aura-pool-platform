import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
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
                case 'farm_id':
                    if (Number(value.farm_id) > 0) {
                        parsedQuery['farm_id'] = Number(value.farm_id)
                    }
                    break;
                default:
                    break;
            }
        });

        return parsedQuery;
    }
}
