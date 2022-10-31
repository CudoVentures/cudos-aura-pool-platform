import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { FarmStatus } from '../farm.model';
import { FarmFilters } from '../utils';

const statusMap = [FarmStatus.QUEUED, FarmStatus.APPROVED, FarmStatus.REJECTED]
@Injectable()
export class ParseFarmQueryPipe implements PipeTransform {
    transform(value: FarmFilters, metadata: ArgumentMetadata) {
        const parsedQuery = {};

        Object.keys(value).map((key) => {
            if (key === 'ids') {
                parsedQuery['id'] = value[key].split(',');
            } else if (key === 'status') {
                parsedQuery[key] = statusMap[value[key] - 1]
            } else {
                parsedQuery[key] = value[key];
            }
        });

        return parsedQuery;
    }
}
