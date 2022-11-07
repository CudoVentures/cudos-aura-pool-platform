import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { NftFilters } from '../utils';

@Injectable()
export class ParseNftQueryPipe implements PipeTransform {
    transform(value: NftFilters, metadata: ArgumentMetadata) {
        const parsedQuery = {};

        Object.keys(value).map((key) => {
            if (key !== 'id') {
                parsedQuery['id'] = value.ids.split(',');
            } else {
                parsedQuery['collection_id'] = value.collection_id;
            }
        });

        return parsedQuery;
    }
}
