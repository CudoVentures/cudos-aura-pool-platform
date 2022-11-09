import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { NftFilters } from '../utils';

@Injectable()
export class ParseNftQueryPipe implements PipeTransform {
    transform(value: NftFilters, metadata: ArgumentMetadata) {
        const parsedQuery = {};

        Object.keys(value).map((key) => {
            switch (key) {
                case 'ids':
                    parsedQuery['id'] = value.ids.split(',');
                    break
                case 'collection_ids':
                    parsedQuery['collection_id'] = value.collection_ids.split(',');
                    break;
                default:
                    break;
            }
        });

        return parsedQuery;
    }
}
