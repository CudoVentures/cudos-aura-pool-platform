import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { NftFilters } from '../utils';

@Injectable()
export class ParseNftQueryPipe implements PipeTransform {
    transform(value: NftFilters, metadata: ArgumentMetadata) {
        const parsedQuery = {};

        Object.keys(value).map((key) => {
            switch (key) {
                case 'ids':
                    if (!value.ids) break;
                    parsedQuery['id'] = value.ids.split(',');
                    break
                case 'collection_ids':
                    if (!value.collection_ids) break;
                    parsedQuery['collection_id'] = value.collection_ids.split(',').map((id) => parseInt(id));
                    break;
                case 'status':
                    parsedQuery['status'] = value.status;
                    break;
                default:
                    break;
            }
        });

        return parsedQuery;
    }
}
