import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { CollectionFilters } from '../utils';

@Injectable()
export class ParseCollectionQueryPipe implements PipeTransform {
    transform(value: CollectionFilters, metadata: ArgumentMetadata) {
        const parsedQuery = {};

        Object.keys(value).forEach((key) => {
            switch (key) {
                case 'ids':
                    parsedQuery['id'] = value.ids.split(',')
                    break;
                case 'status':
                    parsedQuery['status'] = value.status
                    break;
                case 'limit':
                    parsedQuery['limit'] = Number(value.limit)
                    break;
                case 'offset':
                    parsedQuery['offset'] = Number(value.offset)
                    break;
                case 'creator_id':
                    parsedQuery['id'] = Number(value.creator_id)
                    break;
                default:
                    break;
            }
        });

        return parsedQuery;
    }
}
