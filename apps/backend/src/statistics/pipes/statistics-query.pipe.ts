import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { CollectionStatisticsFilters, NFTStatisticsFilters } from '../utils';

@Injectable()
export class ParseStatisticsQueryPipe implements PipeTransform {
  transform(
    value: NFTStatisticsFilters | CollectionStatisticsFilters,
    metadata: ArgumentMetadata,
  ) {
    const parsedQuery = {};

    Object.keys(value).map((key) => {
      if (key === 'from' || key === 'to') {
        parsedQuery[key] = new Date(value[key]);
      } else if (key === 'collection_id') {
        parsedQuery[key] = Number(value[key]);
      } else {
        parsedQuery[key] = value[key];
      }
    });

    return parsedQuery;
  }
}
